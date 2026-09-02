import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskItem } from "@/components/TaskItem";
import {
  FlaticonAlertCircle,
  FlaticonCalendar,
  FlaticonCheckCircle,
  FlaticonClock,
  FlaticonPlayCircle,
  FlaticonPlus,
  FlaticonSearch,
  FlaticonTasks,
} from "@/components/icons/FlaticonIcons";
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
import { useStore } from "@/lib/store";
import type { Task, TaskStatus } from "@/lib/types";
import { computeTaskStatus, isOverdue, sortTasks, type SortKey } from "@/lib/utils-domain";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas · Zenith" },
      {
        name: "description",
        content:
          "Gerenciamento de tarefas com filtros por status, recorrência, subtarefas e categorias.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <TarefasPage />
    </AppShell>
  ),
});

type FilterStatus = "todas" | TaskStatus;

export function TarefasPage() {
  const { tasks, categories, ready } = useStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("todas");
  const [priorityFilter, setPriorityFilter] = useState<string>("todas");
  const [categoryFilter, setCategoryFilter] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");

  const pendingCount = tasks.filter((t) => !t.done).length;

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      const computedStatus = computeTaskStatus(t);

      // Filtro de Status
      if (statusFilter !== "todas") {
        if (statusFilter === "pending" && computedStatus !== "pending") return false;
        if (statusFilter === "in_progress" && computedStatus !== "in_progress") return false;
        if (statusFilter === "overdue" && computedStatus !== "overdue") return false;
        if (statusFilter === "completed" && computedStatus !== "completed") return false;
      }

      // Filtro de Prioridade
      if (priorityFilter !== "todas" && t.priority !== priorityFilter) return false;

      // Filtro de Categoria
      if (categoryFilter !== "todas" && t.categoryId !== categoryFilter) return false;

      // Filtro de Data
      if (dueDateFilter && t.dueDate !== dueDateFilter) return false;

      // Busca por Texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesSubtasks = t.subtasks?.some((st) => st.title.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesSubtasks) return false;
      }

      return true;
    });

    return sortTasks(filtered, sortKey);
  }, [tasks, statusFilter, priorityFilter, categoryFilter, dueDateFilter, searchQuery, sortKey]);

  const openNew = () => {
    setEditingTask(null);
    setOpenDialog(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Organização
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Minhas Tarefas
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} tarefa(s) pendente(s) de {tasks.length} cadastrada(s).
          </p>
        </div>

        <Button onClick={openNew} className="gap-2 bg-primary text-primary-foreground">
          <FlaticonPlus size={16} /> Nova Tarefa
        </Button>
      </div>

      {/* Barra de Filtros por Status (Tabs Rápidas) */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-secondary/40 p-1.5 border border-border/40">
        {[
          { key: "todas", label: "Todas", count: tasks.length },
          {
            key: "pending",
            label: "Não Iniciadas",
            icon: FlaticonClock,
            count: tasks.filter((t) => computeTaskStatus(t) === "pending").length,
          },
          {
            key: "in_progress",
            label: "Em Andamento",
            icon: FlaticonPlayCircle,
            count: tasks.filter((t) => computeTaskStatus(t) === "in_progress").length,
          },
          {
            key: "overdue",
            label: "Atrasadas",
            icon: FlaticonAlertCircle,
            count: tasks.filter(isOverdue).length,
          },
          {
            key: "completed",
            label: "Concluídas",
            icon: FlaticonCheckCircle,
            count: tasks.filter((t) => t.done).length,
          },
        ].map(({ key, label, icon: Icon, count }) => {
          const active = statusFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key as FilterStatus)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {Icon && <Icon size={14} />}
              <span>{label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Seção de Filtros Detalhados */}
      <section
        aria-label="Filtros Detalhados"
        className="glass-card grid gap-3.5 p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {/* Campo de Busca */}
        <div className="space-y-1.5">
          <Label
            htmlFor="f-search"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Buscar
          </Label>
          <div className="relative">
            <FlaticonSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="f-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por texto..."
              className="pl-8 bg-background/50 text-sm h-9"
            />
          </div>
        </div>

        {/* Prioridade */}
        <div className="space-y-1.5">
          <Label
            htmlFor="f-priority"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Prioridade
          </Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger id="f-priority" className="bg-background/50 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-1.5">
          <Label
            htmlFor="f-category"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Categoria
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="f-category" className="bg-background/50 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Data */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="f-date"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <FlaticonCalendar size={14} className="text-primary" /> Data Específica
            </Label>
            {dueDateFilter && (
              <button
                type="button"
                onClick={() => setDueDateFilter("")}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
          <Input
            id="f-date"
            type="date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className="bg-background/50 h-9 text-sm cursor-pointer"
          />
        </div>

        {/* Ordenação */}
        <div className="space-y-1.5">
          <Label
            htmlFor="f-sort"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Ordenar por
          </Label>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger id="f-sort" className="bg-background/50 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Data de Criação</SelectItem>
              <SelectItem value="dueDate">Data de Vencimento</SelectItem>
              <SelectItem value="priority">Nível de Prioridade</SelectItem>
              <SelectItem value="title">Título Alfabético</SelectItem>
              <SelectItem value="status">Status da Tarefa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Lista de Tarefas ou Empty State */}
      {ready && visibleTasks.length === 0 ? (
        <EmptyState
          icon={FlaticonTasks}
          title="Nenhuma tarefa encontrada"
          hint="Não encontramos tarefas correspondentes aos filtros selecionados. Altere os filtros ou crie uma nova tarefa."
        />
      ) : (
        <ul className="space-y-3">
          {visibleTasks.map((t) => (
            <TaskItem key={t.id} task={t} onEdit={openEdit} />
          ))}
        </ul>
      )}

      <TaskDialog open={openDialog} onOpenChange={setOpenDialog} task={editingTask} />
    </div>
  );
}
