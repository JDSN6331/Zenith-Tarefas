import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ZenithLogo } from "./ZenithLogo";
import { ThemeSelectorModal } from "./ThemeSelector";
import {
  FlaticonAnalytics,
  FlaticonCategories,
  FlaticonDashboard,
  FlaticonDownload,
  FlaticonGoals,
  FlaticonMoon,
  FlaticonMore,
  FlaticonSmartphone,
  FlaticonSparkles,
  FlaticonSun,
  FlaticonTasks,
  FlaticonTrash,
} from "./icons/FlaticonIcons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { usePwaInstall, InstallPwaModal } from "./InstallPwaModal";
import { AvatarModal } from "./AvatarModal";
import { LogOut, User as UserIcon, RefreshCw, ShieldCheck, ChevronDown } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: (props: any) => React.JSX.Element;
  isTrash?: boolean;
  adminOnly?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Painel", icon: FlaticonDashboard },
  { to: "/tarefas", label: "Tarefas", icon: FlaticonTasks },
  { to: "/metas", label: "Metas", icon: FlaticonGoals },
  { to: "/desempenho", label: "Desempenho", icon: FlaticonAnalytics },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: "/categorias", label: "Categorias", icon: FlaticonCategories },
  { to: "/lixeira", label: "Lixeira", icon: FlaticonTrash, isTrash: true },
];

const MOBILE_PRIMARY_TABS = [
  { to: "/", label: "Painel", icon: FlaticonDashboard },
  { to: "/tarefas", label: "Tarefas", icon: FlaticonTasks },
  { to: "/metas", label: "Metas", icon: FlaticonGoals },
  { to: "/desempenho", label: "Desempenho", icon: FlaticonAnalytics },
] as const;

