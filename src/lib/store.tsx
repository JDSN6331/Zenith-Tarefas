/**
 * Estado Global e Camada Reativa da Aplicação Zenith.
 * Suporta persistência otimista e sincronização em tempo real com PostgreSQL.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as db from "./storage";
import { DEFAULT_CATEGORIES } from "./types";
import type { AppData, Category, Goal, GoalDraft, GoalTarget, Task, TaskDraft } from "./types";
import { useAuth } from "./auth";
import { apiClient } from "./api-client";

interface StoreValue {
  // Dados ativos
  tasks: Task[];
  goals: Goal[];
  categories: Category[];
  // Dados na lixeira
  trashTasks: Task[];
  trashGoals: Goal[];
  trashCount: number;
  ready: boolean;
  isSyncing: boolean;
  refreshData: () => Promise<void>;

  // Ações de Tarefas
  addTask: (draft: TaskDraft) => void;
  editTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void; // Soft delete
  batchUpdateTasks: (ids: string[], patch: Partial<Task>) => void;
  batchRemoveTasks: (ids: string[]) => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  removeSubTask: (taskId: string, subTaskId: string) => void;
  reorderSubtasks: (taskId: string, subtasks: SubTask[]) => void;

  // Ações de Metas & Alvos ClickUp
  addGoal: (draft: GoalDraft) => void;
  editGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void; // Soft delete
  addGoalTarget: (goalId: string, target: Omit<GoalTarget, "id" | "createdAt">) => void;
  updateGoalTarget: (goalId: string, targetId: string, patch: Partial<GoalTarget>) => void;
  removeGoalTarget: (goalId: string, targetId: string) => void;

  // Ações de Lixeira
  restoreTask: (id: string) => void;
  restoreGoal: (id: string) => void;
  permanentDeleteTask: (id: string) => Promise<void>;
  permanentDeleteGoal: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;

  // Ações de Categorias
  addCategory: (name: string, color: string) => void;
  editCategory: (id: string, name: string, color: string) => void;
  removeCategory: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AppData>({
    tasks: [],
    goals: [],
    categories: DEFAULT_CATEGORIES,
  });
  const [ready, setReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Carrega os dados do PostgreSQL quando o usuário estiver autenticado
  const refreshData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setReady(true);
      return;
    }

    setIsSyncing(true);
    try {
      const serverData = await apiClient.fetchData();
      if (serverData) {
        setData(serverData);
        db.saveData(serverData);
      } else {
        // Fallback local se o servidor estiver temporariamente inacessível
        const local = db.loadData();
        setData(local);
      }
    } catch (err) {
      console.error("Erro ao sincronizar com PostgreSQL:", err);
      const local = db.loadData();
      setData(local);
    } finally {
      setIsSyncing(false);
      setReady(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    } else {
      setData({
        tasks: [],
        goals: [],
        categories: DEFAULT_CATEGORIES,
      });
      setReady(true);
    }
  }, [isAuthenticated, user, refreshData]);

  // Atualização otimista na tela + sincronização no PostgreSQL em background
  const commit = useCallback(
    async (next: AppData) => {
      setData(next);
      db.saveData(next);

      if (isAuthenticated && user) {
        try {
          await apiClient.syncData(next);
        } catch (err) {
          console.error("Falha ao sincronizar dados com PostgreSQL:", err);
        }
      }
    },
    [isAuthenticated, user]
  );

  // Separação entre itens ativos e itens na lixeira
  const activeTasks = data.tasks.filter((t) => !t.deletedAt);
  const activeGoals = data.goals.filter((g) => !g.deletedAt);
  const trashTasks = data.tasks.filter((t) => !!t.deletedAt);
  const trashGoals = data.goals.filter((g) => !!g.deletedAt);
  const trashCount = trashTasks.length + trashGoals.length;

  const value: StoreValue = {
    tasks: activeTasks,
    goals: activeGoals,
    categories: data.categories,
    trashTasks,
    trashGoals,
    trashCount,
    ready,
    isSyncing,
    refreshData,

    // Tarefas
    addTask: (draft) => commit(db.createTask(data, draft)),
    editTask: (id, patch) => commit(db.updateTask(data, id, patch)),
    toggleTask: (id) => commit(db.toggleTask(data, id)),
    removeTask: (id) => commit(db.softDeleteTask(data, id)),
    batchUpdateTasks: (ids, patch) => commit(db.batchUpdateTasks(data, ids, patch)),
    batchRemoveTasks: (ids) => commit(db.batchSoftDeleteTasks(data, ids)),
    addSubTask: (taskId, title) => commit(db.addSubTask(data, taskId, title)),
    toggleSubTask: (taskId, subTaskId) => commit(db.toggleSubTask(data, taskId, subTaskId)),
    removeSubTask: (taskId, subTaskId) => commit(db.removeSubTask(data, taskId, subTaskId)),
    reorderSubtasks: (taskId, subtasks) => commit(db.reorderSubtasks(data, taskId, subtasks)),

    // Metas & Alvos ClickUp
    addGoal: (draft) => commit(db.createGoal(data, draft)),
    editGoal: (id, patch) => commit(db.updateGoal(data, id, patch)),
    removeGoal: (id) => commit(db.softDeleteGoal(data, id)),
    addGoalTarget: (goalId, target) => commit(db.addGoalTarget(data, goalId, target)),
    updateGoalTarget: (goalId, targetId, patch) =>
      commit(db.updateGoalTarget(data, goalId, targetId, patch)),
    removeGoalTarget: (goalId, targetId) => commit(db.removeGoalTarget(data, goalId, targetId)),

    // Lixeira
    restoreTask: (id) => commit(db.restoreTask(data, id)),
    restoreGoal: (id) => commit(db.restoreGoal(data, id)),
    permanentDeleteTask: (id) => commit(db.permanentDeleteTask(data, id)),
    permanentDeleteGoal: (id) => commit(db.permanentDeleteGoal(data, id)),
    emptyTrash: () => commit(db.emptyTrash(data)),

    // Categorias
    addCategory: (name, color) => commit(db.createCategory(data, name, color)),
    editCategory: (id, name, color) => commit(db.updateCategory(data, id, name, color)),
    removeCategory: (id) => commit(db.deleteCategory(data, id)),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de <StoreProvider>");
  return ctx;
}
