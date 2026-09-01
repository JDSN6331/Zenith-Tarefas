import { Calendar, Check, Pencil, Tag, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDate, isOverdue } from "@/lib/utils-domain";
import { PRIORITY_LABEL, type Task } from "@/lib/types";

const priorityStyle: Record<Task["priority"], string> = {
  alta: "bg-destructive/12 text-destructive border-destructive/30",
  media: "bg-warning/15 text-warning-foreground border-warning/40",
  baixa: "bg-secondary text-secondary-foreground border-border",
};

export function TaskItem({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  const { toggleTask, removeTask, goals } = useStore();
  const goal = goals.find((g) => g.id === task.goalId) ?? null;
  const late = isOverdue(task);

  return (
    <li className="card-surface flex items-start gap-3 p-4 transition-shadow hover:shadow-lift">
      <button
        type="button"
        onClick={() => toggleTask(task.id)}
        aria-label={task.done ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
        aria-pressed={task.done}
        className={`pop-check mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${
          task.done
            ? "border-success bg-success text-success-foreground scale-105"
            : "border-border text-transparent hover:border-primary"
        }`}
      >
        <Check className="size-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`font-medium leading-snug ${task.done ? "task-done" : ""}`}>{task.title}</p>
        {task.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <Badge variant="outline" className={priorityStyle[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
              late ? "bg-destructive/12 text-destructive" : "bg-muted text-muted-foreground"
            }`}
          >
            <Calendar className="size-3" aria-hidden />
            {formatDate(task.dueDate)}
            {late ? " · atrasada" : ""}
          </span>
          {task.category ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
              <Tag className="size-3" aria-hidden />
              {task.category}
            </span>
          ) : null}
          {goal ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary">
              <Target className="size-3" aria-hidden />
              {goal.title}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Editar ${task.title}`}
          onClick={() => onEdit(task)}
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Excluir ${task.title}`}
          onClick={() => removeTask(task.id)}
        >
          <Trash2 className="size-4 text-destructive" aria-hidden />
        </Button>
      </div>
    </li>
  );
}
