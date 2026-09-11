import { useId } from "react";
import { useTheme, type ThemePalette } from "@/lib/theme";

interface ZenithLogoProps {
  /** Tamanho do badge em pixels (a tipografia escala proporcionalmente) */
  size?: number;
  /** Paleta específica ou "auto" para acompanhar o tema atual */
  palette?: ThemePalette | "auto";
  /**
   * "wordmark" ou "full": Badge + Tipografia elegante "ZENITH Tarefas & Metas"
   * "badge" ou "icon": Apenas o badge squircle oficial
   */
  variant?: "badge" | "icon" | "wordmark" | "full";
  className?: string;
  /** Se deve exibir o subtítulo "TAREFAS & METAS" abaixo do nome (padrão: true em wordmark) */
  showSubtitle?: boolean;
}

interface PaletteThemeConfig {
  id: ThemePalette;
  /** Gradiente do Z: início */
  z1: string;
  /** Gradiente do Z: fim */
  z2: string;
  /** Glow temático */
  glow: string;
  /** Estrela e destaques no Dark Mode */
  starDark: string;
  accentDark: string;
  /** Estrela e destaques no Light Mode (alta legibilidade) */
  starLight: string;
  accentLight: string;
}

const THEME_CONFIGS: Record<ThemePalette, PaletteThemeConfig> = {
  escuro: {
    id: "escuro",
    z1: "#00E5FF",
    z2: "#6366F1",
    glow: "rgba(0, 229, 255, 0.35)",
    starDark: "#00E5FF",
    accentDark: "#38BDF8",
    starLight: "#0284C7",
    accentLight: "#0369A1",
  },
  claro: {
    id: "claro",
    z1: "#F472B6",
    z2: "#FB923C",
    glow: "rgba(244, 114, 182, 0.35)",
    starDark: "#F472B6",
    accentDark: "#FB923C",
    starLight: "#DB2777",
    accentLight: "#C2410C",
  },
  verde: {
    id: "verde",
    z1: "#10B981",
    z2: "#4ADE80",
    glow: "rgba(16, 185, 129, 0.35)",
    starDark: "#4ADE80",
    accentDark: "#34D399",
    starLight: "#059669",
    accentLight: "#047857",
  },
  quente: {
    id: "quente",
    z1: "#F59E0B",
    z2: "#EA580C",
    glow: "rgba(245, 158, 11, 0.35)",
    starDark: "#FDE047",
    accentDark: "#F59E0B",
    starLight: "#D97706",
    accentLight: "#B45309",
  },
  roxo: {
    id: "roxo",
    z1: "#A855F7",
    z2: "#EC4899",
    glow: "rgba(168, 85, 247, 0.35)",
    starDark: "#F472B6",
    accentDark: "#C084FC",
    starLight: "#9333EA",
    accentLight: "#7E22CE",
  },
};

/**
 * Logotipo oficial do Zenith:
 * - Badge oficial squircle de "Novas Logos.png"
 * - Tipografia moderna "ZENITH" calibrada tanto para Modo Escuro quanto Modo Claro
 * - Estrela do Zênite sobre o "I" e micro-subtítulo "Tarefas & Metas"
 */
