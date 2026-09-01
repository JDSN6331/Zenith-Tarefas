import { Link, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, LayoutDashboard, ListTodo, Moon, Sun, Target } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/tarefas", label: "Tarefas", icon: ListTodo },
  { to: "/metas", label: "Metas", icon: Target },
] as const;

/** Layout base: cabeçalho, navegação e alternância de tema claro/escuro. */
export function AppShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const stored = window.localStorage.getItem("focus.theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefers);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("focus.theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Rumo</span>
          </Link>

          <nav aria-label="Navegação principal" className="ml-auto flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="icon"
              aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
              onClick={() => setDark((v) => !v)}
            >
              {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl animate-rise px-4 pb-20 pt-6">{children}</main>
    </div>
  );
}
