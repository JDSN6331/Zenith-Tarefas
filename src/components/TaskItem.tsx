import { useState } from "react";
import {
  FlaticonAlertCircle,
  FlaticonCalendar,
  FlaticonCheck,
  FlaticonCheckCircle,
  FlaticonChevronDown,
  FlaticonChevronRight,
  FlaticonClock,
  FlaticonEdit,
  FlaticonPlayCircle,
  FlaticonPlus,
  FlaticonRepeat,
  FlaticonSubtasks,
  FlaticonTag,
  FlaticonTarget,
  FlaticonTrash,
  FlaticonGripVertical,
} from "./icons/FlaticonIcons";
import { useDraggableList } from "@/hooks/useDraggableList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { PRIORITY_LABEL, RECURRENCE_LABEL, STATUS_LABEL, type Task } from "@/lib/types";
import { computeTaskStatus, formatDate, isOverdue } from "@/lib/utils-domain";

const priorityStyle: Record<Task["priority"], string> = {
  alta: "bg-destructive/15 text-destructive border-destructive/30",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-secondary text-secondary-foreground border-border/50",
};

export interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  isSelected?: boolean;
  onToggleSelect?: (taskId: string) => void;
}

export function TaskItem({
  task,
  onEdit,
  isSelected = false,
  onToggleSelect,
}: TaskItemProps) {
  const {
    toggleTask,
    editTask,
    removeTask,
    goals,
    categories,
    toggleSubTask,
    addSubTask,
    removeSubTask,
    reorderSubtasks,
  } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [newSubTask, setNewSubTask] = useState("");

  const goal = goals.find((g) => g.id === task.goalId) ?? null;
  const category = categories.find((c) => c.id === task.categoryId) ?? null;
  const status = computeTaskStatus(task);
  const late = isOverdue(task);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.done).length;
  const subtasksPercent =
    subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const {
    draggedIndex,
    targetIndex,
    getItemProps,
    getHandleProps,
  } = useDraggableList({
    items: subtasks,
    onReorder: (reordered) => reorderSubtasks(task.id, reordered),
  });

  const handleAddInlineSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTask.trim()) return;
    addSubTask(task.id, newSubTask.trim());
    setNewSubTask("");
  };

  return (
    <li
      className={`glass-card flex flex-col p-4 transition-all duration-200 hover:shadow-lift ${
        isSelected
          ? "border-primary/60 bg-primary/[0.04] shadow-md ring-1 ring-primary/40"
          : ""
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* Checkbox Único de Seleção */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(task.id);
            }}
            aria-label={isSelected ? `Desmarcar ${task.title}` : `Selecionar ${task.title}`}
            aria-pressed={isSelected}
            title={isSelected ? "Desmarcar da seleção" : "Selecionar para ações em lote"}
            className={`mt-0.5 flex size-5 sm:size-5.5 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
                : "border-border/70 bg-background/40 text-transparent hover:border-primary/60 hover:text-muted-foreground/40"
            }`}
          >
            <FlaticonCheck size={12} className={isSelected ? "opacity-100 stroke-[3]" : "opacity-0"} />
          </button>
        )}

        {/* Informações da Tarefa */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`font-display text-base font-semibold leading-snug tracking-tight text-foreground transition-all ${
                task.done ? "task-done" : ""
              }`}
            >
              {task.title}
            </p>

            {/* Badge de Status Interativo (Seletor de Status estilo ClickUp / Linear) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer transition-transform hover:scale-105 inline-flex items-center"
                  title="Clique para alterar o status da tarefa"
                >
                  {status === "completed" && (
                    <Badge
                      variant="outline"
                      className="bg-success/15 text-success border-success/30 text-[11px] gap-1 py-0 px-2 cursor-pointer hover:bg-success/25"
                    >
                      <FlaticonCheckCircle size={12} /> {STATUS_LABEL.completed}
                      <FlaticonChevronDown size={10} className="ml-0.5 opacity-70" />
                    </Badge>
                  )}
                  {status === "overdue" && (
                    <Badge
                      variant="outline"
                      className="bg-destructive/15 text-destructive border-destructive/30 text-[11px] gap-1 py-0 px-2 cursor-pointer hover:bg-destructive/25"
                    >
                      <FlaticonAlertCircle size={12} /> {STATUS_LABEL.overdue}
                      <FlaticonChevronDown size={10} className="ml-0.5 opacity-70" />
                    </Badge>
                  )}
                  {status === "in_progress" && (
                    <Badge
                      variant="outline"
                      className="bg-primary/15 text-primary border-primary/30 text-[11px] gap-1 py-0 px-2 cursor-pointer hover:bg-primary/25"
                    >
                      <FlaticonPlayCircle size={12} /> {STATUS_LABEL.in_progress}
                      <FlaticonChevronDown size={10} className="ml-0.5 opacity-70" />
                    </Badge>
                  )}
                  {status === "pending" && (
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-border/50 text-[11px] gap-1 py-0 px-2 cursor-pointer hover:bg-muted/80"
                    >
                      <FlaticonClock size={12} /> {STATUS_LABEL.pending}
                      <FlaticonChevronDown size={10} className="ml-0.5 opacity-70" />
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 p-1">
                <DropdownMenuItem
                  onClick={() => editTask(task.id, { status: "pending", done: false })}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <FlaticonClock size={14} className="text-muted-foreground" />
                  Não Iniciada
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editTask(task.id, { status: "in_progress", done: false })}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <FlaticonPlayCircle size={14} className="text-primary" />
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editTask(task.id, { status: "completed", done: true })}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <FlaticonCheckCircle size={14} className="text-success" />
                  Concluída
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
          )}

          {/* Badges e Metadados */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            {/* Prioridade */}
            <Badge variant="outline" className={priorityStyle[task.priority]}>
              {PRIORITY_LABEL[task.priority]}
            </Badge>

            {/* Vencimento */}
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                late
                  ? "bg-destructive/15 text-destructive font-medium border border-destructive/20"
                  : "bg-secondary/70 text-muted-foreground"
              }`}
            >
              <FlaticonCalendar size={13} />
              {formatDate(task.dueDate)}
            </span>

            {/* Recorrência */}
            {task.recurrence && task.recurrence.frequency !== "none" && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-info/15 text-info font-medium px-2 py-1 border border-info/20">
                <FlaticonRepeat size={13} />
                {RECURRENCE_LABEL[task.recurrence.frequency]}
              </span>
            )}

            {/* Categoria */}
            {category && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1 text-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}

            {/* Meta vinculada */}
            {goal && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-2 py-1">
                <FlaticonTarget size={13} />
                {goal.title}
              </span>
            )}

            {/* Botão de Subtarefas */}
            {subtasks.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 hover:bg-secondary px-2.5 py-1 text-foreground font-medium transition-colors"
              >
                <FlaticonSubtasks size={13} />
                <span>
                  {completedSubtasks}/{subtasks.length}
                </span>
                {expanded ? <FlaticonChevronDown size={13} /> : <FlaticonChevronRight size={13} />}
              </button>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Botão Rápido de Conclusão (1 clique) */}
          <Button
            variant="ghost"
            size="icon"
            className={`size-8 rounded-lg transition-colors ${
              task.done
                ? "text-success bg-success/15 hover:bg-success/25"
                : "text-muted-foreground hover:text-success hover:bg-success/10"
            }`}
            aria-label={task.done ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
            title={task.done ? "Tarefa concluída (clique para reabrir)" : "Marcar como concluída"}
            onClick={() => toggleTask(task.id)}
          >
            {task.done ? <FlaticonCheckCircle size={16} /> : <FlaticonCheck size={16} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg hover:bg-secondary"
            aria-label={`Editar ${task.title}`}
            onClick={() => onEdit(task)}
          >
            <FlaticonEdit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label={`Mover ${task.title} para a lixeira`}
            onClick={() => removeTask(task.id)}
          >
            <FlaticonTrash size={16} />
          </Button>
        </div>
      </div>

      {/* Barra de Progresso de Subtarefas se houver */}
      {subtasks.length > 0 && !expanded && (
        <div className="mt-3 pl-9">
          <Progress value={subtasksPercent} className="h-1.5 bg-secondary" />
        </div>
      )}

      {/* Accordion Expandido de Subtarefas */}
      {expanded && (
        <div className="mt-3 pl-9 space-y-2 border-t border-border/40 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Checklist de subtarefas ({subtasksPercent}%)</span>
            <span>
              {completedSubtasks} de {subtasks.length} concluídas
            </span>
          </div>
          <Progress value={subtasksPercent} className="h-1.5 bg-secondary" />

          <ul className="space-y-1.5 pt-1">
            {subtasks.map((st, index) => (
              <li
                key={st.id}
                {...getItemProps(index)}
                className={`group flex items-start justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                  draggedIndex === index
                    ? "opacity-40 border border-dashed border-primary/60 bg-primary/10 shadow-sm scale-[0.99]"
                    : targetIndex === index && draggedIndex !== null
                    ? "border border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "bg-secondary/40 hover:bg-secondary/60 border border-transparent"
                }`}
              >
                {/* Handle de arrastar */}
                <div
                  {...getHandleProps(index)}
                  className="mt-0.5 -ml-1 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground active:text-primary touch-none select-none p-0.5 rounded transition-colors"
                  title="Arrastar para ordenar"
                  aria-label="Arrastar para ordenar"
                >
                  <FlaticonGripVertical size={13} />
                </div>

                <button
                  type="button"
                  onClick={() => toggleSubTask(task.id, st.id)}
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    st.done
                      ? "border-success bg-success text-success-foreground"
                      : "border-border bg-background hover:border-primary"
                  }`}
                  title={st.done ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {st.done && <FlaticonCheck size={10} />}
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
                  onClick={() => removeSubTask(task.id, st.id)}
                  className="mt-0.5 text-muted-foreground hover:text-destructive p-0.5 shrink-0 transition-colors"
                  title="Excluir subtarefa"
                >
                  <FlaticonTrash size={13} />
                </button>
              </li>
            ))}
          </ul>

          {/* Adicionar subtarefa rápida inline */}
          <form onSubmit={handleAddInlineSubtask} className="flex gap-2 pt-1">
            <Input
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              placeholder="Adicionar nova subtarefa..."
              className="h-8 text-xs bg-background/50"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs shrink-0">
              <FlaticonPlus size={14} /> Adicionar
            </Button>
          </form>
        </div>
      )}
    </li>
  );
}
