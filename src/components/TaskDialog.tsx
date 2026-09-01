import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { Priority, Task, TaskDraft } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tarefa em edição; ausente = criação. */
  task?: Task | null;
  /** Meta pré-selecionada ao criar a partir da tela de metas. */
  defaultGoalId?: string | null;
}

const EMPTY: TaskDraft = {
  title: "",
  description: "",
  dueDate: null,
  priority: "media",
  category: "",
  goalId: null,
};

export function TaskDialog({ open, onOpenChange, task, defaultGoalId = null }: Props) {
  const { goals, addTask, editTask } = useStore();
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setDraft(
      task
        ? {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            category: task.category,
            goalId: task.goalId,
          }
        : { ...EMPTY, goalId: defaultGoalId },
    );
  }, [open, task, defaultGoalId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    if (task) editTask(task.id, draft);
    else addTask(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {task ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex.: Revisar orçamento do mês"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Descrição</Label>
            <Textarea
              id="task-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Detalhes opcionais"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due">Vencimento</Label>
              <Input
                id="task-due"
                type="date"
                value={draft.dueDate ?? ""}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioridade</Label>
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
              >
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-category">Categoria</Label>
              <Input
                id="task-category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="Ex.: Trabalho"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-goal">Meta vinculada</Label>
              <Select
                value={draft.goalId ?? "none"}
                onValueChange={(v) => setDraft({ ...draft, goalId: v === "none" ? null : v })}
              >
                <SelectTrigger id="task-goal">
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

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{task ? "Salvar" : "Criar tarefa"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
