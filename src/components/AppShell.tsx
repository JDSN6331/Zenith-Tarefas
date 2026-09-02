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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { usePwaInstall, InstallPwaModal } from "./InstallPwaModal";

const DESKTOP_NAV_ITEMS = [
  { to: "/", label: "Painel", icon: FlaticonDashboard },
  { to: "/tarefas", label: "Tarefas", icon: FlaticonTasks },
  { to: "/metas", label: "Metas", icon: FlaticonGoals },
  { to: "/desempenho", label: "Desempenho", icon: FlaticonAnalytics },
  { to: "/categorias", label: "Categorias", icon: FlaticonCategories },
  { to: "/lixeira", label: "Lixeira", icon: FlaticonTrash, isTrash: true },
] as const;

const MOBILE_PRIMARY_TABS = [
  { to: "/", label: "Painel", icon: FlaticonDashboard },
  { to: "/tarefas", label: "Tarefas", icon: FlaticonTasks },
  { to: "/metas", label: "Metas", icon: FlaticonGoals },
  { to: "/desempenho", label: "Desempenho", icon: FlaticonAnalytics },
] as const;

/** Layout base: cabeçalho com glassmorphism, versão desktop fluida e barra de navegação mobile nativa */
export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { trashCount } = useStore();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
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

  return (
    <div className="relative min-h-screen">
      {/* Header Superior (Desktop e Mobile) */}
      <header className="glass-nav sticky top-0 z-40 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Logo e Nome */}
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Zenith Início">
            <ZenithLogo size={32} />
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                Zenith
              </span>
              <span className="hidden text-[10px] font-medium tracking-wider uppercase text-muted-foreground sm:inline-block">
                Foco & Metas
              </span>
            </div>
          </Link>

          {/* Navegação Desktop (Visível apenas a partir de telas médias md:) */}
          <nav aria-label="Navegação desktop" className="hidden md:flex items-center gap-1.5">
            {DESKTOP_NAV_ITEMS.map(({ to, label, icon: Icon, isTrash }) => {
              const active = pathname === to;
              const hasTrashItems = isTrash && trashCount > 0;

              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <Icon size={17} aria-hidden />
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
          </nav>

          {/* Ações de Tema e Personalização no Topo */}
          <div className="flex items-center gap-1">
            {/* Botão de Instalar App (Desktop / Tablet) */}
            {!isInstalled && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
                onClick={handleInstallClick}
                aria-label="Instalar Aplicativo"
              >
                <FlaticonDownload size={14} className="text-primary" />
                <span>Instalar App</span>
              </Button>
            )}

            {/* Botão de Paleta de Cores */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl hover:bg-secondary/80 text-primary"
              aria-label="Personalizar Paleta de Cores"
              onClick={() => setThemeModalOpen(true)}
            >
              <FlaticonSparkles size={17} />
            </Button>

            {/* Alternador Rápido Claro/Escuro */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl hover:bg-secondary/80"
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <FlaticonSun
                  size={18}
                  className="text-warning transition-transform hover:rotate-45"
                />
              ) : (
                <FlaticonMoon
                  size={18}
                  className="text-foreground transition-transform hover:-rotate-12"
                />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal (com padding inferior maior no mobile para não sobrepor a barra de abas) */}
      <main className="mx-auto max-w-6xl animate-rise px-4 pb-28 pt-5 sm:px-6 md:pb-24">
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
                  active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-lg transition-all ${
                    active ? "bg-primary/15 text-primary scale-105" : ""
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
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`flex size-8 items-center justify-center rounded-lg transition-all ${
                pathname === "/categorias" || pathname === "/lixeira"
                  ? "bg-primary/15 text-primary scale-105"
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
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Personalização de Tema & Cores */}
      <ThemeSelectorModal open={themeModalOpen} onOpenChange={setThemeModalOpen} />

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
