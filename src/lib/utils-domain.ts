/** Utilitários de domínio: cálculos de progresso, métricas analíticas, recorrência e status. */
import type {
  Category,
  Goal,
  GoalTarget,
  Priority,
  RecurrenceFrequency,
  Task,
  TaskStatus,
} from "./types";

const PRIORITY_WEIGHT: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export function computeTaskStatus(task: Task): TaskStatus {
  if (task.done) return "completed";
  const today = todayISO();
  if (task.dueDate && task.dueDate < today) return "overdue";
  if (task.status === "in_progress" || (task.subtasks && task.subtasks.some((st) => st.done))) {
    return "in_progress";
  }
  return "pending";
}

export const isOverdue = (task: Task): boolean => {
  return !task.done && task.dueDate !== null && task.dueDate < todayISO();
};

export const isToday = (task: Task): boolean => task.dueDate === todayISO();

export function formatDate(iso: string | null): string {
  if (!iso) return "Sem prazo";
  const parts = iso.split("-");
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

/** Calcula a próxima data de vencimento com base na regra de recorrência */
export function calculateNextDueDate(
  currentDate: string | null,
  frequency: RecurrenceFrequency,
): string {
  const base = currentDate ? new Date(currentDate + "T12:00:00") : new Date();
  const next = new Date(base);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekdays": {
      next.setDate(next.getDate() + 1);
      // Se cair no sábado (6), pula pro domingo e depois segunda (1)
      if (next.getDay() === 6) next.setDate(next.getDate() + 2);
      else if (next.getDay() === 0) next.setDate(next.getDate() + 1);
      break;
    }
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      break;
  }

  return next.toISOString().slice(0, 10);
}

export interface TargetProgress {
  id: string;
  title: string;
  percent: number;
  displayText: string;
  completed: boolean;
}

export interface GoalProgressResult {
  total: number;
  percent: number;
  completedTargets: number;
  targets: TargetProgress[];
}

/** Calcula o progresso de uma meta padrão ClickUp (combinação de subtarefas, numérico, financeiro, booleano) */
export function calculateGoalProgress(goal: Goal, tasks: Task[]): GoalProgressResult {
  const linkedTasks = tasks.filter((t) => t.goalId === goal.id && !t.deletedAt);
  const targets = goal.targets || [];

  const targetProgressList: TargetProgress[] = [];

  // 1. Progresso das Tarefas vinculadas (se houver ou se existir target do tipo tasks)
  if (linkedTasks.length > 0) {
    const doneTasks = linkedTasks.filter((t) => t.done).length;
    const taskPercent = Math.round((doneTasks / linkedTasks.length) * 100);
    targetProgressList.push({
      id: "tasks-auto",
      title: "Tarefas vinculadas",
      percent: taskPercent,
      displayText: `${doneTasks}/${linkedTasks.length} tarefas`,
      completed: doneTasks === linkedTasks.length,
    });
  }

  // 2. Alvos ClickUp (Numérico, Monetário, Percentual, Booleano)
  for (const t of targets) {
    let pct = 0;
    let text = "";
    let isDone = t.completed;

    if (t.type === "boolean") {
      pct = t.completed ? 100 : 0;
      text = t.completed ? "Concluído" : "Pendente";
    } else if (t.type === "currency") {
      const range = t.targetValue - (t.startValue || 0);
      const curr = t.currentValue - (t.startValue || 0);
      pct =
        range <= 0
          ? t.currentValue >= t.targetValue
            ? 100
            : 0
          : Math.min(100, Math.max(0, Math.round((curr / range) * 100)));
      text = `${formatCurrency(t.currentValue)} / ${formatCurrency(t.targetValue)}`;
      isDone = t.currentValue >= t.targetValue;
    } else if (t.type === "number") {
      const range = t.targetValue - (t.startValue || 0);
      const curr = t.currentValue - (t.startValue || 0);
      pct =
        range <= 0
          ? t.currentValue >= t.targetValue
            ? 100
            : 0
          : Math.min(100, Math.max(0, Math.round((curr / range) * 100)));
      text = `${t.currentValue} / ${t.targetValue} ${t.unit || ""}`.trim();
      isDone = t.currentValue >= t.targetValue;
    } else if (t.type === "percent") {
      pct = Math.min(100, Math.max(0, Math.round(t.currentValue)));
      text = `${pct}%`;
      isDone = pct >= 100;
    } else if (t.type === "tasks") {
      const done = linkedTasks.filter((task) => task.done).length;
      pct = linkedTasks.length > 0 ? Math.round((done / linkedTasks.length) * 100) : 0;
      text = `${done}/${linkedTasks.length} tarefas`;
      isDone = linkedTasks.length > 0 && done === linkedTasks.length;
    }

    targetProgressList.push({
      id: t.id,
      title: t.title,
      percent: pct,
      displayText: text,
      completed: isDone,
    });
  }

  if (targetProgressList.length === 0) {
    return {
      total: 0,
      percent: 0,
      completedTargets: 0,
      targets: [],
    };
  }

  const sumPercent = targetProgressList.reduce((acc, curr) => acc + curr.percent, 0);
  const avgPercent = Math.round(sumPercent / targetProgressList.length);
  const doneCount = targetProgressList.filter((t) => t.completed).length;

  return {
    total: targetProgressList.length,
    percent: avgPercent,
    completedTargets: doneCount,
    targets: targetProgressList,
  };
}

