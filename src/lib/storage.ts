/**
 * Camada de dados do Zenith: CRUD unificado com persistência local e fallback robusto.
 */
import { DEFAULT_CATEGORIES } from "./types";
import type {
  AppData,
  Category,
  Goal,
  GoalDraft,
  GoalTarget,
  SubTask,
  Task,
  TaskDraft,
} from "./types";
import { calculateNextDueDate } from "./utils-domain";

const STORAGE_KEY = "zenith.app.data.v1";
const LEGACY_AURA_KEY = "aura.app.data.v2";

const EMPTY: AppData = {
  tasks: [],
  goals: [],
  categories: DEFAULT_CATEGORIES,
};

const isBrowser = (): boolean => typeof window !== "undefined";

const uid = (): string =>
  isBrowser() && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function loadData(): AppData {
  if (!isBrowser()) return EMPTY;
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Fallback para chave Aura
      raw = window.localStorage.getItem(LEGACY_AURA_KEY);
    }
    if (!raw) {
      // Migração da v1 legada se existir
      const oldRaw = window.localStorage.getItem("focus.app.data.v1");
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        return {
          tasks: (oldParsed.tasks || []).map((t: Record<string, any>) => ({
            ...t,
            subtasks: t["subtasks"] || [],
            recurrence: t["recurrence"] || { frequency: "none" },
            status: t["done"] ? "completed" : "pending",
            deletedAt: null,
            categoryId: typeof t["category"] === "string" ? t["category"].toLowerCase() : "pessoal",
          })),
          goals: (oldParsed.goals || []).map((g: Record<string, any>) => ({
            ...g,
            targets: g["targets"] || [],
            deletedAt: null,
            categoryId: typeof g["category"] === "string" ? g["category"] : "pessoal",
          })),
          categories: DEFAULT_CATEGORIES,
        };
      }
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES,
    };
  } catch {
    return EMPTY;
  }
}

export function saveData(data: AppData): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ==================== TAREFAS ==================== */

export function createTask(data: AppData, draft: TaskDraft): AppData {
  const isDone = draft.done === true || draft.status === "completed";
  const now = new Date().toISOString();
  const task: Task = {
    ...draft,
    id: uid(),
    done: isDone,
    status: isDone ? "completed" : draft.status || "pending",
    recurrence: draft.recurrence || { frequency: "none" },
    subtasks: (draft.subtasks || []).map((st) => ({
      ...st,
      done: isDone ? true : st.done,
    })),
    createdAt: now,
    completedAt: isDone ? now : null,
    deletedAt: null,
  };
  return { ...data, tasks: [task, ...data.tasks] };
}

export function updateTask(data: AppData, id: string, patch: Partial<Task>): AppData {
  const now = new Date().toISOString();
  return {
    ...data,
    tasks: data.tasks.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, ...patch };

      if (patch.status !== undefined) {
        if (patch.status === "completed") {
          updated.done = true;
          updated.completedAt = updated.completedAt || now;
          updated.subtasks = updated.subtasks.map((st) => ({ ...st, done: true }));
        } else {
          updated.done = false;
          updated.completedAt = null;
        }
      } else if (patch.done !== undefined) {
        updated.done = patch.done;
        updated.status = patch.done
          ? "completed"
          : updated.status === "completed"
            ? "pending"
            : updated.status;
        updated.completedAt = patch.done ? (updated.completedAt || now) : null;
        if (patch.done) {
          updated.subtasks = updated.subtasks.map((st) => ({ ...st, done: true }));
        }
      }

      return updated;
    }),
  };
}

export function toggleTask(data: AppData, id: string): AppData {
  const targetTask = data.tasks.find((t) => t.id === id);
  if (!targetTask) return data;

  const nextDone = !targetTask.done;
  const now = new Date().toISOString();

  let nextTasks = data.tasks.map((t) => {
    if (t.id !== id) return t;
    return {
      ...t,
      done: nextDone,
      status: nextDone ? ("completed" as const) : ("pending" as const),
      completedAt: nextDone ? now : null,
      // Se concluiu a tarefa mãe, marca todas as subtarefas como concluídas
      subtasks: nextDone ? t.subtasks.map((st) => ({ ...st, done: true })) : t.subtasks,
    };
  });

  // Se concluiu uma tarefa recorrente, cria a próxima ocorrência
  if (nextDone && targetTask.recurrence && targetTask.recurrence.frequency !== "none") {
    const nextDueDate = calculateNextDueDate(targetTask.dueDate, targetTask.recurrence.frequency);
    const recurringTask: Task = {
      ...targetTask,
      id: uid(),
      done: false,
      status: targetTask.recurrence.nextStatus || "pending",
      dueDate: nextDueDate,
      createdAt: now,
      completedAt: null,
      deletedAt: null,
      // Reseta subtarefas para a nova ocorrência
      subtasks: targetTask.subtasks.map((st) => ({
        ...st,
        id: uid(),
        done: false,
        createdAt: now,
      })),
    };
    nextTasks = [recurringTask, ...nextTasks];
  }

  return { ...data, tasks: nextTasks };
}

export function addSubTask(data: AppData, taskId: string, title: string): AppData {
  const newSubTask: SubTask = {
    id: uid(),
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...data,
    tasks: data.tasks.map((t) =>
      t.id === taskId
        ? { ...t, subtasks: [...t.subtasks, newSubTask], status: t.done ? t.status : "in_progress" }
        : t,
    ),
  };
}

