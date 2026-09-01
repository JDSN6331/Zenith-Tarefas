import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ListTodo, Sparkles, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { WeeklyChart } from "@/components/WeeklyChart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StoreProvider, useStore } from "@/lib/store";
import { formatDate, goalProgress, isOverdue, todayISO } from "@/lib/utils-domain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rumo · Tarefas e metas pessoais" },
      {
        name: "description",
        content:
          "Painel pessoal para organizar tarefas, acompanhar metas e visualizar sua produtividade da semana.",
      },
      { property: "og:title", content: "Rumo · Tarefas e metas pessoais" },
      {
        property: "og:description",
        content: "Tarefas, metas com progresso e um resumo diário simples. Tudo salvo no navegador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreProvider>
      <AppShell>
        <Dashboard />
      </AppShell>
    </StoreProvider>
  ),
});

function Stat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "default" | "danger" | "success";
  icon: typeof ListTodo;
}) {
  const toneClass =
    tone === "danger"
      ? "bg-destructive/12 text-destructive"
      : tone === "success"
        ? "bg-success/15 text-success"
        : "bg-primary/10 text-primary";
  return (
    <div className="card-surface flex items-center gap-3 p-4">
      <span className={`flex size-10 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { tasks, goals, ready } = useStore();
  const today = todayISO();
  const pending = tasks.filter((t) => !t.done);
  const overdue = tasks.filter(isOverdue);
  const doneToday = tasks.filter((t) => t.completedAt?.slice(0, 10) === today);
  const dueToday = pending.filter((t) => t.dueDate === today);

  return (
    <>
      <section className="card-surface flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Hoje</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Bom trabalho, siga em frente
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dueToday.length > 0
              ? `${dueToday.length} tarefa(s) vencem hoje.`
              : "Nada vencendo hoje — bom momento para adiantar uma meta."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/tarefas">
              <ListTodo className="size-4" aria-hidden /> Ver tarefas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/metas">
              <Target className="size-4" aria-hidden /> Metas
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Resumo do dia" className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Pendentes" value={pending.length} tone="default" icon={ListTodo} />
        <Stat label="Atrasadas" value={overdue.length} tone="danger" icon={AlertTriangle} />
        <Stat label="Concluídas hoje" value={doneToday.length} tone="success" icon={CheckCircle2} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-5" aria-label="Produtividade semanal">
          <h2 className="font-display text-lg font-semibold">Produtividade da semana</h2>
          <div className="mt-4">
            <WeeklyChart tasks={tasks} />
          </div>
        </section>

        <section className="card-surface p-5" aria-label="Metas em andamento">
          <h2 className="font-display text-lg font-semibold">Metas em andamento</h2>
          {ready && goals.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma meta ainda. Crie uma em “Metas”.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {goals.slice(0, 4).map((g) => {
                const p = goalProgress(g, tasks);
                return (
                  <li key={g.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{g.title}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {p.percent}% · {formatDate(g.targetDate)}
                      </span>
                    </div>
                    <Progress className="mt-2" value={p.percent} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {ready && tasks.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Sparkles}
            title="Nenhuma tarefa por aqui ainda!"
            hint="Comece criando sua primeira tarefa — tudo fica salvo no seu navegador."
          />
        </div>
      ) : null}
    </>
  );
}
