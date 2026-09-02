/**
 * Estado Global e Camada Reativa da Aplicação Zenith.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as db from "./storage";
import { DEFAULT_CATEGORIES } from "./types";
import type { AppData, Category, Goal, GoalDraft, GoalTarget, Task, TaskDraft } from "./types";

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

  // Ações de Tarefas
  addTask: (draft: TaskDraft) => void;
  editTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void; // Soft delete
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  removeSubTask: (taskId: string, subTaskId: string) => void;

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
  permanentDeleteTask: (id: string) => void;
  permanentDeleteGoal: (id: string) => void;
  emptyTrash: () => void;

  // Ações de Categorias
  addCategory: (name: string, color: string) => void;
  editCategory: (id: string, name: string, color: string) => void;
  removeCategory: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    tasks: [],
    goals: [],
    categories: DEFAULT_CATEGORIES,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(db.loadData());
    setReady(true);
  }, []);

  const commit = useCallback((next: AppData) => {
    setData(next);
    db.saveData(next);
  }, []);

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

    // Tarefas
    addTask: (draft) => commit(db.createTask(data, draft)),
    editTask: (id, patch) => commit(db.updateTask(data, id, patch)),
    toggleTask: (id) => commit(db.toggleTask(data, id)),
    removeTask: (id) => commit(db.softDeleteTask(data, id)),
    addSubTask: (taskId, title) => commit(db.addSubTask(data, taskId, title)),
    toggleSubTask: (taskId, subTaskId) => commit(db.toggleSubTask(data, taskId, subTaskId)),
    removeSubTask: (taskId, subTaskId) => commit(db.removeSubTask(data, taskId, subTaskId)),

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
