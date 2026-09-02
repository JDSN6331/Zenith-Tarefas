import { useEffect, useState } from "react";
import {
  FlaticonCalendar,
  FlaticonCheck,
  FlaticonPlus,
  FlaticonRepeat,
  FlaticonSubtasks,
  FlaticonTag,
  FlaticonTarget,
  FlaticonTrash,
} from "./icons/FlaticonIcons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  RECURRENCE_LABEL,
  STATUS_LABEL,
  type Priority,
  type RecurrenceFrequency,
  type SubTask,
  type Task,
  type TaskDraft,
  type TaskStatus,
} from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tarefa em edição; ausente = criação. */
  task?: Task | null;
  /** Meta pré-selecionada ao criar a partir da tela de metas. */
  defaultGoalId?: string | null;
}

const EMPTY_TASK: TaskDraft = {
  title: "",
  description: "",
  dueDate: null,
  priority: "media",
  categoryId: "pessoal",
  status: "pending",
  recurrence: { frequency: "none" },
  subtasks: [],
  goalId: null,
};

export function TaskDialog({ open, onOpenChange, task, defaultGoalId = null }: Props) {
  const { goals, categories, addTask, editTask } = useStore();
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_TASK);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    if (task) {
      setDraft({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        categoryId: task.categoryId || "pessoal",
        status: task.done ? "completed" : task.status || "pending",
        done: task.done,
        recurrence: task.recurrence || { frequency: "none" },
        subtasks: task.subtasks || [],
        goalId: task.goalId,
      });
    } else {
      setDraft({
        ...EMPTY_TASK,
        categoryId: categories[0]?.id || "pessoal",
        goalId: defaultGoalId,
        done: false,
        status: "pending",
      });
    }
    setNewSubtaskTitle("");
  }, [open, task, defaultGoalId, categories]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: SubTask = {
      id: "st-" + Math.random().toString(36).slice(2, 8),
      title: newSubtaskTitle.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    setDraft((prev) => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSt],
    }));
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (stId: string) => {
    setDraft((prev) => {
      const nextSubtasks = (prev.subtasks || []).map((st) =>
        st.id === stId ? { ...st, done: !st.done } : st,
      );
      const allDone = nextSubtasks.length > 0 && nextSubtasks.every((st) => st.done);
      return {
        ...prev,
        subtasks: nextSubtasks,
        done: allDone,
        status: allDone
          ? ("completed" as const)
          : prev.status === "completed"
            ? ("in_progress" as const)
            : prev.status || ("pending" as const),
      };
    });
  };

  const handleRemoveSubtask = (stId: string) => {
    setDraft((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter((st) => st.id !== stId),
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;

    const isDone = draft.status === "completed" || draft.done === true;
    const finalDraft: TaskDraft = {
      ...draft,
      done: isDone,
      status: isDone ? "completed" : draft.status || "pending",
      subtasks: isDone
        ? (draft.subtasks || []).map((st) => ({ ...st, done: true }))
        : draft.subtasks,
    };

    if (task) {
      editTask(task.id, finalDraft);
    } else {
      addTask(finalDraft);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {task ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 pt-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label
              htmlFor="task-title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Título da tarefa *
            </Label>
            <Input
              id="task-title"
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex.: Desenvolver relatório financeiro"
              className="bg-background/50 text-base"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label
              htmlFor="task-desc"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Descrição
            </Label>
            <Textarea
              id="task-desc"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Observações ou orientações sobre a tarefa"
              className="bg-background/50"
            />
          </div>

          {/* Data e Recorrência */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="task-due"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  <FlaticonCalendar size={14} className="text-primary" /> Vencimento
                </Label>
                {draft.dueDate && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, dueDate: null })}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Limpar data
                  </button>
                )}
              </div>
              <Input
                id="task-due"
                type="date"
                value={draft.dueDate ?? ""}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || null })}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="bg-background/50 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="task-recurrence"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <FlaticonRepeat size={14} /> Recorrência
              </Label>
              <Select
                value={draft.recurrence?.frequency || "none"}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    recurrence: {
                      ...draft.recurrence,
                      frequency: v as RecurrenceFrequency,
                      nextStatus: draft.recurrence?.nextStatus || "pending",
                    },
                  })
                }
              >
                <SelectTrigger id="task-recurrence" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RECURRENCE_LABEL) as RecurrenceFrequency[]).map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {RECURRENCE_LABEL[freq]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Inicial da Próxima Ocorrência (se houver recorrência) */}
          {draft.recurrence && draft.recurrence.frequency !== "none" && (
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-1.5">
              <Label
                htmlFor="task-next-status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Status inicial ao gerar próxima ocorrência
              </Label>
              <Select
                value={draft.recurrence.nextStatus || "pending"}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    recurrence: {
                      ...draft.recurrence,
                      nextStatus: v as "pending" | "in_progress",
                    },
                  })
                }
              >
                <SelectTrigger id="task-next-status" className="bg-background/60 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Não Iniciada (Padrão)</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Quando você concluir esta tarefa, a próxima ocorrência será criada automaticamente
                com este status.
              </p>
            </div>
          )}

          {/* Prioridade e Status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="task-priority"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Prioridade
              </Label>
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
              >
                <SelectTrigger id="task-priority" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="task-status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Status
              </Label>
              <Select
                value={draft.status || (draft.done ? "completed" : "pending")}
                onValueChange={(v) => {
                  const s = v as TaskStatus;
                  const isDone = s === "completed";
                  setDraft({
                    ...draft,
                    status: s,
                    done: isDone,
                    subtasks: isDone
                      ? (draft.subtasks || []).map((st) => ({ ...st, done: true }))
                      : draft.subtasks,
                  });
                }}
              >
                <SelectTrigger id="task-status" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{STATUS_LABEL.pending}</SelectItem>
                  <SelectItem value="in_progress">{STATUS_LABEL.in_progress}</SelectItem>
                  <SelectItem value="completed">{STATUS_LABEL.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoria e Meta Vinculada */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="task-category"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <FlaticonTag size={14} /> Categoria
              </Label>
              <Select
                value={draft.categoryId || "pessoal"}
                onValueChange={(v) => setDraft({ ...draft, categoryId: v })}
              >
                <SelectTrigger id="task-category" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="task-goal"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <FlaticonTarget size={14} /> Meta vinculada
              </Label>
              <Select
                value={draft.goalId ?? "none"}
                onValueChange={(v) => setDraft({ ...draft, goalId: v === "none" ? null : v })}
              >
                <SelectTrigger
                  id="task-goal"
                  className={cn(
                    "bg-background/50",
                    (!draft.goalId || draft.goalId === "none") ? "text-muted-foreground" : "text-foreground font-medium"
                  )}
                >
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seção de Subtarefas */}
          <div className="rounded-xl border border-border/70 bg-secondary/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FlaticonSubtasks size={14} /> Subtarefas ({draft.subtasks?.length || 0})
              </Label>
              {draft.subtasks && draft.subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {draft.subtasks.filter((st) => st.done).length}/{draft.subtasks.length} concluídas
                </span>
              )}
            </div>

            {/* Input para adicionar nova subtarefa */}
            <div className="flex gap-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Adicionar item à checklist..."
                className="h-9 bg-background/70 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSubtask}
                variant="secondary"
                className="shrink-0 h-9"
              >
                <FlaticonPlus size={16} /> Adicionar
              </Button>
            </div>

            {/* Lista de subtarefas adicionadas */}
            {draft.subtasks && draft.subtasks.length > 0 ? (
              <ul className="space-y-1.5 pt-1 max-h-60 overflow-y-auto overflow-x-hidden pr-1">
                {draft.subtasks.map((st) => (
                  <li
                    key={st.id}
                    className="flex items-start justify-between gap-2.5 rounded-lg bg-background/60 px-3 py-2 text-sm border border-border/40"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                        st.done
                          ? "border-success bg-success text-success-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {st.done && <FlaticonCheck size={12} />}
                    </button>
                    <span
                      className={`flex-1 min-w-0 break-words whitespace-normal leading-relaxed ${
                        st.done ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="mt-0.5 text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                    >
                      <FlaticonTrash size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma subtarefa adicionada.</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              {task ? "Salvar alterações" : "Criar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
