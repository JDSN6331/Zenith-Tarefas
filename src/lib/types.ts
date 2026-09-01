/** Domínio da aplicação Aura — tipagem forte e desacoplada. */

export type Priority = "baixa" | "media" | "alta";

export type TaskStatus = "pending" | "in_progress" | "overdue" | "completed";

export type RecurrenceFrequency = "none" | "daily" | "weekdays" | "weekly" | "monthly";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  /** Status com o qual a próxima tarefa recorrente será criada */
  nextStatus?: "pending" | "in_progress";
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // hex ou classe de cor
  isDefault?: boolean;
  createdAt: string;
}

export type GoalHorizon = "curto" | "medio" | "longo";

export type GoalTargetType = "tasks" | "number" | "currency" | "percent" | "boolean";

export interface GoalTarget {
  id: string;
  title: string;
  type: GoalTargetType;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit?: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  /** ISO date (yyyy-mm-dd) ou null quando sem prazo. */
  dueDate: string | null;
  priority: Priority;
  categoryId: string;
  status: TaskStatus;
  done: boolean;
  recurrence: RecurrenceRule;
  subtasks: SubTask[];
  /** Meta à qual a tarefa está vinculada, se houver. */
  goalId: string | null;
  createdAt: string;
  completedAt: string | null;
  deletedAt: string | null; // Soft-delete / Lixeira
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  horizon: GoalHorizon;
  categoryId: string;
  targetDate: string | null;
  targets: GoalTarget[];
  createdAt: string;
  deletedAt: string | null; // Soft-delete / Lixeira
}

export interface AppData {
  tasks: Task[];
  goals: Goal[];
  categories: Category[];
}

export type TaskDraft = Omit<
  Task,
  "id" | "createdAt" | "completedAt" | "deletedAt" | "done" | "status"
> & {
  done?: boolean;
  status?: TaskStatus;
};

export type GoalDraft = Omit<Goal, "id" | "createdAt" | "deletedAt" | "targets"> & {
  targets?: GoalTarget[];
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "pessoal",
    name: "Pessoal",
    color: "#38BDF8",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rotina",
    name: "Rotina",
    color: "#F59E0B",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "trabalho",
    name: "Trabalho",
    color: "#818CF8",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Não Iniciada",
  in_progress: "Em Andamento",
  overdue: "Atrasada",
  completed: "Concluída",
};

export const RECURRENCE_LABEL: Record<RecurrenceFrequency, string> = {
  none: "Sem repetição",
  daily: "Diariamente",
  weekdays: "Dias úteis (Seg-Sex)",
  weekly: "Semanalmente",
  monthly: "Mensalmente",
};

export const HORIZON_LABEL: Record<GoalHorizon, string> = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
};

export const TARGET_TYPE_LABEL: Record<GoalTargetType, string> = {
  tasks: "Subtarefas",
  number: "Numérico",
  currency: "Monetário (R$)",
  percent: "Percentual (%)",
  boolean: "Sim / Não",
};
