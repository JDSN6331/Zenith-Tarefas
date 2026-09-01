/** Utilitários de domínio: cálculos de progresso, filtros e ordenação. */
import type { Goal, Priority, Task } from "./types";

const PRIORITY_WEIGHT: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const isOverdue = (task: Task): boolean =>
  !task.done && task.dueDate !== null && task.dueDate < todayISO();

export const isToday = (task: Task): boolean => task.dueDate === todayISO();

export function formatDate(iso: string | null): string {
  if (!iso) return "Sem prazo";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export interface GoalProgress {
  total: number;
  done: number;
  percent: number;
}

/** Progresso da meta = % de subtarefas concluídas. */
export function goalProgress(goal: Goal, tasks: Task[]): GoalProgress {
  const linked = tasks.filter((t) => t.goalId === goal.id);
  const done = linked.filter((t) => t.done).length;
  return {
    total: linked.length,
    done,
    percent: linked.length === 0 ? 0 : Math.round((done / linked.length) * 100),
  };
}

export type SortKey = "dueDate" | "priority" | "createdAt";

export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const copy = [...tasks];
  copy.sort((a, b) => {
    if (key === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (key === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
  return copy;
}

/** Produtividade dos últimos 7 dias (concluídas por dia). */
export function weeklyProductivity(tasks: Task[]): { label: string; value: number }[] {
  const days: { label: string; value: number }[] = [];
  const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const value = tasks.filter((t) => t.completedAt?.slice(0, 10) === iso).length;
    days.push({ label: names[d.getDay()], value });
  }
  return days;
}
