/**
 * Camada de dados: CRUD puro sobre o localStorage.
 * Nenhuma manipulação de DOM/UI acontece aqui.
 */
import type { AppData, Goal, GoalDraft, Task, TaskDraft } from "./types";

const STORAGE_KEY = "focus.app.data.v1";

const EMPTY: AppData = { tasks: [], goals: [] };

const isBrowser = (): boolean => typeof window !== "undefined";

const uid = (): string =>
  isBrowser() && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function loadData(): AppData {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    };
  } catch {
    return EMPTY;
  }
}

export function saveData(data: AppData): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ---------- Tarefas ---------- */

export function createTask(data: AppData, draft: TaskDraft): AppData {
  const task: Task = {
    ...draft,
    done: draft.done ?? false,
    id: uid(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  return { ...data, tasks: [task, ...data.tasks] };
}

export function updateTask(data: AppData, id: string, patch: Partial<Task>): AppData {
  return {
    ...data,
    tasks: data.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  };
}

export function toggleTask(data: AppData, id: string): AppData {
  return {
    ...data,
    tasks: data.tasks.map((t) =>
      t.id === id
        ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null }
        : t,
    ),
  };
}

export function deleteTask(data: AppData, id: string): AppData {
  return { ...data, tasks: data.tasks.filter((t) => t.id !== id) };
}

/* ---------- Metas ---------- */

export function createGoal(data: AppData, draft: GoalDraft): AppData {
  const goal: Goal = { ...draft, id: uid(), createdAt: new Date().toISOString() };
  return { ...data, goals: [goal, ...data.goals] };
}

export function updateGoal(data: AppData, id: string, patch: Partial<Goal>): AppData {
  return { ...data, goals: data.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) };
}

/** Ao excluir a meta, as subtarefas são desvinculadas (não apagadas). */
export function deleteGoal(data: AppData, id: string): AppData {
  return {
    goals: data.goals.filter((g) => g.id !== id),
    tasks: data.tasks.map((t) => (t.goalId === id ? { ...t, goalId: null } : t)),
  };
}
