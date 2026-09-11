import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../lib/theme";
import { StoreProvider } from "../lib/store";
import { AuthProvider, useAuth } from "../lib/auth";
import { AuthScreen } from "../components/AuthScreen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md p-8 text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Ocorreu um erro inesperado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível carregar esta seção. Você pode tentar novamente ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-secondary/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { name: "theme-color", content: "#080809" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Zenith" },
      { name: "application-name", content: "Zenith" },
      { title: "Zenith" },
      {
        name: "description",
        content:
          "Sistema moderno para planejamento de tarefas, acompanhamento de metas com medição e análise de produtividade.",
      },
      { property: "og:title", content: "Zenith" },
      {
        property: "og:description",
        content:
          "Sistema moderno para planejamento de tarefas, acompanhamento de metas com medição e análise de produtividade.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg?v=12", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico?v=12" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=12" },
      { rel: "manifest", href: "/manifest.json?v=12" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeScript = `
  (function() {
    try {
      var storedMode = localStorage.getItem('zenith.theme.mode') || localStorage.getItem('aura.theme.mode');
      var dark = storedMode === 'dark' || (!storedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      var legacyMap = { gold: 'quente', linear: 'escuro', emerald: 'verde', violet: 'roxo', monochrome: 'escuro' };
      var storedPalette = localStorage.getItem('zenith.theme.palette') || localStorage.getItem('aura.theme.palette') || 'escuro';
      if (legacyMap[storedPalette]) {
        storedPalette = legacyMap[storedPalette];
      }
      document.documentElement.setAttribute('data-palette', storedPalette);

      var faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink && storedPalette) {
        faviconLink.setAttribute('href', '/logos/zenith-' + storedPalette + '.svg?v=9');
      }
    } catch(e) {}
  })();
`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-palette="escuro" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <div className="modern-bg" />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">Iniciando Zenith...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Zenith PWA Service Worker registrado:", reg.scope);
          })
          .catch((err) => {
            console.error("Falha ao registrar Service Worker do PWA:", err);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
