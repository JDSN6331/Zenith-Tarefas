import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { GoalTargetDialog } from "@/components/GoalTargetDialog";
import { TaskDialog } from "@/components/TaskDialog";
import {
  FlaticonCalendar,
  FlaticonCheck,
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
    removeGoal,
    updateGoalTarget,
    removeGoalTarget,
    ready,
  } = useStore();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState<GoalDraft>(EMPTY_GOAL_DRAFT);

  // Alvo ClickUp Dialog
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [activeGoalForTarget, setActiveGoalForTarget] = useState<Goal | null>(null);
  const [editingTarget, setEditingTarget] = useState<GoalTarget | null>(null);

  // Subtarefa / Tarefa vinculada Dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [goalForNewTask, setGoalForNewTask] = useState<string | null>(null);

  useEffect(() => {
    if (goalModalOpen) {
      setGoalDraft(EMPTY_GOAL_DRAFT);
    }
  }, [goalModalOpen]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDraft.title.trim()) return;
    addGoal(goalDraft);
    setGoalModalOpen(false);
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
    updateGoalTarget(goal.id, target.id, {
      completed: !target.completed,
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
          onClick={() => setGoalModalOpen(true)}
          className="gap-2 bg-primary text-primary-foreground"
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
        <div className="grid gap-5 md:grid-cols-2">
          {goals.map((goal) => {
            const p = calculateGoalProgress(goal, tasks);
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
            const category = categories.find((c) => c.id === goal.categoryId);
            const targets = goal.targets || [];

            return (
              <article
                key={goal.id}
                className="glass-card flex flex-col justify-between p-5 transition-all hover:shadow-lift"
              >
                <div>
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-bold leading-snug text-foreground">
                        {goal.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge variant="secondary" className="font-medium">
                          {HORIZON_LABEL[goal.horizon]}
                        </Badge>
                        {category && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2 py-1 text-foreground">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-muted-foreground">
                          <FlaticonCalendar size={13} />
                          {formatDate(goal.targetDate)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      aria-label={`Mover meta ${goal.title} para a lixeira`}
                      onClick={() => removeGoal(goal.id)}
                    >
                      <FlaticonTrash size={16} />
                    </Button>
                  </div>

                  {goal.description && (
                    <p className="mt-3 text-sm text-muted-foreground">{goal.description}</p>
                  )}

                  {/* Barra de Progresso Geral da Meta */}
                  <div className="mt-5 rounded-xl bg-secondary/40 p-3.5 border border-border/40">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        Progresso Geral ({p.completedTargets}/{p.total} alvos concluídos)
                      </span>
                      <span className="text-primary font-bold text-sm">{p.percent}%</span>
                    </div>
                    <Progress value={p.percent} className="h-2 bg-secondary" />
                  </div>

                  {/* Lista de Alvos ClickUp */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Alvos de Medição ({targets.length})
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddTarget(goal)}
                        className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <FlaticonPlus size={13} /> Adicionar Alvo
                      </Button>
                    </div>

                    {targets.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-1">
                        Nenhum alvo de medição numérico ou financeiro cadastrado ainda.
                      </p>
                    ) : (
                      <ul className="space-y-2">
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
                              className="rounded-xl bg-background/50 p-2.5 border border-border/40 text-xs flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 truncate">
                                  {tgt.type === "currency" && (
                                    <FlaticonDollar size={13} className="text-success" />
                                  )}
                                  {tgt.type === "number" && (
                                    <FlaticonHash size={13} className="text-primary" />
                                  )}
                                  {tgt.type === "percent" && (
                                    <FlaticonPercent size={13} className="text-info" />
                                  )}
                                  {tgt.type === "boolean" && (
                                    <FlaticonCheck size={13} className="text-accent" />
                                  )}
                                  <span className="font-semibold text-foreground truncate">
                                    {tgt.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditTarget(goal, tgt)}
                                    className="size-6 text-muted-foreground hover:text-foreground"
                                  >
                                    <FlaticonEdit size={12} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGoalTarget(goal.id, tgt.id)}
                                    className="size-6 text-muted-foreground hover:text-destructive"
                                  >
                                    <FlaticonTrash size={12} />
                                  </Button>
                                </div>
                              </div>

                              {/* Barra de Progresso do Alvo */}
                              <Progress value={pct} className="h-1.5 bg-secondary" />

                              {/* Controles Rápidos de Atualização */}
                              <div className="flex items-center justify-between pt-0.5 text-muted-foreground">
                                <span>
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
                                    className="h-6 text-[10px] px-2"
                                  >
                                    {tgt.completed ? "Concluído" : "Marcar"}
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      onClick={() => handleQuickIncrement(goal, tgt, -1)}
                                      className="size-5 text-xs font-bold"
                                    >
                                      -
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      onClick={() => handleQuickIncrement(goal, tgt, 1)}
                                      className="size-5 text-xs font-bold"
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
                    <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tarefas Vinculadas ({linkedTasks.filter((t) => t.done).length}/
                        {linkedTasks.length})
                      </p>
                      <ul className="space-y-1 text-xs">
                        {linkedTasks.slice(0, 3).map((t) => (
                          <li
                            key={t.id}
                            className={`flex items-center gap-2 ${t.done ? "task-done" : ""}`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${t.done ? "bg-success" : "bg-muted-foreground/50"}`}
                            />
                            <span className="truncate">{t.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botões de Ação no Rodapé */}
                <div className="mt-5 pt-3 border-t border-border/40 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs bg-background/50"
                    onClick={() => {
                      setGoalForNewTask(goal.id);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <FlaticonPlus size={14} /> Vincular Tarefa
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => openAddTarget(goal)}
                  >
                    <FlaticonTarget size={14} /> Novo Alvo
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Criação de Meta */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent className="glass-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Criar Nova Meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4 pt-2">
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

            <div className="grid gap-3 sm:grid-cols-3">
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
              <Button type="button" variant="ghost" onClick={() => setGoalModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Criar Meta
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
