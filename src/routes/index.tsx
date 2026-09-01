import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TaskDialog } from "@/components/TaskDialog";
import { WeeklyChart } from "@/components/WeeklyChart";
import {
  FlaticonAlertCircle,
  FlaticonCheckCircle,
  FlaticonClock,
  FlaticonFlame,
  FlaticonGoals,
  FlaticonPlayCircle,
  FlaticonPlus,
  FlaticonTasks,
} from "@/components/icons/FlaticonIcons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import {
  calculateGoalProgress,
  calculatePerformanceStats,
  formatDate,
  isOverdue,
  todayISO,
} from "@/lib/utils-domain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel · Aura — Gestão de Tarefas e Metas" },
      {
        name: "description",
        content: "Painel de controle para organização de tarefas diárias, metas e produtividade.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "default" | "warning" | "danger" | "success" | "info";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const toneClasses = {
    danger: "bg-destructive/15 text-destructive border-destructive/25",
    success: "bg-success/15 text-success border-success/25",
    warning: "bg-warning/15 text-warning-foreground border-warning/25",
    info: "bg-primary/15 text-primary border-primary/25",
    default: "bg-secondary text-muted-foreground border-border/40",
  }[tone];

  return (
    <div className="glass-card flex items-center gap-3.5 p-4 transition-transform hover:scale-[1.01]">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${toneClasses}`}
      >
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-2xl font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { tasks, goals, categories, ready } = useStore();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const today = todayISO();
  const activeTasks = tasks;
  const pending = activeTasks.filter((t) => !t.done && !isOverdue(t));
  const inProgress = activeTasks.filter(
    (t) =>
      !t.done && (t.status === "in_progress" || (t.subtasks && t.subtasks.some((st) => st.done))),
  );
  const overdue = activeTasks.filter(isOverdue);
  const doneToday = activeTasks.filter((t) => t.completedAt?.slice(0, 10) === today);

  const stats = calculatePerformanceStats(tasks, goals, categories);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel */}
      <section className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Visão Geral
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatDate(today)}</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Painel de Controle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTasks.length > 0
              ? `${activeTasks.filter((t) => !t.done).length} tarefas pendentes e ${goals.length} metas ativas.`
              : "Nenhuma tarefa cadastrada no momento."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setTaskDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <FlaticonPlus size={16} /> Nova Tarefa
          </Button>
          <Button asChild variant="outline" className="gap-2 bg-background/50">
            <Link to="/tarefas">
              <FlaticonTasks size={16} /> Ver Tarefas
            </Link>
          </Button>
        </div>
      </section>

      {/* Grid de Métricas de Status */}
      <section
        aria-label="Status das Tarefas"
        className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Não Iniciadas"
          value={pending.length}
          tone="default"
          icon={FlaticonClock}
        />
        <StatCard
          label="Em Andamento"
          value={inProgress.length}
          tone="info"
          icon={FlaticonPlayCircle}
        />
        <StatCard
          label="Atrasadas"
          value={overdue.length}
          tone="danger"
          icon={FlaticonAlertCircle}
        />
        <StatCard
          label="Concluídas Hoje"
          value={doneToday.length}
          tone="success"
          icon={FlaticonCheckCircle}
        />
      </section>

      {/* Seção Principal: Gráfico e Metas ClickUp */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Coluna Esquerda: Produtividade */}
        <section className="glass-card p-5 lg:col-span-7">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Produtividade Semanal
              </h2>
              <p className="text-xs text-muted-foreground">Histórico diário de entregas</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-warning/15 px-3 py-1.5 text-xs font-semibold text-warning-foreground border border-warning/30">
              <FlaticonFlame size={14} className="text-warning" />
              <span>{stats.streak} dias de sequência</span>
            </div>
          </div>
          <div className="mt-4">
            <WeeklyChart tasks={tasks} />
          </div>
        </section>

        {/* Coluna Direita: Metas em Andamento */}
        <section className="glass-card p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Metas em Andamento
                </h2>
                <p className="text-xs text-muted-foreground">Acompanhamento de alvos</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/metas">Ver todas</Link>
              </Button>
            </div>

            {ready && goals.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>
                <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5 text-xs">
                  <Link to="/metas">
                    <FlaticonPlus size={14} /> Cadastrar Meta
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {goals.slice(0, 4).map((g) => {
                  const progress = calculateGoalProgress(g, tasks);
                  return (
                    <li
                      key={g.id}
                      className="rounded-xl bg-secondary/30 p-3 border border-border/40"
                    >
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-semibold text-foreground">{g.title}</span>
                        <span className="shrink-0 text-xs font-bold text-primary">
                          {progress.percent}%
                        </span>
                      </div>
                      <Progress className="mt-2 h-2 bg-secondary" value={progress.percent} />
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {progress.completedTargets}/{progress.total} alvos concluídos
                        </span>
                        <span>Alvo: {formatDate(g.targetDate)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Score de Desempenho Geral:</span>
            <span className="font-bold text-foreground text-sm">{stats.score}/100</span>
          </div>
        </section>
      </div>

      {/* Empty State Geral se não houver tarefas */}
      {ready && tasks.length === 0 && (
        <EmptyState
          icon={FlaticonTasks}
          title="Nenhuma tarefa cadastrada"
          hint="Crie sua primeira tarefa para organizar suas atividades e acompanhar seu desempenho."
        />
      )}

      <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
    </div>
  );
}
