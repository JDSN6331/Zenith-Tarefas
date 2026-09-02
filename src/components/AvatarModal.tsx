/**
 * Modal de Personalização e Upload de Avatar do Usuário Zenith.
 * Permite envio de foto personalizada (com compressão automática) ou seleção de avatares temáticos.
 */
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import {
  Camera,
  Upload,
  Trash2,
  Check,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

interface AvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Avatares temáticos oficiais dos 5 temas do Zenith
const PRESET_AVATARS = [
  {
    id: "escuro",
    label: "Zenith Escuro",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='h' x1='0%25' y1='0%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%236366F1'/><stop offset='100%25' stop-color='%2300E5FF'/></linearGradient></defs><rect width='100' height='100' rx='28' fill='%23080E1A'/><path d='M18 54 A34 34 0 0 1 82 54' fill='none' stroke='url(%23h)' stroke-width='6' stroke-linecap='round'/><path d='M72 24 Q72 30 66 30 Q72 30 72 36 Q72 30 78 30 Q72 30 72 24 Z' fill='%23FFFFFF'/><path d='M50 30 L12 88 L52 88 L50 56 Z' fill='%231E293B'/><path d='M50 30 L50 56 L52 88 L88 88 Z' fill='%231E40AF'/><path d='M24 70 L50 28 L76 70' fill='none' stroke='%23FFFFFF' stroke-width='6.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  {
    id: "claro",
    label: "Zenith Claro",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='bg' x1='0%25' y1='0%25' x2='0%25' y2='100%25'><stop offset='0%25' stop-color='%23FFFFFF'/><stop offset='100%25' stop-color='%230A192F'/></linearGradient><linearGradient id='hc' x1='0%25' y1='0%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%234F46E5'/><stop offset='100%25' stop-color='%2300F2FE'/></linearGradient></defs><rect width='100' height='100' rx='28' fill='url(%23bg)'/><path d='M18 54 A34 34 0 0 1 82 54' fill='none' stroke='url(%23hc)' stroke-width='6' stroke-linecap='round'/><path d='M72 24 Q72 30 66 30 Q72 30 72 36 Q72 30 78 30 Q72 30 72 24 Z' fill='%23FFFFFF'/><path d='M50 30 L12 88 L52 88 L50 56 Z' fill='%230F172A'/><path d='M50 30 L50 56 L52 88 L88 88 Z' fill='%232563EB'/><path d='M24 70 L50 28 L76 70' fill='none' stroke='%23FFFFFF' stroke-width='6.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  {
    id: "verde",
    label: "Zenith Verde",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='hv' x1='0%25' y1='0%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%2310B981'/><stop offset='100%25' stop-color='%234ADE80'/></linearGradient></defs><rect width='100' height='100' rx='28' fill='%2304140D'/><path d='M18 54 A34 34 0 0 1 82 54' fill='none' stroke='url(%23hv)' stroke-width='6' stroke-linecap='round'/><path d='M72 24 Q72 30 66 30 Q72 30 72 36 Q72 30 78 30 Q72 30 72 24 Z' fill='%23FFFFFF'/><path d='M50 30 L12 88 L52 88 L50 56 Z' fill='%23064E3B'/><path d='M50 30 L50 56 L52 88 L88 88 Z' fill='%23059669'/><path d='M24 70 L50 28 L76 70' fill='none' stroke='%23FFFFFF' stroke-width='6.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  {
    id: "quente",
    label: "Zenith Quente",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='hq' x1='0%25' y1='0%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%23EA580C'/><stop offset='100%25' stop-color='%23FDE047'/></linearGradient></defs><rect width='100' height='100' rx='28' fill='%23140C06'/><path d='M18 54 A34 34 0 0 1 82 54' fill='none' stroke='url(%23hq)' stroke-width='6' stroke-linecap='round'/><path d='M72 24 Q72 30 66 30 Q72 30 72 36 Q72 30 78 30 Q72 30 72 24 Z' fill='%23FFFFFF'/><path d='M50 30 L12 88 L52 88 L50 56 Z' fill='%2378350F'/><path d='M50 30 L50 56 L52 88 L88 88 Z' fill='%23B45309'/><path d='M24 70 L50 28 L76 70' fill='none' stroke='%23FFFFFF' stroke-width='6.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  {
    id: "roxo",
    label: "Zenith Roxo",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='hr' x1='0%25' y1='0%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%23EC4899'/><stop offset='100%25' stop-color='%23A855F7'/></linearGradient></defs><rect width='100' height='100' rx='28' fill='%2312081C'/><path d='M18 54 A34 34 0 0 1 82 54' fill='none' stroke='url(%23hr)' stroke-width='6' stroke-linecap='round'/><path d='M72 24 Q72 30 66 30 Q72 30 72 36 Q72 30 78 30 Q72 30 72 24 Z' fill='%23FFFFFF'/><path d='M50 30 L12 88 L52 88 L50 56 Z' fill='%23581C87'/><path d='M50 30 L50 56 L52 88 L88 88 Z' fill='%237E22CE'/><path d='M24 70 L50 28 L76 70' fill='none' stroke='%23FFFFFF' stroke-width='6.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
];

export function AvatarModal({ open, onOpenChange }: AvatarModalProps) {
  const { user, updateAvatar } = useAuth();
  const [preview, setPreview] = useState<string | null>(user?.avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  // Processa e comprime a foto enviada pelo usuário via Canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 160; // 160x160 px é ideal para avatares leves e nítidos
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Desenha recortando proporcionalmente ao centro (crop quadrado)
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPreview(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAvatar(preview);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao salvar avatar:", err);
      alert("Não foi possível atualizar o avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-3xl border border-border/80 p-6 max-w-md backdrop-blur-xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Personalizar Foto de Perfil
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Envie sua própria foto ou escolha um dos avatares do Zenith.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Pré-visualização do Avatar */}
          <div className="relative group">
            <div className="size-24 rounded-full p-1 bg-gradient-to-tr from-primary via-accent to-primary/40 ring-4 ring-primary/20 shadow-xl overflow-hidden flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt={user?.name || "Avatar"}
                  className="size-full object-cover rounded-full bg-background"
                />
              ) : (
                <div className="size-full rounded-full bg-primary flex items-center justify-center font-bold text-3xl text-primary-foreground">
                  {initial}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              title="Carregar imagem do dispositivo"
            >
              <Camera size={15} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-border/70 text-xs font-semibold gap-1.5 h-9"
            >
              <Upload size={14} />
              <span>Enviar Foto</span>
            </Button>

            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="rounded-xl text-destructive hover:bg-destructive/10 text-xs font-semibold gap-1.5 h-9"
              >
                <Trash2 size={14} />
                <span>Remover</span>
              </Button>
            )}
          </div>

          {/* Galeria de Avatares Temáticos */}
          <div className="w-full space-y-2">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
              <Sparkles size={13} className="text-primary" />
              <span>Ou escolha um avatar temático:</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = preview === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPreview(preset.url)}
                    className={`relative size-12 rounded-2xl p-1 transition-all overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-primary scale-105 shadow-md"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    title={preset.label}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="size-full object-cover rounded-xl"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                        <Check size={16} className="text-primary-foreground font-bold" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé com Salvar / Cancelar */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={handleSave}
            className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-4"
          >
            {loading ? "Salvando..." : "Salvar Foto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
