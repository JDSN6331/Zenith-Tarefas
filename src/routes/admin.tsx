/**
 * Painel de Gestão e Administração do Sistema Zenith.
 * Acesso exclusivo ao Usuário Administrador (Primeiro usuário cadastrado).
 * Em conformidade com a LGPD: o administrador visualiza métricas e usuários,
 * mas NÃO tem acesso ao conteúdo individual das tarefas de outros usuários.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { apiClient, type AdminStats, type AdminUserItem } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Database,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Activity,
} from "lucide-react";
import { formatDate } from "@/lib/utils-domain";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração do Sistema · Zenith" },
      {
        name: "description",
        content: "Painel de gestão de usuários e integridade do sistema.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <AdminDashboard />
    </AppShell>
  ),
});

function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [userList, statsData] = await Promise.all([
        apiClient.getAdminUsers(),
        apiClient.getAdminStats(),
      ]);
      setUsers(userList);
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar dados administrativos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  // Se não for admin, exibe aviso amigável
  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="glass-card max-w-md p-8 text-center rounded-3xl border border-border/80">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <Lock size={28} />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Acesso Restrito ao Administrador
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva para o administrador do sistema para gerenciamento de contas.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
            >
              Voltar ao Meu Painel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleStatus = async (targetUser: AdminUserItem) => {
    if (targetUser.id === user.id) {
      alert("Você não pode desativar sua própria conta de administrador.");
      return;
    }

    const nextStatus = targetUser.status === "active" ? "inactive" : "active";
    const confirmMsg =
      nextStatus === "inactive"
        ? `Tem certeza que deseja desativar o usuário "${targetUser.name}"? Ele perderá o acesso até ser reativado.`
        : `Deseja reativar o usuário "${targetUser.name}"?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(targetUser.id);
    try {
      const ok = await apiClient.toggleUserStatus(targetUser.id, nextStatus);
      if (ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.login.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
              <Shield size={12} /> Painel Administrativo
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
              <ShieldCheck size={12} /> LGPD Ativa
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Gestão do Sistema
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Gerenciamento de contas e visualização de integridade do ambiente.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadAdminData}
          disabled={loading}
          className="rounded-xl border-border/80 self-start sm:self-auto gap-2 text-xs font-medium"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Atualizar Dados</span>
        </Button>
      </div>

      {/* Cartão Informativo de Conformidade LGPD */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 text-xs sm:text-sm leading-relaxed text-foreground flex items-start gap-3 shadow-sm">
        <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-primary">Privacidade e LGPD: </span>
          O isolamento estrito de dados está habilitado. Como administrador, você gerencia o acesso das contas e métricas gerais do sistema, sem acesso aos títulos, descrições ou conteúdos das tarefas individuais de cada usuário.
        </div>
      </div>

      {/* Cards de Métricas do Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-border/70 flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Users size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalUsers ?? users.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Usuários Cadastrados</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/70 flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-success/15 text-success">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.activeUsers ?? users.filter((u) => u.status === "active").length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Usuários Ativos</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/70 flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
            <Activity size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalTasks ?? 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Total de Tarefas Criadas</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/70 flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
            <Database size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-foreground truncate">
              {stats?.dbMode ? stats.dbMode.split(" ")[0] : "PostgreSQL"}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium truncate">
              Persistência Ativa
            </div>
          </div>
        </div>
      </div>

      {/* Tabela / Lista de Usuários */}
      <div className="glass-card rounded-3xl border border-border/80 overflow-hidden shadow-lg">
        {/* Barra de Pesquisa e Filtros */}
        <div className="p-4 sm:p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
              Contas de Usuários
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
              {filteredUsers.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome ou login..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-background/50 border-border/70 text-xs"
            />
          </div>
        </div>

        {/* Lista de Contas */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Carregando usuários...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado com o termo informado.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filteredUsers.map((u) => {
              const isCurrentUser = u.id === user.id;
              const initial = u.name ? u.name.trim().charAt(0).toUpperCase() : "U";

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-secondary/20"
                >
                  {/* Dados do Usuário */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex size-10 items-center justify-center rounded-2xl font-bold text-sm shadow-sm overflow-hidden shrink-0 ${
                        u.role === "admin"
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="size-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {u.name}
                        </span>
                        {u.role === "admin" && (
                          <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                            Administrador
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        @{u.login} · Cadastrado em {formatDate(u.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    {/* Contadores de atividade */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pr-2">
                      <div title="Total de tarefas criadas">
                        <span className="font-bold text-foreground">{u.tasksCount}</span> tarefas
                      </div>
                      <div>·</div>
                      <div title="Total de metas criadas">
                        <span className="font-bold text-foreground">{u.goalsCount}</span> metas
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        u.status === "active"
                          ? "bg-success/15 text-success border border-success/25"
                          : "bg-destructive/15 text-destructive border border-destructive/25"
                      }`}
                    >
                      {u.status === "active" ? (
                        <>
                          <CheckCircle2 size={12} /> Ativo
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Inativo
                        </>
                      )}
                    </span>

                    {/* Botão de Ativação / Desativação */}
                    {!isCurrentUser && (
                      <Button
                        variant={u.status === "active" ? "ghost" : "outline"}
                        size="sm"
                        disabled={actionLoading === u.id}
                        onClick={() => handleToggleStatus(u)}
                        className={`rounded-xl text-xs h-8 px-3 font-semibold ${
                          u.status === "active"
                            ? "text-destructive hover:bg-destructive/10"
                            : "border-success/30 text-success hover:bg-success/10"
                        }`}
                      >
                        {actionLoading === u.id
                          ? "Processando..."
                          : u.status === "active"
                            ? "Desativar"
                            : "Reativar"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
