import type { Task } from "@/lib/types";
import { calculatePerformanceStats } from "@/lib/utils-domain";
import { useStore } from "@/lib/store";

/** Gráfico de barras com visual modernizado para produtividade semanal */
export function WeeklyChart({ tasks }: { tasks: Task[] }) {
  const { goals, categories } = useStore();
  const stats = calculatePerformanceStats(tasks, goals, categories);
  const data = stats.weeklyData;
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 340;
  const h = 130;
  const gap = 12;
  const barW = (w - gap * (data.length - 1)) / data.length;

  return (
    <figure className="m-0 select-none">
      <svg
        viewBox={`0 0 ${w} ${h + 26}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`Produtividade semanal: ${data.map((d) => `${d.label}: ${d.value}`).join(", ")}`}
      >
        <defs>
          <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {data.map((d, i) => {
          const bh = (d.value / max) * h;
          const x = i * (barW + gap);
          const hasValue = d.value > 0;

          return (
            <g key={`${d.label}-${i}`} className="group cursor-pointer">
              {/* Barra de Fundo */}
              <rect
                x={x}
                y={0}
                width={barW}
                height={h}
                rx={8}
                className="fill-secondary/40 transition-colors group-hover:fill-secondary/70"
              />

              {/* Barra de Progresso Real */}
              <rect
                x={x}
                y={h - bh}
                width={barW}
                height={Math.max(bh, hasValue ? 6 : 2)}
                rx={8}
                fill={hasValue ? "url(#bar-gradient)" : "var(--color-muted)"}
                className="transition-all duration-300 group-hover:opacity-90"
              />

              {/* Valor no Topo da Barra (quando houver) */}
              {hasValue && (
                <text
                  x={x + barW / 2}
                  y={Math.max(12, h - bh - 6)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--color-foreground)"
                >
                  {d.value}
                </text>
              )}

              {/* Dia da Semana */}
              <text
                x={x + barW / 2}
                y={h + 18}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="var(--color-muted-foreground)"
                className="group-hover:fill-foreground"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Tarefas concluídas por dia nos últimos 7 dias</span>
        <span className="font-medium text-foreground">
          Total: {data.reduce((acc, curr) => acc + curr.value, 0)} tarefas
        </span>
      </figcaption>
    </figure>
  );
}
