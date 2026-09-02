import React, { useId } from "react";
import { useTheme, type ThemePalette } from "@/lib/theme";

interface ZenithLogoProps {
  size?: number;
  palette?: ThemePalette | "auto";
  variant?: "badge" | "icon";
  className?: string;
}

interface PaletteThemeConfig {
  bgGradient: [string, string];
  bgBorder: string;
  haloGradient: [string, string];
  mountainDark: string;
  mountainMid: string;
  mountainLight: string;
  starColor: string;
}

const PALETTE_CONFIGS: Record<ThemePalette, PaletteThemeConfig> = {
  claro: {
    bgGradient: ["#F8FAFC", "#0A192F"],
    bgBorder: "rgba(2, 132, 199, 0.3)",
    haloGradient: ["#4F46E5", "#00F2FE"],
    mountainDark: "#0B192C",
    mountainMid: "#1E3A8A",
    mountainLight: "#2563EB",
    starColor: "#FFFFFF",
  },
  escuro: {
    bgGradient: ["#080E1A", "#0F1E36"],
    bgBorder: "rgba(0, 229, 255, 0.25)",
    haloGradient: ["#6366F1", "#00E5FF"],
    mountainDark: "#080E1A",
    mountainMid: "#1E293B",
    mountainLight: "#1E40AF",
    starColor: "#FFFFFF",
  },
  verde: {
    bgGradient: ["#04140D", "#072E1D"],
    bgBorder: "rgba(74, 222, 128, 0.25)",
    haloGradient: ["#10B981", "#4ADE80"],
    mountainDark: "#022C22",
    mountainMid: "#064E3B",
    mountainLight: "#059669",
    starColor: "#FFFFFF",
  },
  quente: {
    bgGradient: ["#140C06", "#2B1608"],
    bgBorder: "rgba(245, 158, 11, 0.25)",
    haloGradient: ["#EA580C", "#FDE047"],
    mountainDark: "#451A03",
    mountainMid: "#78350F",
    mountainLight: "#B45309",
    starColor: "#FFFFFF",
  },
  roxo: {
    bgGradient: ["#12081C", "#260F3A"],
    bgBorder: "rgba(236, 72, 153, 0.25)",
    haloGradient: ["#EC4899", "#A855F7"],
    mountainDark: "#2E1065",
    mountainMid: "#581C87",
    mountainLight: "#7E22CE",
    starColor: "#FFFFFF",
  },
};

export function ZenithLogo({
  size = 36,
  palette = "auto",
  variant = "badge",
  className = "",
}: ZenithLogoProps) {
  const id = useId().replace(/:/g, "");
  const themeContext = useTheme();
  
  // Determina a paleta ativa
  const activePalette: ThemePalette =
    palette === "auto"
      ? (themeContext?.palette as ThemePalette) || "escuro"
      : palette;

  const config = PALETTE_CONFIGS[activePalette] || PALETTE_CONFIGS.escuro;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105 select-none"
      >
        <defs>
          {/* Gradiente do Fundo Squircle */}
          <linearGradient id={`zenith-bg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.bgGradient[0]} />
            <stop offset="100%" stopColor={config.bgGradient[1]} />
          </linearGradient>

          {/* Gradiente do Arco Celestial (Halo) */}
          <linearGradient id={`zenith-halo-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={config.haloGradient[0]} />
            <stop offset="100%" stopColor={config.haloGradient[1]} />
          </linearGradient>

          {/* Gradiente da Crista Branca do Pico */}
          <linearGradient id={`zenith-crest-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Gradiente da Face Esquerda da Montanha */}
          <linearGradient id={`zenith-mtn-left-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.mountainMid} />
            <stop offset="100%" stopColor={config.mountainDark} />
          </linearGradient>

          {/* Gradiente da Face Direita da Montanha */}
          <linearGradient id={`zenith-mtn-right-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.mountainLight} />
            <stop offset="100%" stopColor={config.mountainDark} />
          </linearGradient>

          {/* Sombra Suave da Montanha */}
          <linearGradient id={`zenith-mtn-sub-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.mountainLight} stopOpacity="0.8" />
            <stop offset="100%" stopColor={config.mountainDark} stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 1. Fundo Squircle (se variant === "badge") */}
        {variant === "badge" && (
          <>
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="26"
              fill={`url(#zenith-bg-${id})`}
            />
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="26"
              stroke={config.bgBorder}
              strokeWidth="1.5"
              fill="none"
            />
          </>
        )}

        {/* 2. Arco Celestial Luminoso (Halo do Zênite) */}
        <path
          d="M 18 54 A 34 34 0 0 1 82 54"
          fill="none"
          stroke={`url(#zenith-halo-${id})`}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 3. A Estrela do Zênite (4 Pontas no Topo Direito) */}
        <path
          d="M 72 24 Q 72 30 66 30 Q 72 30 72 36 Q 72 30 78 30 Q 72 30 72 24 Z"
          fill={config.starColor}
          filter="drop-shadow(0px 0px 3px rgba(255,255,255,0.8))"
        />

        {/* 4. Montanha Facetada em 3D */}
        {/* Base / Face Esquerda */}
        <path
          d="M 50 30 L 12 88 L 52 88 L 50 56 Z"
          fill={`url(#zenith-mtn-left-${id})`}
        />

        {/* Face Principal Direita */}
        <path
          d="M 50 30 L 50 56 L 52 88 L 88 88 Z"
          fill={`url(#zenith-mtn-right-${id})`}
        />

        {/* Faceta Angular de Iluminação Secundária */}
        <path
          d="M 50 56 L 68 88 L 88 88 Z"
          fill={`url(#zenith-mtn-sub-${id})`}
        />

        {/* 5. A Crista / Chevron Branco Luminoso do Topo (O Pico do Zênite) */}
        {/* Borda Externa de Iluminação */}
        <path
          d="M 24 70 L 50 28 L 76 70"
          fill="none"
          stroke="url(#zenith-crest-${id})"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Núcleo Branco Puro da Crista */}
        <path
          d="M 26 68 L 50 30 L 74 68"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
