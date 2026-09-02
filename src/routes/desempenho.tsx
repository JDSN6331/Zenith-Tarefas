import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { WeeklyChart } from "@/components/WeeklyChart";
import {
  FlaticonAlertCircle,
  FlaticonAnalytics,
  FlaticonCheckCircle,
  FlaticonFlame,
  FlaticonGoals,
  FlaticonPlayCircle,
  FlaticonTag,
  FlaticonTasks,
} from "@/components/icons/FlaticonIcons";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { calculatePerformanceStats } from "@/lib/utils-domain";

export const Route = createFileRoute("/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho · Zenith" },
      {
        name: "description",
        content:
          "Métricas de produtividade, taxa de conclusão, consistência e distribuição de esforço por categoria.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <DesempenhoPage />
    </AppShell>
  ),
});

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="glass-card flex items-center gap-4 p-5">
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${colorClass}`}
      >
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="font-display text-3xl font-bold leading-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function DesempenhoPage() {
  const { tasks, goals, categories } = useStore();
  const stats = calculatePerformanceStats(tasks, goals, categories);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Métricas & Análise
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Desempenho e Produtividade
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe a eficiência de execução das suas tarefas e a constância no alcance de metas.
          </p>
        </div>
      </div>

      {/* Grid de Cards de Destaque */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Taxa de Conclusão"
          value={`${stats.completionRate}%`}
          subtitle={`${stats.completed} de ${stats.total} concluídas`}
          icon={FlaticonCheckCircle}
          colorClass="bg-success/15 text-success border-success/25"
        />
        <MetricCard
          title="Score Geral"
          value={`${stats.score}/100`}
          subtitle={stats.total === 0 ? "Cadastre tarefas para pontuar" : "Eficiência e pontualidade"}
          icon={FlaticonAnalytics}
          colorClass="bg-primary/15 text-primary border-primary/25"
        />
        <MetricCard
          title="Sequência Ativa"
          value={`${stats.streak} dias`}
          subtitle="Dias seguidos com entregas"
          icon={FlaticonFlame}
          colorClass="bg-warning/15 text-warning border-warning/25"
        />
        <MetricCard
          title="Metas Ativas"
          value={stats.activeGoals}
          subtitle="Com alvos em monitoramento"
          icon={FlaticonGoals}
          colorClass="bg-info/15 text-info border-info/25"
        />
      </div>

      {/* Análise de Distribuição e Gráficos */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Gráfico Semanal */}
        <section className="glass-card p-5 lg:col-span-7">
          <div className="pb-3 border-b border-border/40">
            <h2 className="font-display text-lg font-bold text-foreground">
              Volume de Entregas por Dia
            </h2>
            <p className="text-xs text-muted-foreground">Últimos 7 dias de atividade</p>
          </div>
          <div className="mt-5">
            <WeeklyChart tasks={tasks} />
          </div>
        </section>

        {/* Distribuição por Categoria */}
        <section className="glass-card p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-border/40">
              <h2 className="font-display text-lg font-bold text-foreground">
                Esforço por Categoria
              </h2>
              <p className="text-xs text-muted-foreground">Distribuição de tarefas ativas</p>
            </div>

            <div className="mt-4 space-y-4">
              {stats.categoryDistribution.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-foreground">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground">
                      {cat.count} tarefas ({cat.percent}%)
                    </span>
                  </div>
                  <Progress value={cat.percent} className="h-2 bg-secondary" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-secondary/30 p-3 text-xs text-muted-foreground border border-border/40">
            <p>
              💡 Dica: Equilibrar a carga entre Trabalho, Rotina e Pessoal otimiza a consistência e
              evita sobrecargas.
            </p>
          </div>
        </section>
      </div>

      {/* Tabela de Resumo de Status Operacional */}
      <section className="glass-card p-5">
        <h2 className="font-display text-lg font-bold text-foreground">Resumo Geral das Tarefas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-secondary/30 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground font-medium">Não Iniciadas</span>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{stats.pending}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3 border border-primary/20">
            <span className="text-xs text-primary font-medium">Em Andamento</span>
            <p className="font-display text-2xl font-bold text-primary mt-1">{stats.inProgress}</p>
          </div>
          <div className="rounded-xl bg-destructive/10 p-3 border border-destructive/20">
            <span className="text-xs text-destructive font-medium">Atrasadas</span>
            <p className="font-display text-2xl font-bold text-destructive mt-1">{stats.overdue}</p>
          </div>
          <div className="rounded-xl bg-success/10 p-3 border border-success/20">
            <span className="text-xs text-success font-medium">Concluídas</span>
            <p className="font-display text-2xl font-bold text-success mt-1">{stats.completed}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
