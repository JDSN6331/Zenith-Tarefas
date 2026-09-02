import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZenithLogo } from "./ZenithLogo";
import { FlaticonCheckCircle, FlaticonDownload, FlaticonSparkles } from "./icons/FlaticonIcons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detecta se já está rodando como PWA instalado
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    isIos,
    triggerInstall,
  };
}

interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: () => void;
  isIos: boolean;
  isInstalled: boolean;
}

export function InstallPwaModal({
  open,
  onOpenChange,
  onInstall,
  isIos,
  isInstalled,
}: InstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-sm rounded-3xl p-6 border-border/70">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
            <ZenithLogo size={42} />
          </div>
          <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
            Instalar o Zenith no seu celular
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Tenha acesso rápido direto da tela inicial com modo tela cheia e notificações.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-3 text-center text-xs font-semibold text-primary">
              <FlaticonCheckCircle size={16} className="text-primary shrink-0" />
              <span>O Zenith já está instalado como aplicativo neste dispositivo!</span>
            </div>
          ) : isIos ? (
            <div className="rounded-2xl bg-secondary/50 p-4 text-xs text-foreground space-y-2.5 border border-border/40">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <FlaticonSparkles size={14} /> Como instalar no iPhone / iPad:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>
                  Toque no botão <strong className="text-foreground">Compartilhar</strong> (ícone com quadrado e seta para cima) na barra do Safari.
                </li>
                <li>
                  Role para baixo e toque em <strong className="text-foreground">Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  Toque em <strong className="text-foreground">Adicionar</strong> no canto superior direito.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
                <FlaticonSparkles size={15} className="text-primary shrink-0" />
                <span>Aplicativo ultraleve com execução instantânea e suporte offline.</span>
              </div>
              <Button
                onClick={() => {
                  onInstall();
                  onOpenChange(false);
                }}
                className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <FlaticonDownload size={16} />
                <span>Instalar Aplicativo Agora</span>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl text-xs text-muted-foreground hover:bg-secondary/60"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
