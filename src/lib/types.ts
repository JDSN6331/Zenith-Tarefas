/** Domínio da aplicação — tipagem forte, sem `any`. */

export type Priority = "baixa" | "media" | "alta";

export type GoalHorizon = "curto" | "medio" | "longo";

export type GoalCategory = "saude" | "carreira" | "financas" | "pessoal" | "estudos";

export interface Task {
  id: string;
  title: string;
  description: string;
  /** ISO date (yyyy-mm-dd) ou null quando sem prazo. */
  dueDate: string | null;
  priority: Priority;
  category: string;
  done: boolean;
  /** Meta à qual a tarefa está vinculada (subtarefa), se houver. */
  goalId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  horizon: GoalHorizon;
  category: GoalCategory;
  targetDate: string | null;
  createdAt: string;
}

export interface AppData {
  tasks: Task[];
  goals: Goal[];
}

export type TaskDraft = Omit<Task, "id" | "createdAt" | "completedAt" | "done"> &
  Partial<Pick<Task, "done">>;
export type GoalDraft = Omit<Goal, "id" | "createdAt">;

export const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const HORIZON_LABEL: Record<GoalHorizon, string> = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
};

export const GOAL_CATEGORY_LABEL: Record<GoalCategory, string> = {
  saude: "Saúde",
  carreira: "Carreira",
  financas: "Finanças",
  pessoal: "Pessoal",
  estudos: "Estudos",
};
