import { useState } from "react";
import { FlaticonCheck, FlaticonMoon, FlaticonSparkles, FlaticonSun } from "./icons/FlaticonIcons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PALETTES, useTheme, type ThemePalette } from "@/lib/theme";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeSelectorModal({ open, onOpenChange }: Props) {
  const { theme, palette, setTheme, setPalette } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
            <FlaticonSparkles size={18} className="text-primary" />
            Personalizar Tema & Cores
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Escolha a identidade visual e o modo de iluminação que melhor se adapta ao seu fluxo de
            trabalho.
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Seletor de Modo: Claro / Escuro */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modo de Exibição
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-sm font-medium transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <FlaticonMoon size={16} />
                <span>Modo Escuro (Dark)</span>
                {theme === "dark" && <FlaticonCheck size={14} className="ml-auto text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-sm font-medium transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <FlaticonSun size={16} />
                <span>Modo Claro (Light)</span>
                {theme === "light" && <FlaticonCheck size={14} className="ml-auto text-primary" />}
              </button>
            </div>
          </div>

          {/* Seletor de Paleta de Cores com Visual Preview */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paletas de Cores Disponíveis
            </span>

            <div className="grid gap-2.5">
              {PALETTES.map((p) => {
                const isSelected = palette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p.id)}
                    className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/50 bg-background/40 hover:bg-secondary/60"
                    }`}
                  >
                    {/* Visual Color Swatch */}
                    <div
                      className="relative flex size-10 shrink-0 items-center justify-center rounded-xl shadow-inner border border-white/10"
                      style={{ backgroundColor: p.previewColor }}
                    >
                      <span
                        className="absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: p.accentColor }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{p.name}</span>
                        {isSelected && (
                          <span className="rounded-full bg-primary/20 text-primary px-2 py-0.2 text-[10px] font-bold">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.desc}</p>
                    </div>

                    {isSelected && <FlaticonCheck size={18} className="text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-primary-foreground"
            >
              Concluir Seleção
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