export function ZenithLogo({
  size = 36,
  palette = "auto",
  variant = "wordmark",
  className = "",
  showSubtitle = true,
}: ZenithLogoProps) {
  const uniqueId = useId().replace(/:/g, "");
  const themeContext = useTheme();

  const currentTheme = (themeContext?.palette as ThemePalette) || "escuro";
  const activePalette: ThemePalette =
    palette === "auto" ? currentTheme : palette;

  const isDarkMode = themeContext?.theme !== "light";
  const cfg = THEME_CONFIGS[activePalette] || THEME_CONFIGS.escuro;

  // Tamanhos proporcionais da tipografia
  const fontSize = Math.max(16, Math.round(size * 0.54));
  const starSize = Math.max(9, Math.round(size * 0.28));

  // Apenas o badge (ícone oficial squircle do tema)
  if (variant === "badge" || variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={`/logos/logo-${activePalette}-round.png`}
          alt={`Zenith Logo ${activePalette}`}
          width={size}
          height={size}
          className="shrink-0 select-none object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          style={{ width: `${size}px`, height: `${size}px` }}
          loading="eager"
        />
      </div>
    );
  }

  // Wordmark / Full: Badge Oficial + Tipografia Vetorial Elegante e Profissional
  return (
    <div
      className={`group inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 ${className}`}
      aria-label="Zenith - Tarefas & Metas"
    >
      {/* Badge Oficial Squircle (Novas Logos.png) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={`/logos/logo-${activePalette}-round.png`}
          alt={`Zenith Icon ${activePalette}`}
          width={size}
          height={size}
          className="shrink-0 select-none object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          style={{ width: `${size}px`, height: `${size}px` }}
          loading="eager"
        />
      </div>

      {/* Tipografia "ZENITH" calibrada para Light e Dark Mode */}
      <div className="flex flex-col justify-center min-w-0 leading-none select-none">
        <div className="flex items-center font-display font-black tracking-[0.06em] relative">
          {/* Z Vetorial Geométrico com degradê nativo e glow (imune a bugs de text-clip do Chromium) */}
          <svg
            viewBox="0 0 100 115"
            className="inline-block shrink-0 transition-transform duration-300 group-hover:scale-105 select-none"
            style={{
              width: `${Math.round(fontSize * 0.78)}px`,
              height: `${Math.round(fontSize * 0.88)}px`,
              filter: `drop-shadow(0 1px 5px ${cfg.glow})`,
              marginRight: "1px",
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`zenith-z-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.z1} />
                <stop offset="100%" stopColor={cfg.z2} />
              </linearGradient>
            </defs>
            {/* Geometria vetorial exata do Z em estilo Black / Heavy */}
            <path
              d="M 6 8 L 94 8 L 94 29 L 36 90 L 94 90 L 94 112 L 6 112 L 6 91 L 64 30 L 6 30 Z"
              fill={`url(#zenith-z-${uniqueId})`}
            />
          </svg>

          {/* E N */}
          <span
            className="transition-colors duration-200 select-none text-slate-900 dark:text-white"
            style={{ fontSize: `${fontSize}px` }}
          >
            EN
          </span>

          {/* I com Estrela do Zênite */}
          <span className="relative inline-flex flex-col items-center mx-[1.5px] select-none">
            <svg
              viewBox="0 0 24 24"
              className="absolute -top-[52%] left-1/2 -translate-x-1/2 shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 pointer-events-none"
              style={{ width: `${starSize}px`, height: `${starSize}px` }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill={isDarkMode ? cfg.starDark : cfg.starLight}
                fillOpacity="0.28"
              />
              <path
                d="M 12 2 Q 12 12 2 12 Q 12 12 12 22 Q 12 12 22 12 Q 12 12 12 2 Z"
                fill={isDarkMode ? cfg.starDark : cfg.starLight}
              />
              <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
            </svg>
            <span
              className="transition-colors duration-200 select-none text-slate-900 dark:text-white"
              style={{ fontSize: `${fontSize}px` }}
            >
              ı
            </span>
          </span>

          {/* T H */}
          <span
            className="transition-colors duration-200 select-none text-slate-900 dark:text-white"
            style={{ fontSize: `${fontSize}px` }}
          >
            TH
          </span>
        </div>

        {/* Micro-linha decorativa com degradê da marca */}
        <div
          className="mt-1 h-[2px] rounded-full transition-all duration-300 opacity-80 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, ${cfg.z1} 0%, ${cfg.z2} 65%, transparent 100%)`,
            boxShadow: `0 1px 4px ${cfg.glow}`,
          }}
        />

        {/* Subtítulo "TAREFAS & METAS" */}
        {showSubtitle && (
          <span
            className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-[0.22em] mt-1 transition-colors leading-tight"
            style={{
              color: isDarkMode ? cfg.accentDark : cfg.accentLight,
            }}
          >
            Tarefas &amp; Metas
          </span>
        )}
      </div>
    </div>
  );
}

