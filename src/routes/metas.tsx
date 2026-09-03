import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { GoalTargetDialog } from "@/components/GoalTargetDialog";
import { TaskDialog } from "@/components/TaskDialog";
import {
  FlaticonCalendar,
  FlaticonCheck,
  FlaticonClock,
  FlaticonDollar,
  FlaticonEdit,
  FlaticonGoals,
  FlaticonHash,
  FlaticonPercent,
  FlaticonPlus,
  FlaticonSubtasks,
  FlaticonTarget,
  FlaticonTrash,
} from "@/components/icons/FlaticonIcons";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import {
  HORIZON_LABEL,
  type Goal,
  type GoalDraft,
  type GoalHorizon,
  type GoalTarget,
} from "@/lib/types";
import { calculateGoalProgress, formatDate, formatCurrency } from "@/lib/utils-domain";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas · Zenith" },
      {
        name: "description",
        content: "Metas com medição por alvos financeiros, numéricos, percentuais e tarefas.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <MetasPage />
    </AppShell>
  ),
});

const EMPTY_GOAL_DRAFT: GoalDraft = {
  title: "",
  description: "",
  horizon: "curto",
  categoryId: null,
  targetDate: null,
};

export function MetasPage() {
  const {
    goals,
    tasks,
    categories,
    addGoal,
    editGoal,
    removeGoal,
    updateGoalTarget,
    removeGoalTarget,
    ready,
  } = useStore();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDraft, setGoalDraft] = useState<GoalDraft>(EMPTY_GOAL_DRAFT);

  // Alvo ClickUp Dialog
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [activeGoalForTarget, setActiveGoalForTarget] = useState<Goal | null>(null);
  const [editingTarget, setEditingTarget] = useState<GoalTarget | null>(null);

  // Subtarefa / Tarefa vinculada Dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [goalForNewTask, setGoalForNewTask] = useState<string | null>(null);

  const openCreateGoal = () => {
    setEditingGoal(null);
    setGoalDraft(EMPTY_GOAL_DRAFT);
    setGoalModalOpen(true);
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalDraft({
      title: goal.title,
      description: goal.description,
      horizon: goal.horizon,
      categoryId: goal.categoryId,
      targetDate: goal.targetDate,
    });
    setGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDraft.title.trim()) return;

    if (editingGoal) {
      editGoal(editingGoal.id, {
        title: goalDraft.title.trim(),
        description: goalDraft.description.trim(),
        horizon: goalDraft.horizon,
        categoryId: goalDraft.categoryId,
        targetDate: goalDraft.targetDate,
      });
    } else {
      addGoal(goalDraft);
    }
    setGoalModalOpen(false);
    setEditingGoal(null);
  };

  const openAddTarget = (goal: Goal) => {
    setActiveGoalForTarget(goal);
    setEditingTarget(null);
    setTargetModalOpen(true);
  };

  const openEditTarget = (goal: Goal, target: GoalTarget) => {
    setActiveGoalForTarget(goal);
    setEditingTarget(target);
    setTargetModalOpen(true);
  };

  const handleQuickIncrement = (goal: Goal, target: GoalTarget, delta: number) => {
    const nextVal = Math.max(0, (target.currentValue || 0) + delta);
    updateGoalTarget(goal.id, target.id, {
      currentValue: nextVal,
      completed: nextVal >= target.targetValue,
    });
  };

  const handleToggleBooleanTarget = (goal: Goal, target: GoalTarget) => {
    const nextCompleted = !target.completed;
    updateGoalTarget(goal.id, target.id, {
      completed: nextCompleted,
      currentValue: nextCompleted ? 1 : 0,
      targetValue: 1,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Planejamento
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Metas & Alvos
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso das suas metas com medição por alvos financeiros, numéricos e
            subtarefas.
          </p>
        </div>

        <Button
          onClick={openCreateGoal}
          className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground"
        >
          <FlaticonPlus size={16} /> Nova Meta
        </Button>
      </div>

      {/* Grid de Metas */}
      {ready && goals.length === 0 ? (
        <EmptyState
          icon={FlaticonGoals}
          title="Nenhuma meta cadastrada"
          hint="Defina suas metas de curto, médio e longo prazo e acompanhe a evolução com alvos mensuráveis."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {goals.map((goal) => {
            const p = calculateGoalProgress(goal, tasks);
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
            const category = categories.find((c) => c.id === goal.categoryId);
            const targets = goal.targets || [];

            return (
              <article
                key={goal.id}
                className="glass-card flex flex-col justify-between p-4 sm:p-5 transition-all hover:shadow-lift min-w-0 w-full overflow-hidden"
              >
                <div className="min-w-0">
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-bold leading-snug text-foreground break-words">
                        {goal.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge variant="secondary" className="font-medium shrink-0">
                          {HORIZON_LABEL[goal.horizon]}
                        </Badge>
                        {category && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2 py-1 text-foreground max-w-full">
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="truncate">{category.name}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-muted-foreground shrink-0">
                          <FlaticonCalendar size={13} />
                          {formatDate(goal.targetDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                        aria-label={`Editar meta ${goal.title}`}
                        onClick={() => openEditGoal(goal)}
                      >
                        <FlaticonEdit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors"
                        aria-label={`Mover meta ${goal.title} para a lixeira`}
                        onClick={() => removeGoal(goal.id)}
                      >
                        <FlaticonTrash size={16} />
                      </Button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="mt-3 text-sm text-muted-foreground break-words">{goal.description}</p>
                  )}

                  {/* Barra de Progresso Geral da Meta */}
                  <div className="mt-5 rounded-xl bg-secondary/40 p-3 sm:p-3.5 border border-border/40 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 text-xs font-semibold">
                      <span className="text-muted-foreground min-w-0 truncate">
                        Progresso Geral ({p.completedTargets}/{p.total} alvos concluídos)
                      </span>
                      <span className="text-primary font-bold text-sm shrink-0">{p.percent}%</span>
                    </div>
                    <Progress value={p.percent} className="h-2 bg-secondary w-full" />
                  </div>

                  {/* Lista de Alvos ClickUp */}
                  <div className="mt-4 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Alvos de Medição ({targets.length})
                      </p>
                    </div>

                    {targets.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-1">
                        Nenhum alvo de medição numérico ou financeiro cadastrado ainda.
                      </p>
                    ) : (
                      <ul className="space-y-2 min-w-0">
                        {targets.map((tgt) => {
                          const range = tgt.targetValue - (tgt.startValue || 0);
                          const curr = tgt.currentValue - (tgt.startValue || 0);
                          const pct =
                            tgt.type === "boolean"
                              ? tgt.completed
                                ? 100
                                : 0
                              : range <= 0
                                ? 100
                                : Math.min(100, Math.max(0, Math.round((curr / range) * 100)));

                          return (
                            <li
                              key={tgt.id}
                              className="rounded-xl bg-background/50 p-2.5 border border-border/40 text-xs flex flex-col gap-1.5 min-w-0 overflow-hidden"
                            >
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                                  {tgt.type === "currency" && (
                                    <FlaticonDollar size={13} className="text-success shrink-0" />
                                  )}
                                  {tgt.type === "number" && (
                                    <FlaticonHash size={13} className="text-primary shrink-0" />
                                  )}
                                  {tgt.type === "percent" && (
                                    <FlaticonPercent size={13} className="text-info shrink-0" />
                                  )}
                                  {tgt.type === "boolean" && (
                                    <FlaticonCheck size={13} className="text-accent shrink-0" />
                                  )}
                                  <span className="font-semibold text-foreground truncate min-w-0">
                                    {tgt.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditTarget(goal, tgt)}
                                    className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                                  >
                                    <FlaticonEdit size={12} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGoalTarget(goal.id, tgt.id)}
                                    className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                                  >
                                    <FlaticonTrash size={12} />
                                  </Button>
                                </div>
                              </div>

                              {/* Barra de Progresso do Alvo */}
                              <Progress value={pct} className="h-1.5 bg-secondary w-full" />

                              {/* Controles Rápidos de Atualização */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-muted-foreground min-w-0">
                                <span className="truncate min-w-0 text-[11px] sm:text-xs">
                                  {tgt.type === "currency" &&
                                    `${formatCurrency(tgt.currentValue)} de ${formatCurrency(tgt.targetValue)}`}
                                  {tgt.type === "number" &&
                                    `${tgt.currentValue} / ${tgt.targetValue} ${tgt.unit || ""}`}
                                  {tgt.type === "percent" &&
                                    `${tgt.currentValue}% de ${tgt.targetValue}%`}
                                  {tgt.type === "boolean" &&
                                    (tgt.completed ? "Concluído" : "Não atingido")}
                                </span>

                                {tgt.type === "boolean" ? (
                                  <Button
                                    size="sm"
                                    variant={tgt.completed ? "default" : "outline"}
                                    onClick={() => handleToggleBooleanTarget(goal, tgt)}
                                    className={`h-6 text-[10px] px-2.5 font-semibold gap-1 shrink-0 transition-all ${
                                      tgt.completed
                                        ? "bg-success text-success-foreground hover:bg-success/90 border-transparent shadow-sm"
                                        : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    }`}
                                  >
                                    {tgt.completed ? (
                                      <>
                                        <FlaticonCheck size={11} /> Concluído
                                      </>
                                    ) : (
                                      <>
                                        <FlaticonClock size={11} /> Marcar
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      onClick={() => handleQuickIncrement(goal, tgt, -1)}
                                      className="size-5 text-xs font-bold shrink-0"
                                    >
                                      -
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      onClick={() => handleQuickIncrement(goal, tgt, 1)}
                                      className="size-5 text-xs font-bold shrink-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Tarefas Vinculadas */}
                  {linkedTasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tarefas Vinculadas ({linkedTasks.filter((t) => t.done).length}/
                        {linkedTasks.length})
                      </p>
                      <ul className="space-y-1 text-xs min-w-0">
                        {linkedTasks.slice(0, 3).map((t) => (
                          <li
                            key={t.id}
                            className={`flex items-center gap-2 min-w-0 ${t.done ? "task-done" : ""}`}
                          >
                            <span
                              className={`size-1.5 rounded-full shrink-0 ${t.done ? "bg-success" : "bg-muted-foreground/50"}`}
                            />
                            <span className="truncate min-w-0 flex-1">{t.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botões de Ação no Rodapé */}
                <div className="mt-5 pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs bg-background/50 justify-center px-2"
                    onClick={() => {
                      setGoalForNewTask(goal.id);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <FlaticonPlus size={14} className="shrink-0" />
                    <span className="truncate">Vincular Tarefa</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-1.5 text-xs justify-center px-2"
                    onClick={() => openAddTarget(goal)}
                  >
                    <FlaticonTarget size={14} className="shrink-0" />
                    <span className="truncate">Novo Alvo</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição de Meta */}
      <Dialog
        open={goalModalOpen}
        onOpenChange={(open) => {
          setGoalModalOpen(open);
          if (!open) setEditingGoal(null);
        }}
      >
        <DialogContent className="glass-card w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingGoal ? "Editar Meta" : "Criar Nova Meta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGoal} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="goal-title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Título da Meta *
              </Label>
              <Input
                id="goal-title"
                required
                value={goalDraft.title}
                onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })}
                placeholder="Ex.: Reserva de Emergência de R$ 30.000"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="goal-desc"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Descrição e Motivação
              </Label>
              <Textarea
                id="goal-desc"
                rows={3}
                value={goalDraft.description}
                onChange={(e) => setGoalDraft({ ...goalDraft, description: e.target.value })}
                placeholder="Detalhes ou passos principais para atingir esta meta"
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-horizon"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Horizonte
                </Label>
                <Select
                  value={goalDraft.horizon}
                  onValueChange={(v) => setGoalDraft({ ...goalDraft, horizon: v as GoalHorizon })}
                >
                  <SelectTrigger id="goal-horizon" className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(HORIZON_LABEL) as GoalHorizon[]).map((h) => (
                      <SelectItem key={h} value={h}>
                        {HORIZON_LABEL[h]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-cat"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Categoria
                </Label>
                <Select
                  value={goalDraft.categoryId || "none"}
                  onValueChange={(v) =>
                    setGoalDraft({ ...goalDraft, categoryId: v === "none" ? null : v })
                  }
                >
                  <SelectTrigger id="goal-cat" className="bg-background/50 text-foreground">
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Nenhuma</span>
                    </SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="goal-date"
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    <FlaticonCalendar size={14} className="text-primary" /> Data Alvo
                  </Label>
                  {goalDraft.targetDate && (
                    <button
                      type="button"
                      onClick={() => setGoalDraft({ ...goalDraft, targetDate: null })}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Limpar data
                    </button>
                  )}
                </div>
                <Input
                  id="goal-date"
                  type="date"
                  value={goalDraft.targetDate ?? ""}
                  onChange={(e) =>
                    setGoalDraft({ ...goalDraft, targetDate: e.target.value || null })
                  }
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="bg-background/50 cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setGoalModalOpen(false);
                  setEditingGoal(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                {editingGoal ? "Salvar Alterações" : "Criar Meta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Alvo ClickUp */}
      <GoalTargetDialog
        open={targetModalOpen}
        onOpenChange={setTargetModalOpen}
        goal={activeGoalForTarget}
        target={editingTarget}
      />

      {/* Modal de Nova Tarefa Vinculada */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        defaultGoalId={goalForNewTask}
      />
    </div>
  );
}
