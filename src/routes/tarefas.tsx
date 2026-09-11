import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskItem } from "@/components/TaskItem";
import {
  FlaticonAlertCircle,
  FlaticonCalendar,
  FlaticonCheck,
  FlaticonCheckCircle,
  FlaticonChevronDown,
  FlaticonClock,
  FlaticonPlayCircle,
  FlaticonPlus,
  FlaticonSearch,
  FlaticonTasks,
  FlaticonTrash,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import type { Priority, Task, TaskStatus } from "@/lib/types";
import { computeTaskStatus, isOverdue, sortTasks, todayISO, type SortKey } from "@/lib/utils-domain";
import { cn } from "@/lib/utils";

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

export interface TaskFiltersState {
  statusFilter?: FilterStatus;
  priorityFilter?: string;
  categoryFilter?: string;
  searchQuery?: string;
  dueDateFilter?: string;
  sortKey?: SortKey;
}

const STORAGE_KEY = "zenith.filters.tasks";

function getInitialFilters(): TaskFiltersState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

export function TarefasPage() {
  const { tasks, categories, ready, batchUpdateTasks, batchRemoveTasks } = useStore();
  const { user, updateUserPreferences } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Seleção Múltipla em Lote
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtros persistentes (localStorage imediato + PostgreSQL no Easypanel debounced)
  const initial = useMemo(() => getInitialFilters(), []);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(
    initial.statusFilter || (user?.taskFilters?.statusFilter as FilterStatus) || "todas"
  );
  const [priorityFilter, setPriorityFilter] = useState<string>(
    initial.priorityFilter || user?.taskFilters?.priorityFilter || "todas"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initial.categoryFilter || user?.taskFilters?.categoryFilter || "todas"
  );
  const [searchQuery, setSearchQuery] = useState(
    initial.searchQuery ?? user?.taskFilters?.searchQuery ?? ""
  );
  const [dueDateFilter, setDueDateFilter] = useState<string>(
    initial.dueDateFilter || user?.taskFilters?.dueDateFilter || ""
  );
  const [sortKey, setSortKey] = useState<SortKey>(
    initial.sortKey || (user?.taskFilters?.sortKey as SortKey) || "createdAt"
  );

  const hasLoadedRemoteRef = useRef(false);
  const isFirstMountRef = useRef(true);

  // Sincroniza filtros remotos do PostgreSQL caso o cache local estivesse vazio
  useEffect(() => {
    if (!user?.taskFilters || hasLoadedRemoteRef.current) return;
    const localRaw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!localRaw && Object.keys(user.taskFilters).length > 0) {
      hasLoadedRemoteRef.current = true;
      const f = user.taskFilters;
      if (f.statusFilter) setStatusFilter(f.statusFilter as FilterStatus);
      if (f.priorityFilter) setPriorityFilter(f.priorityFilter);
      if (f.categoryFilter) setCategoryFilter(f.categoryFilter);
      if (f.searchQuery !== undefined) setSearchQuery(f.searchQuery);
      if (f.dueDateFilter !== undefined) setDueDateFilter(f.dueDateFilter);
      if (f.sortKey) setSortKey(f.sortKey as SortKey);
    }
  }, [user?.taskFilters]);

  // Persistência local imediata e sincronização remota debounced no PostgreSQL
  useEffect(() => {
    const currentFilters: TaskFiltersState = {
      statusFilter,
      priorityFilter,
      categoryFilter,
      searchQuery,
      dueDateFilter,
      sortKey,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFilters));
    } catch {}

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (user) {
        updateUserPreferences({ taskFilters: currentFilters });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery, dueDateFilter, sortKey, user, updateUserPreferences]);

  const hasActiveFilters =
    statusFilter !== "todas" ||
    priorityFilter !== "todas" ||
    categoryFilter !== "todas" ||
    searchQuery.trim() !== "" ||
    dueDateFilter !== "" ||
    sortKey !== "createdAt";

  const handleClearFilters = () => {
    setStatusFilter("todas");
    setPriorityFilter("todas");
    setCategoryFilter("todas");
    setSearchQuery("");
    setDueDateFilter("");
    setSortKey("createdAt");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    if (user) {
      updateUserPreferences({ taskFilters: {} });
    }
    toast.success("Filtros redefinidos.");
  };

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

  // Controles de Seleção em Lote
  const isAllSelected =
    visibleTasks.length > 0 && visibleTasks.every((t) => selectedIds.has(t.id));
  const isSomeSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleTasks.map((t) => t.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const getTomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const getNextWeekISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  const handleBatchStatus = (status: TaskStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const patch: Partial<Task> = {
      status,
      done: status === "completed",
    };
    batchUpdateTasks(ids, patch);
    const labelMap: Record<TaskStatus, string> = {
      pending: "Não Iniciada",
      in_progress: "Em Andamento",
      completed: "Concluída",
      overdue: "Atrasada",
    };
    toast.success(`${ids.length} tarefa(s) alterada(s) para "${labelMap[status]}"!`);
    clearSelection();
  };

  const handleBatchDate = (dateStr: string | null) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    batchUpdateTasks(ids, { dueDate: dateStr });
    toast.success(
      dateStr
        ? `${ids.length} tarefa(s) reagendada(s)!`
        : `Prazo removido de ${ids.length} tarefa(s)!`,
    );
    clearSelection();
  };

  const handleBatchPriority = (priority: Priority) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    batchUpdateTasks(ids, { priority });
    toast.success(`Prioridade de ${ids.length} tarefa(s) alterada para "${priority}"!`);
    clearSelection();
  };

  const handleBatchCategory = (categoryId: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    batchUpdateTasks(ids, { categoryId });
    toast.success(`Categoria de ${ids.length} tarefa(s) atualizada!`);
    clearSelection();
  };

  const handleBatchDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const count = ids.length;
    batchRemoveTasks(ids);
    toast.success(`${count} tarefa(s) movida(s) para a lixeira!`);
    clearSelection();
  };

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

      {/* Seção de Filtros Detalhados com Indicador e Ação de Limpeza */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filtros & Ordenação
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary animate-in fade-in">
                Filtros ativos
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        <section
          aria-label="Filtros Detalhados"
          className="glass-card grid gap-3.5 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
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

        {/* Status */}
        <div className="space-y-1.5">
          <Label
            htmlFor="f-status"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Status
          </Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
            <SelectTrigger id="f-status" className="bg-background/50 h-9 text-sm text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os status</SelectItem>
              <SelectItem value="pending">Não Iniciadas</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="overdue">Atrasadas</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
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
            <SelectTrigger id="f-priority" className="bg-background/50 h-9 text-sm text-foreground">
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
            <SelectTrigger id="f-category" className="bg-background/50 h-9 text-sm text-foreground">
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
      </div>

      {/* Barra de Seleção Rápida em Lote */}
      {ready && visibleTasks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 hover:text-foreground font-medium transition-colors cursor-pointer select-none py-1"
          >
            <div
              className={`flex size-4.5 items-center justify-center rounded-md border transition-all ${
                isAllSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : isSomeSelected
                    ? "border-primary/80 bg-primary/20 text-primary"
                    : "border-border/80 bg-background/50 text-transparent hover:border-primary"
              }`}
            >
              <FlaticonCheck
                size={11}
                className={isSomeSelected || isAllSelected ? "opacity-100 stroke-[3]" : "opacity-0"}
              />
            </div>
            <span>
              {isAllSelected
                ? "Desmarcar todas"
                : `Selecionar todas (${visibleTasks.length})`}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary animate-in fade-in">
              <span>{selectedIds.size} de {visibleTasks.length} selecionada(s)</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer"
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de Tarefas ou Empty State */}
      {ready && visibleTasks.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={FlaticonTasks}
            title={hasActiveFilters ? "Nenhuma tarefa para os filtros selecionados" : "Nenhuma tarefa encontrada"}
            hint={
              hasActiveFilters
                ? "Nenhuma tarefa corresponde à combinação de filtros atual. Altere os filtros ou clique abaixo para redefini-los."
                : "Não encontramos tarefas cadastradas. Clique em 'Nova Tarefa' para começar."
            }
          />
          {hasActiveFilters && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2 text-xs border-primary/40 hover:bg-primary/10 cursor-pointer"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ul className="space-y-3 pb-24">
          {visibleTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onEdit={openEdit}
              isSelected={selectedIds.has(t.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </ul>
      )}

      {/* Barra Flutuante de Ações em Lote (Desktop & Mobile) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl px-2">
          <div className="glass-card flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl shadow-2xl border-primary/40 bg-card/95 backdrop-blur-xl ring-1 ring-primary/25 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Contador de selecionadas & botão de limpar */}
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                {selectedIds.size}
              </span>
              <span className="text-xs font-semibold text-foreground hidden xs:inline">
                {selectedIds.size === 1 ? "selecionada" : "selecionadas"}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 cursor-pointer"
              >
                Limpar
              </button>
            </div>

            {/* Ações em Lote */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Alterar Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium border-border/80 bg-background/60 hover:bg-secondary cursor-pointer"
                  >
                    <FlaticonPlayCircle size={14} className="text-primary" />
                    <span>Status</span>
                    <FlaticonChevronDown size={11} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1">
                  <DropdownMenuItem onClick={() => handleBatchStatus("pending")} className="gap-2 text-xs cursor-pointer">
                    <FlaticonClock size={14} className="text-muted-foreground" />
                    Não Iniciada
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchStatus("in_progress")} className="gap-2 text-xs cursor-pointer">
                    <FlaticonPlayCircle size={14} className="text-primary" />
                    Em Andamento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchStatus("completed")} className="gap-2 text-xs cursor-pointer">
                    <FlaticonCheckCircle size={14} className="text-success" />
                    Concluída
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Reagendar / Alterar Data */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium border-border/80 bg-background/60 hover:bg-secondary cursor-pointer"
                  >
                    <FlaticonCalendar size={14} className="text-primary" />
                    <span>Data</span>
                    <FlaticonChevronDown size={11} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 space-y-1">
                  <DropdownMenuItem onClick={() => handleBatchDate(todayISO())} className="text-xs cursor-pointer">
                    Hoje
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchDate(getTomorrowISO())} className="text-xs cursor-pointer">
                    Amanhã
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchDate(getNextWeekISO())} className="text-xs cursor-pointer">
                    Próxima Semana (+7d)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Data Específica:
                    </span>
                    <Input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) handleBatchDate(e.target.value);
                      }}
                      className="h-7 text-xs bg-background/80 cursor-pointer"
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBatchDate(null)}
                    className="text-xs text-destructive focus:text-destructive cursor-pointer"
                  >
                    Remover Prazo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Alterar Prioridade */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium border-border/80 bg-background/60 hover:bg-secondary cursor-pointer"
                  >
                    <FlaticonAlertCircle size={14} className="text-primary" />
                    <span className="hidden sm:inline">Prioridade</span>
                    <FlaticonChevronDown size={11} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 p-1">
                  <DropdownMenuItem onClick={() => handleBatchPriority("alta")} className="gap-2 text-xs cursor-pointer">
                    <span className="size-2 rounded-full bg-destructive" /> Alta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchPriority("media")} className="gap-2 text-xs cursor-pointer">
                    <span className="size-2 rounded-full bg-warning" /> Média
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchPriority("baixa")} className="gap-2 text-xs cursor-pointer">
                    <span className="size-2 rounded-full bg-muted-foreground" /> Baixa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Excluir em Lote */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                className="h-8 gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
                title="Mover tarefas selecionadas para a lixeira"
              >
                <FlaticonTrash size={13} />
                <span>Excluir</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <TaskDialog open={openDialog} onOpenChange={setOpenDialog} task={editingTask} />
    </div>
  );
}
