import { useId } from "react";
import { useTheme, type ThemePalette } from "@/lib/theme";

interface ZenithLogoProps {
  /** Tamanho em pixels (altura do badge ou altura do wordmark) */
  size?: number;
  /** Paleta específica ou "auto" para acompanhar o tema atual */
  palette?: ThemePalette | "auto";
  /**
   * "wordmark": Logo tipográfica unificada (ZENITH como uma peça só)
   * "badge" ou "icon": Apenas o "Z" geométrico estilizado
   */
  variant?: "badge" | "icon" | "wordmark" | "full";
  className?: string;
  /** Se deve exibir o subtítulo abaixo do wordmark (padrão: true) */
  showSubtitle?: boolean;
}

interface PaletteConfig {
  id: ThemePalette;
  /** Fundo escuro do badge */
  bg1: string;
  bg2: string;
  /** Borda do badge */
  border: string;
  innerRim: string;
  /** Glow atmosférico */
  glow: string;
  /** Gradiente primário: início */
  g1: string;
  /** Gradiente primário: fim */
  g2: string;
  /** Cor do texto das letras */
  text: string;
  /** Cor da estrela/sparkle */
  star: string;
  /** Cor do subtítulo */
  accent: string;
}

const PALETTE_CONFIGS: Record<ThemePalette, PaletteConfig> = {
  escuro: {
    id: "escuro",
    bg1: "#0A1628",
    bg2: "#060B17",
    border: "rgba(0, 229, 255, 0.30)",
    innerRim: "rgba(255, 255, 255, 0.06)",
    glow: "rgba(0, 229, 255, 0.20)",
    g1: "#6366F1",
    g2: "#00E5FF",
    text: "#FFFFFF",
    star: "#00E5FF",
    accent: "#00E5FF",
  },
  claro: {
    id: "claro",
    bg1: "#102042",
    bg2: "#091326",
    border: "rgba(56, 189, 248, 0.30)",
    innerRim: "rgba(255, 255, 255, 0.08)",
    glow: "rgba(56, 189, 248, 0.20)",
    g1: "#0284C7",
    g2: "#00F2FE",
    text: "#FFFFFF",
    star: "#38BDF8",
    accent: "#0284C7",
  },
  verde: {
    id: "verde",
    bg1: "#062617",
    bg2: "#03140C",
    border: "rgba(74, 222, 128, 0.30)",
    innerRim: "rgba(255, 255, 255, 0.06)",
    glow: "rgba(16, 185, 129, 0.20)",
    g1: "#059669",
    g2: "#4ADE80",
    text: "#FFFFFF",
    star: "#4ADE80",
    accent: "#10B981",
  },
  quente: {
    id: "quente",
    bg1: "#2B1405",
    bg2: "#180B03",
    border: "rgba(245, 158, 11, 0.30)",
    innerRim: "rgba(255, 255, 255, 0.06)",
    glow: "rgba(245, 158, 11, 0.20)",
    g1: "#EA580C",
    g2: "#FDE047",
    text: "#FFFFFF",
    star: "#FDE047",
    accent: "#F59E0B",
  },
  roxo: {
    id: "roxo",
    bg1: "#25073B",
    bg2: "#140420",
    border: "rgba(168, 85, 247, 0.30)",
    innerRim: "rgba(255, 255, 255, 0.06)",
    glow: "rgba(168, 85, 247, 0.20)",
    g1: "#EC4899",
    g2: "#A855F7",
    text: "#FFFFFF",
    star: "#F472B6",
    accent: "#EC4899",
  },
};

/**
 * Badge "Z" geométrico — para uso como ícone compacto
 * Contém o "Z" estilizado dentro de um squircle com arco e sparkle
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
        <linearGradient id={`bb-${uniqueId}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={config.bg1} />
          <stop offset="100%" stopColor={config.bg2} />
        </linearGradient>
        <radialGradient id={`bg-${uniqueId}`} cx="50%" cy="45%" r="45%">
          <stop offset="0%" stopColor={config.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`zg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.g1} />
          <stop offset="100%" stopColor={config.g2} />
        </linearGradient>
        <linearGradient id={`ag-${uniqueId}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={config.g1} stopOpacity="0.6" />
          <stop offset="50%" stopColor={config.g2} />
          <stop offset="100%" stopColor={config.g2} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`sf-${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor={config.star} stopOpacity="0.9" />
          <stop offset="100%" stopColor={config.star} stopOpacity="0" />
        </radialGradient>
        <filter id={`ds-${uniqueId}`} x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <clipPath id={`cp-${uniqueId}`}>
          <rect x="2" y="2" width="96" height="96" rx="24" />
        </clipPath>
      </defs>

      {/* Fundo squircle */}
      <rect x="2" y="2" width="96" height="96" rx="24" fill={`url(#bb-${uniqueId})`} />
      <circle cx="50" cy="45" r="40" fill={`url(#bg-${uniqueId})`} />

      <g clipPath={`url(#cp-${uniqueId})`}>
        {/* Arco decorativo semicircular atrás do Z */}
        <path
          d="M 18 68 A 34 34 0 0 1 82 68"
          stroke={`url(#ag-${uniqueId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />

        {/* Z geométrico bold — bloco estilizado */}
        <g filter={`url(#ds-${uniqueId})`}>
          {/* Barra superior do Z */}
          <path
            d="M 24 26 H 76 L 74 36 H 42"
            fill={`url(#zg-${uniqueId})`}
          />
          {/* Diagonal do Z */}
          <path
            d="M 42 36 L 74 36 L 58 64 L 26 64"
            fill={`url(#zg-${uniqueId})`}
            opacity="0.85"
          />
          {/* Barra inferior do Z */}
          <path
            d="M 26 64 H 58 L 24 74 H 76 L 58 64"
            fill={`url(#zg-${uniqueId})`}
          />
          {/* Highlight de brilho na aresta superior */}
          <path
            d="M 24 26 H 76"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Sparkle / Estrela no canto superior direito */}
        <circle cx="78" cy="22" r="10" fill={`url(#sf-${uniqueId})`} />
        <path
          d="M 78 14 Q 78 22 72 22 Q 78 22 78 30 Q 78 22 84 22 Q 78 22 78 14 Z"
          fill="#FFFFFF"
        />
        <circle cx="78" cy="22" r="1.4" fill="#FFFFFF" />
      </g>

      {/* Bordas do squircle */}
      <rect x="2" y="2" width="96" height="96" rx="24" stroke={config.border} strokeWidth="1.2" fill="none" />
      <rect x="3.5" y="3.5" width="93" height="93" rx="22.5" stroke={config.innerRim} strokeWidth="0.8" fill="none" />
    </svg>
  );
}

