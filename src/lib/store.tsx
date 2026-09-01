/** Ponte entre a camada de dados (localStorage) e a UI. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as db from "./storage";
import type { AppData, Goal, GoalDraft, Task, TaskDraft } from "./types";

interface StoreValue {
  tasks: Task[];
  goals: Goal[];
  ready: boolean;
  addTask: (draft: TaskDraft) => void;
  editTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addGoal: (draft: GoalDraft) => void;
  editGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({ tasks: [], goals: [] });
  const [ready, setReady] = useState(false);

  // Carrega do localStorage apenas no cliente (evita mismatch de hidratação).
  useEffect(() => {
    setData(db.loadData());
    setReady(true);
  }, []);

  const commit = useCallback((next: AppData) => {
    setData(next);
    db.saveData(next);
  }, []);

  const value: StoreValue = {
    tasks: data.tasks,
    goals: data.goals,
    ready,
    addTask: (draft) => commit(db.createTask(data, draft)),
    editTask: (id, patch) => commit(db.updateTask(data, id, patch)),
    toggleTask: (id) => commit(db.toggleTask(data, id)),
    removeTask: (id) => commit(db.deleteTask(data, id)),
    addGoal: (draft) => commit(db.createGoal(data, draft)),
    editGoal: (id, patch) => commit(db.updateGoal(data, id, patch)),
    removeGoal: (id) => commit(db.deleteGoal(data, id)),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de <StoreProvider>");
  return ctx;
}
