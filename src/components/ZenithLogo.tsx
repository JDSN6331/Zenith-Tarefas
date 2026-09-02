import React from "react";

export function ZenithLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
      >
        <defs>
          {/* Gradiente da Estrela do Zênite (Ponto Mais Alto da Esfera Celeste) */}
          <linearGradient id="zenith-star-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>

          {/* Gradiente da Trajetória Z Celeste */}
          <linearGradient id="zenith-z-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="50%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>

          {/* Halo Celestial do Zênite */}
          <radialGradient id="zenith-sky-halo" cx="50%" cy="20%" r="65%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.45" />
            <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Fundo Squircle / Moldura Estilo App com Brilho Cósmico */}
        <rect
          x="3.5"
          y="3.5"
          width="41"
          height="41"
          rx="12"
          className="fill-card/90 stroke-primary/30"
          strokeWidth="1.2"
        />

        {/* Halo Celestial irradiando do ponto mais alto (Zênite) */}
        <circle cx="24" cy="20" r="19" fill="url(#zenith-sky-halo)" />

        {/* Arco do Horizonte Celeste (Base da Abóbada Celeste) */}
        <path
          d="M8 34C13 39 35 39 40 34"
          stroke="var(--color-primary)"
          strokeOpacity="0.4"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Anel Orbital de Foco e Produtividade */}
        <ellipse
          cx="24"
          cy="26"
          rx="14"
          ry="7"
          stroke="var(--color-accent)"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Símbolo 'Z' — Trajetória de Ascensão ao Zênite */}
        {/* Topo do Z (Nível Superior de Metas) */}
        <path
          d="M14 18H34"
          stroke="url(#zenith-z-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Viga Diagonal de Impulso (Vetor que aponta para o Zênite) */}
        <path
          d="M34 18L14 32"
          stroke="url(#zenith-z-grad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Base do Z (Fundação e Hábitos Diários) */}
        <path
          d="M14 32H34"
          stroke="url(#zenith-z-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* ============================================================== */}
        {/* A ESTRELA DO ZÊNITE (O Ponto Mais Alto no Topo da Esfera Celeste) */}
        {/* ============================================================== */}
        {/* Fachos de Luz Cruzados da Estrela do Zênite */}
        <line
          x1="24"
          y1="1"
          x2="24"
          y2="17"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <line
          x1="16"
          y1="9"
          x2="32"
          y2="9"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* Estrela de 4 Pontas Radiante (Zenith Star) */}
        <path
          d="M24 3Q24 9 18 9Q24 9 24 15Q24 9 30 9Q24 9 24 3Z"
          fill="url(#zenith-star-glow)"
        />

        {/* Núcleo Brilhante da Estrela */}
        <circle cx="24" cy="9" r="1.6" className="fill-white" />
      </svg>
    </div>
  );
}