/**
 * Logo tipográfica criativa — "ZENITH"
 * Destaque para o Z com gradiente temático, letras futuristas e a Estrela do Zênite sobre o "I"
 */
function ZenithWordmarkText({
  size,
  config,
  showSubtitle,
}: {
  size: number;
  config: PaletteConfig;
  showSubtitle: boolean;
}) {
  // Proporção de escala proporcional ao size do badge
  const textSize = Math.max(16, Math.round(size * 0.56));
  const starSize = Math.max(10, Math.round(size * 0.32));

  return (
    <div className="flex flex-col justify-center min-w-0 leading-none select-none">
      <div className="flex items-center font-display font-black tracking-[0.08em] text-foreground relative">
        {/* Z — Geométrico marcante com gradiente vibrante da paleta */}
        <span
          className="transition-transform duration-300 group-hover:scale-105 inline-block select-none"
          style={{
            fontSize: `${textSize * 1.18}px`,
            background: `linear-gradient(135deg, ${config.g1} 0%, ${config.g2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 2px 8px ${config.glow})`,
          }}
        >
          Z
        </span>

        {/* E N */}
        <span
          className="transition-colors duration-200 group-hover:text-foreground/90 select-none"
          style={{ fontSize: `${textSize}px` }}
        >
          EN
        </span>

        {/* I coroado com a Estrela do Zênite */}
        <span className="relative inline-flex flex-col items-center mx-[1.5px] select-none">
          {/* Estrela de 4 pontas luminosa */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -top-[55%] left-1/2 -translate-x-1/2 shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 pointer-events-none"
            style={{ width: `${starSize}px`, height: `${starSize}px` }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="9" fill={config.star} fillOpacity="0.25" />
            <path
              d="M 12 2 Q 12 12 2 12 Q 12 12 12 22 Q 12 12 22 12 Q 12 12 12 2 Z"
              fill={config.star}
            />
            <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
          </svg>
          {/* Haste do I sem ponto (dotless ı para alinhamento e espaço para a estrela) */}
          <span
            className="transition-colors duration-200"
            style={{ fontSize: `${textSize}px` }}
          >
            ı
          </span>
        </span>

        {/* T H */}
        <span
          className="transition-colors duration-200 group-hover:text-foreground/90 select-none"
          style={{ fontSize: `${textSize}px` }}
        >
          TH
        </span>
      </div>

      {/* Traço luminoso decorativo de horizonte cósmico */}
      <div
        className="mt-1 h-[2px] rounded-full transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:h-[2.5px]"
        style={{
          background: `linear-gradient(90deg, ${config.g1} 0%, ${config.g2} 70%, transparent 100%)`,
          boxShadow: `0 1px 6px ${config.glow}`,
        }}
      />

      {showSubtitle && (
        <span
          className="text-[9px] font-bold uppercase tracking-[0.25em] mt-1 transition-colors"
          style={{ color: config.accent }}
        >
          Tarefas &amp; Metas
        </span>
      )}
    </div>
  );
}

/**
 * Logotipo oficial Zenith — Logo unificada (nome = logo)
 */
export function ZenithLogo({
  size = 36,
  palette = "auto",
  variant = "wordmark",
  className = "",
  showSubtitle = false,
}: ZenithLogoProps) {
  const uniqueId = useId().replace(/:/g, "");
  const themeContext = useTheme();

  const currentTheme = (themeContext?.palette as ThemePalette) || "escuro";
  const activePalette: ThemePalette =
    palette === "auto" ? currentTheme : palette;

  const config = PALETTE_CONFIGS[activePalette] || PALETTE_CONFIGS.escuro;

  // Apenas o badge (Z geométrico estilizado)
  if (variant === "badge" || variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <ZenithBadgeSvg size={size} config={config} uniqueId={uniqueId} />
      </div>
    );
  }

  // Wordmark — Logo com Badge e Tipografia Criativa
  return (
    <div className={`group inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 text-foreground ${className}`}>
      {/* Badge Z compacto */}
      <ZenithBadgeSvg size={size} config={config} uniqueId={`b-${uniqueId}`} />
      {/* Tipografia Criativa ZENITH */}
      <ZenithWordmarkText
        size={size}
        config={config}
        showSubtitle={showSubtitle}
      />
    </div>
  );
}