export function toggleSubTask(data: AppData, taskId: string, subTaskId: string): AppData {
  const now = new Date().toISOString();
  return {
    ...data,
    tasks: data.tasks.map((t) => {
      if (t.id !== taskId) return t;
      const nextSubtasks = t.subtasks.map((st) =>
        st.id === subTaskId ? { ...st, done: !st.done } : st,
      );
      const allDone = nextSubtasks.length > 0 && nextSubtasks.every((st) => st.done);
      const anyDone = nextSubtasks.some((st) => st.done);

      return {
        ...t,
        subtasks: nextSubtasks,
        done: allDone,
        completedAt: allDone ? (t.completedAt || now) : null,
        status: allDone ? "completed" : anyDone ? "in_progress" : "pending",
      };
    }),
  };
}

export function removeSubTask(data: AppData, taskId: string, subTaskId: string): AppData {
  return {
    ...data,
    tasks: data.tasks.map((t) =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subTaskId) } : t,
    ),
  };
}

/* ==================== METAS & ALVOS CLICKUP ==================== */

export function createGoal(data: AppData, draft: GoalDraft): AppData {
  const goal: Goal = {
    ...draft,
    id: uid(),
    targets: draft.targets || [],
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };
  return { ...data, goals: [goal, ...data.goals] };
}

export function updateGoal(data: AppData, id: string, patch: Partial<Goal>): AppData {
  return { ...data, goals: data.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) };
}

export function addGoalTarget(
  data: AppData,
  goalId: string,
  target: Omit<GoalTarget, "id" | "createdAt">,
): AppData {
  const isBool = target.type === "boolean";
  const newTarget: GoalTarget = {
    ...target,
    id: uid(),
    startValue: isBool ? 0 : target.startValue,
    currentValue: isBool ? (target.completed ? 1 : 0) : target.currentValue,
    targetValue: isBool ? 1 : target.targetValue,
    completed: isBool ? !!target.completed : target.currentValue >= target.targetValue,
    createdAt: new Date().toISOString(),
  };

  return {
    ...data,
    goals: data.goals.map((g) =>
      g.id === goalId ? { ...g, targets: [...g.targets, newTarget] } : g,
    ),
  };
}

export function updateGoalTarget(
  data: AppData,
  goalId: string,
  targetId: string,
  patch: Partial<GoalTarget>,
): AppData {
  return {
    ...data,
    goals: data.goals.map((g) => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        targets: g.targets.map((t) => {
          if (t.id !== targetId) return t;
          const updated = { ...t, ...patch };
          if (updated.type === "boolean") {
            if (patch.completed !== undefined) {
              updated.completed = !!patch.completed;
            }
            updated.currentValue = updated.completed ? 1 : 0;
            updated.targetValue = 1;
            updated.startValue = 0;
          } else if (patch.currentValue !== undefined) {
            updated.completed = updated.currentValue >= updated.targetValue;
          }
          return updated;
        }),
      };
    }),
  };
}

export function removeGoalTarget(data: AppData, goalId: string, targetId: string): AppData {
  return {
    ...data,
    goals: data.goals.map((g) =>
      g.id === goalId ? { ...g, targets: g.targets.filter((t) => t.id !== targetId) } : g,
    ),
  };
}

/* ==================== SOFT-DELETE / LIXEIRA ==================== */

export function softDeleteTask(data: AppData, id: string): AppData {
  return {
    ...data,
    tasks: data.tasks.map((t) => (t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t)),
  };
}

export function restoreTask(data: AppData, id: string): AppData {
  return {
    ...data,
    tasks: data.tasks.map((t) => (t.id === id ? { ...t, deletedAt: null } : t)),
  };
}

export function permanentDeleteTask(data: AppData, id: string): AppData {
  return { ...data, tasks: data.tasks.filter((t) => t.id !== id) };
}

export function softDeleteGoal(data: AppData, id: string): AppData {
  return {
    ...data,
    goals: data.goals.map((g) => (g.id === id ? { ...g, deletedAt: new Date().toISOString() } : g)),
  };
}

export function restoreGoal(data: AppData, id: string): AppData {
  return {
    ...data,
    goals: data.goals.map((g) => (g.id === id ? { ...g, deletedAt: null } : g)),
  };
}

export function permanentDeleteGoal(data: AppData, id: string): AppData {
  return {
    ...data,
    goals: data.goals.filter((g) => g.id !== id),
    tasks: data.tasks.map((t) => (t.goalId === id ? { ...t, goalId: null } : t)),
  };
}

export function emptyTrash(data: AppData): AppData {
  return {
    ...data,
    tasks: data.tasks.filter((t) => !t.deletedAt),
    goals: data.goals.filter((g) => !g.deletedAt),
  };
}

/* ==================== CATEGORIAS ==================== */

export function createCategory(data: AppData, name: string, color: string): AppData {
  const newCat: Category = {
    id: name.toLowerCase().replace(/\s+/g, "-") + "-" + uid().slice(0, 4),
    name: name.trim(),
    color,
    isDefault: false,
    createdAt: new Date().toISOString(),
  };
  return { ...data, categories: [...data.categories, newCat] };
}

export function updateCategory(data: AppData, id: string, name: string, color: string): AppData {
  return {
    ...data,
    categories: data.categories.map((c) => (c.id === id ? { ...c, name: name.trim(), color } : c)),
  };
}

export function deleteCategory(data: AppData, id: string): AppData {
  return {
    ...data,
    categories: data.categories.filter((c) => c.id !== id),
    tasks: data.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: "pessoal" } : t)),
    goals: data.goals.map((g) => (g.categoryId === id ? { ...g, categoryId: "pessoal" } : g)),
  };
}