/** Layout base: cabeçalho com glassmorphism, versão desktop fluida e barra de navegação mobile nativa */
export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { trashCount, isSyncing, refreshData } = useStore();
  const { user, logout } = useAuth();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const { isInstallable, isInstalled, isIos, triggerInstall } = usePwaInstall();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await triggerInstall();
      if (!installed) {
        setPwaModalOpen(true);
      }
    } else {
      setPwaModalOpen(true);
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  const isSecondaryActive = pathname === "/categorias" || pathname === "/lixeira" || pathname === "/admin";

  return (
    <div className="relative min-h-screen">
      {/* Header Superior (Desktop e Mobile) */}
      <header className="glass-nav sticky top-0 z-40 transition-colors w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3">
          {/* Logo e Nome */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0" aria-label="Zenith Início">
            <ZenithLogo size={38} variant="wordmark" />
          </Link>

          {/* Navegação Desktop com espaçamento agradável e sem sobreposições */}
          <nav aria-label="Navegação desktop" className="hidden md:flex items-center gap-2 lg:gap-2.5">
            {/* Abas Principais (Sempre visíveis com espaçamento confortável) */}
            {PRIMARY_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <Icon size={16} aria-hidden />
                  <span>{label}</span>
                </Link>
              );
            })}

            {/* Abas Secundárias em Telas Grandes (>= xl) */}
            <div className="hidden xl:flex items-center gap-2 lg:gap-2.5">
              {SECONDARY_NAV_ITEMS.map(({ to, label, icon: Icon, isTrash }) => {
                const active = pathname === to;
                const hasTrashItems = isTrash && trashCount > 0;
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 shrink-0 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }`}
                  >
                    <Icon size={16} aria-hidden />
                    <span>{label}</span>
                    {hasTrashItems && (
                      <span
                        className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          active
                            ? "bg-primary-foreground text-primary"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {trashCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Acesso Admin em Telas Grandes */}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  aria-current={pathname === "/admin" ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all shrink-0 ${
                    pathname === "/admin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-primary/90 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <ShieldCheck size={16} aria-hidden />
                  <span>Gestão</span>
                </Link>
              )}
            </div>

            {/* Menu "Mais ▾" Elegante para Telas de Notebook (< xl) */}
            <div className="xl:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all shrink-0 cursor-pointer ${
                      isSecondaryActive
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }`}
                  >
                    <FlaticonMore size={16} aria-hidden />
                    <span>Mais</span>
                    {trashCount > 0 && (
                      <span className="size-2 rounded-full bg-destructive" />
                    )}
                    <ChevronDown size={14} className="opacity-70 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="glass-card w-52 p-1.5 shadow-xl">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/categorias"
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer ${
                        pathname === "/categorias"
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <FlaticonCategories size={16} />
                      <span>Categorias</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/lixeira"
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer ${
                        pathname === "/lixeira"
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FlaticonTrash size={16} />
                        <span>Lixeira</span>
                      </div>
                      {trashCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                          {trashCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator className="my-1 border-border/50" />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${
                            pathname === "/admin"
                              ? "bg-primary text-primary-foreground"
                              : "text-primary hover:bg-primary/10"
                          }`}
                        >
                          <ShieldCheck size={16} />
                          <span>Gestão do Sistema</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* Ações de Tema, Sincronização e Usuário no Topo com espaçamento agradável */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Indicador de Sincronização PostgreSQL */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 shrink-0"
              title={isSyncing ? "Sincronizando com PostgreSQL..." : "Sincronizado com PostgreSQL"}
              onClick={() => refreshData()}
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin text-primary" : ""} />
            </Button>

            {/* Botão de Instalar App */}
            {!isInstalled && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 shrink-0 px-2.5"
                onClick={handleInstallClick}
                title="Instalar Aplicativo no Computador"
                aria-label="Instalar Aplicativo"
              >
                <FlaticonDownload size={14} className="text-primary" />
                <span className="hidden 2xl:inline">Instalar App</span>
              </Button>
            )}

            {/* Botão de Paleta de Cores */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-xl hover:bg-secondary/80 text-primary shrink-0"
              aria-label="Personalizar Paleta de Cores"
              title="Personalizar Tema & Cores"
              onClick={() => setThemeModalOpen(true)}
            >
              <FlaticonSparkles size={16} />
            </Button>

            {/* Alternador Rápido Claro/Escuro */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-xl hover:bg-secondary/80 shrink-0"
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <FlaticonSun
                  size={16}
                  className="text-warning transition-transform hover:rotate-45"
                />
              ) : (
                <FlaticonMoon
                  size={16}
                  className="text-foreground transition-transform hover:-rotate-12"
                />
              )}
            </Button>

            {/* Perfil do Usuário e Botão Sair com espaçamento limpo e sem cortes */}
            {user && (
              <div className="flex items-center gap-2 pl-2.5 border-l border-border/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="group flex items-center gap-2 rounded-xl bg-secondary/60 hover:bg-secondary py-1 px-2 text-xs transition-all cursor-pointer ring-1 ring-border/40 hover:ring-primary/40 shrink-0"
                  title="Clique para alterar sua foto de perfil"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-xs shadow-sm overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="hidden lg:inline-block font-medium text-foreground max-w-[90px] xl:max-w-[120px] truncate group-hover:text-primary transition-colors">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  title="Sair da Conta"
                  onClick={() => logout()}
                >
                  <LogOut size={15} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal (com padding fluido e adaptado) */}
      <main className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6 pb-28 pt-5 md:pb-24">
        {children}
      </main>

      {/* Barra de Navegação Inferior Nativa para Mobile (Visível apenas em telas menores < md) */}
      <nav
        aria-label="Navegação mobile inferior"
        className="glass-nav fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 py-1.5 px-3 md:hidden shadow-lg"
      >
        <div className="mx-auto flex max-w-md items-center justify-around">
          {MOBILE_PRIMARY_TABS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-3 transition-colors ${
                  active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground font-normal"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    active ? "bg-primary/15 text-primary" : ""
                  }`}
                >
                  <Icon size={19} />
                </div>
                <span className="text-[10px] tracking-tight">{label}</span>
              </Link>
            );
          })}

          {/* Botão "Mais" para abrir Drawer com Categorias, Lixeira e Ajustes */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-3 transition-colors ${
              pathname === "/categorias" || pathname === "/lixeira"
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground font-normal"
            }`}
          >
            <div
              className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                pathname === "/categorias" || pathname === "/lixeira"
                  ? "bg-primary/15 text-primary"
                  : ""
              }`}
            >
              <FlaticonMore size={19} />
              {trashCount > 0 && (
                <span className="absolute top-1 right-2 size-2 rounded-full bg-destructive" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Mais</span>
          </button>
        </div>
      </nav>

      {/* Drawer / Sheet de Opções Adicionais no Mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="bottom"
          className="glass-card rounded-t-3xl border-t border-border/80 p-6 md:hidden"
        >
          <SheetHeader className="text-left pb-2 border-b border-border/40">
            <SheetTitle className="font-display text-lg font-bold">Mais Opções</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-2">
            {/* Botão Instalar App no Mobile */}
            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleInstallClick();
                }}
                className="flex w-full items-center justify-between rounded-xl bg-primary/15 border border-primary/30 p-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/25"
              >
                <div className="flex items-center gap-3">
                  <FlaticonSmartphone size={20} className="text-primary shrink-0" />
                  <span>Instalar Aplicativo (PWA)</span>
                </div>
                <span className="rounded-lg bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-bold uppercase">
                  App
                </span>
              </button>
            )}

            {/* Categorias */}
            <Link
              to="/categorias"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl p-3.5 text-sm font-medium transition-colors ${
                pathname === "/categorias"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/40 text-foreground hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-3">
                <FlaticonCategories size={18} />
                <span>Gerenciar Categorias</span>
              </div>
            </Link>

            {/* Lixeira */}
            <Link
              to="/lixeira"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl p-3.5 text-sm font-medium transition-colors ${
                pathname === "/lixeira"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/40 text-foreground hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-3">
                <FlaticonTrash size={18} />
                <span>Lixeira</span>
              </div>
              {trashCount > 0 && (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                  {trashCount}
                </span>
              )}
            </Link>

            {/* Gestão do Sistema (Apenas Admin) */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl p-3.5 text-sm font-semibold transition-colors ${
                  pathname === "/admin"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-primary" />
                  <span>Painel de Gestão (Admin)</span>
                </div>
                <span className="rounded-lg bg-primary/20 text-primary text-[10px] px-2 py-0.5 font-bold uppercase">
                  Admin
                </span>
              </Link>
            )}

            {/* Personalizar Cores */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setThemeModalOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-xl bg-secondary/40 p-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <FlaticonSparkles size={18} className="text-primary" />
                <span>Personalizar Paleta de Cores</span>
              </div>
            </button>

            {/* Cartão de Usuário e Logout no Mobile */}
            {user && (
              <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground text-sm shadow-sm overflow-hidden shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{user.login}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAvatarModalOpen(true);
                    }}
                    className="rounded-lg text-[11px] font-semibold h-8 px-2.5 border-border/60"
                  >
                    Foto
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/15 text-destructive p-3 text-sm font-semibold transition-colors hover:bg-destructive/25"
                >
                  <LogOut size={16} />
                  <span>Sair da Conta</span>
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Personalização de Tema & Cores */}
      <ThemeSelectorModal open={themeModalOpen} onOpenChange={setThemeModalOpen} />

      {/* Modal de Personalização de Avatar / Foto */}
      <AvatarModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />

      {/* Modal de Instalação PWA */}
      <InstallPwaModal
        open={pwaModalOpen}
        onOpenChange={setPwaModalOpen}
        onInstall={triggerInstall}
        isIos={isIos}
        isInstalled={isInstalled}
      />
    </div>
  );
}
