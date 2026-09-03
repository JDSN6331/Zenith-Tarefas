import React, { useId } from "react";
import { useTheme, type ThemePalette } from "@/lib/theme";

interface ZenithLogoProps {
  /** Tamanho do ícone/badge em pixels (padrão: 36) */
  size?: number;
  /** Paleta específica ou "auto" para acompanhar o tema atual */
  palette?: ThemePalette | "auto";
  /** 
   * "wordmark": Logo 2-em-1 (Emblema + Nome "Zenith" com estrela no 'i' + Subtítulo)
   * "badge" ou "icon": Apenas o emblema squircle estilizado
   */
  variant?: "badge" | "icon" | "wordmark" | "full";
  className?: string;
  /** Se deve exibir o subtítulo "TAREFAS & METAS" no wordmark (padrão: true) */
  showSubtitle?: boolean;
}

interface PaletteConfig {
  id: ThemePalette;
  bg1: string;
  bg2: string;
  border: string;
  innerRim: string;
  glow: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  star: string;
  accent: string;
}

const PALETTE_CONFIGS: Record<ThemePalette, PaletteConfig> = {
  escuro: {
    id: "escuro",
    bg1: "#060B17",
    bg2: "#0B152B",
    border: "rgba(0, 229, 255, 0.35)",
    innerRim: "rgba(255, 255, 255, 0.08)",
    glow: "rgba(0, 229, 255, 0.35)",
    c1: "#E0F7FA",
    c2: "#00E5FF",
    c3: "#00B0FF",
    c4: "#6366F1",
    star: "#00E5FF",
    accent: "#00E5FF",
  },
  claro: {
    id: "claro",
    bg1: "#091326",
    bg2: "#102042",
    border: "rgba(56, 189, 248, 0.35)",
    innerRim: "rgba(255, 255, 255, 0.1)",
    glow: "rgba(56, 189, 248, 0.35)",
    c1: "#F0F9FF",
    c2: "#38BDF8",
    c3: "#0284C7",
    c4: "#4F46E5",
    star: "#38BDF8",
    accent: "#0284C7",
  },
  verde: {
    id: "verde",
    bg1: "#03140C",
    bg2: "#062617",
    border: "rgba(74, 222, 128, 0.35)",
    innerRim: "rgba(255, 255, 255, 0.08)",
    glow: "rgba(16, 185, 129, 0.35)",
    c1: "#F0FDF4",
    c2: "#4ADE80",
    c3: "#10B981",
    c4: "#059669",
    star: "#4ADE80",
    accent: "#10B981",
  },
  quente: {
    id: "quente",
    bg1: "#180B03",
    bg2: "#2B1405",
    border: "rgba(245, 158, 11, 0.35)",
    innerRim: "rgba(255, 255, 255, 0.08)",
    glow: "rgba(245, 158, 11, 0.35)",
    c1: "#FEFCE8",
    c2: "#FDE047",
    c3: "#F59E0B",
    c4: "#EA580C",
    star: "#FDE047",
    accent: "#F59E0B",
  },
  roxo: {
    id: "roxo",
    bg1: "#140420",
    bg2: "#25073B",
    border: "rgba(236, 72, 153, 0.35)",
    innerRim: "rgba(255, 255, 255, 0.08)",
    glow: "rgba(168, 85, 247, 0.35)",
    c1: "#FDF2F8",
    c2: "#F472B6",
    c3: "#EC4899",
    c4: "#A855F7",
    star: "#F472B6",
    accent: "#EC4899",
  },
};

/**
 * Emblema vetorial geométrico do Zenith
 */
