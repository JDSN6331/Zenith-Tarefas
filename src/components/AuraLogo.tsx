import React from "react";

export function AuraLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-all duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="aura-dynamic-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="60%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
          <linearGradient id="aura-dynamic-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>

        {/* Halo / Glow Exterior que adapta ao tema */}
        <circle cx="24" cy="24" r="21" fill="url(#aura-dynamic-grad-1)" fillOpacity="0.18" />

        {/* Anel Externo Geométrico */}
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="12"
          stroke="url(#aura-dynamic-grad-1)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Núcleo Prismático de Foco */}
        <path
          d="M24 12L34 29H14L24 12Z"
          fill="url(#aura-dynamic-grad-1)"
          stroke="url(#aura-dynamic-grad-2)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Ponto Central de Clareza */}
        <circle
          cx="24"
          cy="24"
          r="3.2"
          className="fill-background"
          stroke="var(--color-primary)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
