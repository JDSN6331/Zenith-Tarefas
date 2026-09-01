import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Plus, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TaskDialog } from "@/components/TaskDialog";
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
import { StoreProvider, useStore } from "@/lib/store";
import { formatDate, goalProgress } from "@/lib/utils-domain";
import {
  GOAL_CATEGORY_LABEL,
  HORIZON_LABEL,
  type GoalCategory,
  type GoalDraft,
  type GoalHorizon,
} from "@/lib/types";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas · Rumo — progresso que você enxerga" },
      {
        name: "description",
        content:
          "Defina metas de curto, médio e longo prazo, vincule subtarefas e acompanhe o progresso.",
      },
      { property: "og:title", content: "Metas · Rumo" },
      {
        property: "og:description",
        content: "Metas com data alvo, categorias e progresso calculado pelas subtarefas.",
      },
    ],
  }),
  component: () => (
    <StoreProvider>
      <AppShell>
        <MetasPage />
      </AppShell>
    </StoreProvider>
  ),
});

const EMPTY_GOAL: GoalDraft = {
  title: "",
  description: "",
  horizon: "curto",
  category: "pessoal",
  targetDate: null,
};

function MetasPage() {
  const { goals, tasks, addGoal, removeGoal, ready } = useStore();
  const [goalOpen, setGoalOpen] = useState(false);
  const [draft, setDraft] = useState<GoalDraft>(EMPTY_GOAL);
  const [taskOpen, setTaskOpen] = useState(false);
  const [goalForTask, setGoalForTask] = useState<string | null>(null);

  useEffect(() => {
    if (goalOpen) setDraft(EMPTY_GOAL);
  }, [goalOpen]);

  const submitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    addGoal(draft);
    setGoalOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground">
            O progresso vem das subtarefas concluídas.
          </p>
        </div>
        <Button onClick={() => setGoalOpen(true)}>
          <Plus className="size-4" aria-hidden /> Nova meta
        </Button>
      </div>

      {ready && goals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Target}
            title="Nenhuma meta definida ainda!"
            hint="Comece por algo simples: uma meta de curto prazo com 3 subtarefas."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const p = goalProgress(goal, tasks);
            const linked = tasks.filter((t) => t.goalId === goal.id);
            return (
              <article key={goal.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-semibold leading-tight">
                      {goal.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <Badge variant="secondary">{HORIZON_LABEL[goal.horizon]}</Badge>
                      <Badge variant="outline">{GOAL_CATEGORY_LABEL[goal.category]}</Badge>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                        <CalendarCheck className="size-3" aria-hidden />
                        {formatDate(goal.targetDate)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir meta ${goal.title}`}
                    onClick={() => removeGoal(goal.id)}
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden />
                  </Button>
                </div>

                {goal.description ? (
                  <p className="mt-3 text-sm text-muted-foreground">{goal.description}</p>
                ) : null}

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {p.done}/{p.total} subtarefas
                    </span>
                    <span className="font-semibold">{p.percent}%</span>
                  </div>
                  <Progress value={p.percent} aria-label={`Progresso da meta ${goal.title}`} />
                </div>

                {linked.length > 0 ? (
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {linked.slice(0, 4).map((t) => (
                      <li
                        key={t.id}
                        className={`flex items-center gap-2 ${t.done ? "task-done" : ""}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${t.done ? "bg-success" : "bg-muted-foreground/50"}`}
                          aria-hidden
                        />
                        {t.title}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setGoalForTask(goal.id);
                    setTaskOpen(true);
                  }}
                >
                  <Plus className="size-4" aria-hidden /> Subtarefa
                </Button>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nova meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Título</Label>
              <Input
                id="goal-title"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Ex.: Correr 10 km sem parar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-desc">Descrição</Label>
              <Textarea
                id="goal-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="goal-horizon">Prazo</Label>
                <Select
                  value={draft.horizon}
                  onValueChange={(v) => setDraft({ ...draft, horizon: v as GoalHorizon })}
                >
                  <SelectTrigger id="goal-horizon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curto">Curto prazo</SelectItem>
                    <SelectItem value="medio">Médio prazo</SelectItem>
                    <SelectItem value="longo">Longo prazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-cat">Categoria</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => setDraft({ ...draft, category: v as GoalCategory })}
                >
                  <SelectTrigger id="goal-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(GOAL_CATEGORY_LABEL) as GoalCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {GOAL_CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-date">Data alvo</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={draft.targetDate ?? ""}
                  onChange={(e) => setDraft({ ...draft, targetDate: e.target.value || null })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setGoalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar meta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} defaultGoalId={goalForTask} />
    </>
  );
}
