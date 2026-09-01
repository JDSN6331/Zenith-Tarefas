import { createFileRoute } from "@tanstack/react-router";
import { ListTodo, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskItem } from "@/components/TaskItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreProvider, useStore } from "@/lib/store";
import { sortTasks, type SortKey } from "@/lib/utils-domain";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas · Rumo — organize seu dia" },
      {
        name: "description",
        content:
          "Crie, edite, filtre e conclua tarefas com prioridade, categoria e data de vencimento.",
      },
      { property: "og:title", content: "Tarefas · Rumo" },
      {
        property: "og:description",
        content: "Gerencie suas tarefas com filtros por status, prioridade, categoria e data.",
      },
    ],
  }),
  component: () => (
    <StoreProvider>
      <AppShell>
        <TarefasPage />
      </AppShell>
    </StoreProvider>
  ),
});

function TarefasPage() {
  const { tasks, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [status, setStatus] = useState<"todas" | "pendentes" | "concluidas">("todas");
  const [priority, setPriority] = useState<string>("todas");
  const [category, setCategory] = useState<string>("todas");
  const [date, setDate] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("createdAt");

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
    [tasks],
  );

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (status === "pendentes" && t.done) return false;
      if (status === "concluidas" && !t.done) return false;
      if (priority !== "todas" && t.priority !== priority) return false;
      if (category !== "todas" && t.category !== category) return false;
      if (date && t.dueDate !== date) return false;
      return true;
    });
    return sortTasks(filtered, sort);
  }, [tasks, status, priority, category, date, sort]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.filter((t) => !t.done).length} pendentes de {tasks.length}
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" aria-hidden /> Nova tarefa
        </Button>
      </div>

      <section aria-label="Filtros" className="card-surface mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="f-status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger id="f-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
              <SelectItem value="concluidas">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-priority">Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="f-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="f-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-date">Data</Label>
          <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-sort">Ordenar por</Label>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger id="f-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Criação</SelectItem>
              <SelectItem value="dueDate">Vencimento</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {ready && visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ListTodo}
            title="Nenhuma tarefa por aqui ainda!"
            hint="Crie sua primeira tarefa ou ajuste os filtros para ver outros itens."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((t) => (
            <TaskItem key={t.id} task={t} onEdit={openEdit} />
          ))}
        </ul>
      )}

      <TaskDialog open={open} onOpenChange={setOpen} task={editing} />
    </>
  );
}