export type SortKey = "dueDate" | "priority" | "createdAt" | "title" | "status";

export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const copy = [...tasks];
  copy.sort((a, b) => {
    if (key === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (key === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (key === "title") return a.title.localeCompare(b.title);
    if (key === "status") {
      const sA = computeTaskStatus(a);
      const sB = computeTaskStatus(b);
      return sA.localeCompare(sB);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
  return copy;
}

/** Métricas analíticas de desempenho e produtividade */
export function calculatePerformanceStats(tasks: Task[], goals: Goal[], categories: Category[]) {
  const activeTasks = tasks.filter((t) => !t.deletedAt);
  const completedTasks = activeTasks.filter((t) => t.done);
  const overdueTasks = activeTasks.filter(isOverdue);
  const inProgressTasks = activeTasks.filter((t) => computeTaskStatus(t) === "in_progress");
  const pendingTasks = activeTasks.filter((t) => computeTaskStatus(t) === "pending");

  const total = activeTasks.length;
  const completionRate = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

  // Cálculo de Streak (dias consecutivos com tarefas concluídas)
  let streak = 0;
  const today = new Date();
  const completionDates = new Set(
    completedTasks.map((t) => t.completedAt?.slice(0, 10)).filter(Boolean) as string[],
  );

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    const iso = checkDate.toISOString().slice(0, 10);
    if (completionDates.has(iso)) {
      streak++;
    } else if (i > 0) {
      // Se não concluiu nada hoje ainda, dá uma tolerância se concluiu ontem
      break;
    }
  }

  // Produtividade dos últimos 7 dias
  const weeklyData: { label: string; value: number; date: string }[] = [];
  const daysNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = activeTasks.filter((t) => t.completedAt?.slice(0, 10) === iso).length;
    weeklyData.push({ label: daysNames[d.getDay()] ?? "", value: count, date: iso });
  }

  // Distribuição de tarefas por Categoria
  const categoryMap = new Map<string, number>();
  for (const t of activeTasks) {
    const catId = t.categoryId || "pessoal";
    categoryMap.set(catId, (categoryMap.get(catId) || 0) + 1);
  }

  const categoryDistribution = categories.map((cat) => ({
    name: cat.name,
    color: cat.color,
    count: categoryMap.get(cat.id) || 0,
    percent: total > 0 ? Math.round(((categoryMap.get(cat.id) || 0) / total) * 100) : 0,
  }));

  // Score de Produtividade (0 a 100)
  // 1. Pontualidade / Saúde dos prazos (até 50 pts):
  const onTimeRatio = total > 0 ? (total - overdueTasks.length) / total : 0;
  const onTimePoints = Math.round(onTimeRatio * 50);

  // 2. Progresso de Execução (até 35 pts): tarefas concluídas (peso 1.0) + em andamento (peso 0.5)
  const progressRatio =
    total > 0 ? (completedTasks.length + inProgressTasks.length * 0.5) / total : 0;
  const progressPoints = Math.round(progressRatio * 35);

  // 3. Consistência / Sequência Recente (até 15 pts)
  const weeklyCompletions = weeklyData.reduce((acc, curr) => acc + curr.value, 0);
  const consistencyPoints = Math.min(15, streak * 3 + weeklyCompletions * 2);

  const rawScore =
    total === 0
      ? 0
      : Math.min(100, Math.max(0, onTimePoints + progressPoints + consistencyPoints));

  return {
    total,
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    overdue: overdueTasks.length,
    pending: pendingTasks.length,
    completionRate,
    streak,
    score: total === 0 ? 0 : rawScore,
    weeklyData,
    categoryDistribution,
    activeGoals: goals.filter((g) => !g.deletedAt).length,
  };
}