function ZenithBadgeSvg({
  size,
  config,
  uniqueId,
}: {
  size: number;
  config: PaletteConfig;
  uniqueId: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        <linearGradient id={`bg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.bg1} />
          <stop offset="100%" stopColor={config.bg2} />
        </linearGradient>

        <radialGradient id={`glow-${uniqueId}`} cx="50%" cy="48%" r="48%">
          <stop offset="0%" stopColor={config.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <linearGradient id={`z-grad-${uniqueId}`} x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor={config.c1} />
          <stop offset="25%" stopColor={config.c2} />
          <stop offset="60%" stopColor={config.c3} />
          <stop offset="100%" stopColor={config.c4} />
        </linearGradient>

        <linearGradient id={`bevel-up-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={`star-flare-${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor={config.star} stopOpacity="0.95" />
          <stop offset="100%" stopColor={config.star} stopOpacity="0" />
        </radialGradient>

        <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Squircle Badge Container */}
      <rect x="2" y="2" width="96" height="96" rx="24" fill={`url(#bg-${uniqueId})`} />
      <circle cx="50" cy="48" r="42" fill={`url(#glow-${uniqueId})`} />
      <rect x="2" y="2" width="96" height="96" rx="24" stroke={config.border} strokeWidth="1.2" fill="none" />
      <rect x="3.5" y="3.5" width="93" height="93" rx="22.5" stroke={config.innerRim} strokeWidth="0.8" fill="none" />

      {/* Órbita Celestial em Elipse */}
      <ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="17"
        transform="rotate(-28 50 50)"
        stroke={config.c2}
        strokeWidth="1.2"
        strokeDasharray="3 4"
        opacity="0.3"
        fill="none"
      />

      {/* Monograma Z Geométrico Facetado */}
      <g filter={`url(#shadow-${uniqueId})`}>
        <path
          d="
            M 26 25
            H 74
            C 76.5 25 78 27 77.5 29.5
            L 75 38
            C 74.5 39.5 73 40.5 71.5 40.5
            L 45 40.5
            L 74.5 61.5
            C 76 62.5 77 64 77 66
            V 73
            C 77 75 75 75 73 75
            H 26
            C 23.5 75 22 73 22.5 70.5
            L 25 61.5
            C 25.5 60 27 59 28.5 59
            H 55
            L 25.5 38
            C 24 37 23 35.5 23 33.5
            V 27
            C 23 25 24.5 25 26 25
            Z
          "
          fill={`url(#z-grad-${uniqueId})`}
        />

        <path
          d="M 26 26 H 73 L 26 60.5"
          stroke={`url(#bevel-up-${uniqueId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Estrela de Zênite no Cume */}
      <circle cx="75" cy="23" r="14" fill={`url(#star-flare-${uniqueId})`} />
      <path
        d="M 75 11 Q 75 23 65 23 Q 75 23 75 35 Q 75 23 85 23 Q 75 23 75 11 Z"
        fill="#FFFFFF"
      />
      <circle cx="75" cy="23" r="1.8" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Logotipo oficial Zenith — Design moderno, elegante e inteligente
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

  const config = PALETTE_CONFIGS[activePalette] || PALETTE_CONFIGS.escuro;

  // Apenas o emblema (badge/icon)
  if (variant === "badge" || variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <ZenithBadgeSvg size={size} config={config} uniqueId={uniqueId} />
      </div>
    );
  }

  // Logo completa 2-em-1 (Emblema + Nome "Zenith" com estrela + Subtítulo)
  return (
    <div className={`group inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 ${className}`}>
      {/* Emblema squircle luxuoso */}
      <ZenithBadgeSvg size={size} config={config} uniqueId={uniqueId} />

      {/* Tipografia Moderna Integrada */}
      <div className="flex flex-col justify-center min-w-0 leading-none">
        <div className="flex items-center tracking-tight">
          {/* "Zen" */}
          <span className="font-display text-lg sm:text-xl font-extrabold text-foreground transition-colors group-hover:text-primary">
            Zen
          </span>

          {/* Letra 'i' com a Estrela do Zênite como pingo */}
          <span className="relative inline-flex flex-col items-center">
            {/* Estrela de 4 pontas luminosa */}
            <svg
              viewBox="0 0 20 20"
              className="size-3 -mb-0.5 shrink-0 transition-transform duration-300 group-hover:scale-125"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="8" fill={config.star} fillOpacity="0.25" />
              <path
                d="M 10 2 Q 10 10 2 10 Q 10 10 10 18 Q 10 10 18 10 Q 10 10 10 2 Z"
                fill={config.star}
              />
              <circle cx="10" cy="10" r="1.5" fill="#FFFFFF" />
            </svg>
            {/* Haste do 'i' (usando dotless ı para alinhamento tipográfico perfeito) */}
            <span className="font-display text-lg sm:text-xl font-extrabold text-foreground transition-colors group-hover:text-primary">
              ı
            </span>
          </span>

          {/* "th" */}
          <span className="font-display text-lg sm:text-xl font-extrabold text-foreground transition-colors group-hover:text-primary">
            th
          </span>
        </div>

        {/* Subtítulo elegante com tracking expandido */}
        {showSubtitle && (
          <span
            className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 transition-colors"
            style={{ color: config.accent }}
          >
            Metas &amp; Tarefas
          </span>
        )}
      </div>
    </div>
  );
}
