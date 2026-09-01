import { weeklyProductivity } from "@/lib/utils-domain";
import type { Task } from "@/lib/types";

/** Gráfico de barras em SVG puro — produtividade dos últimos 7 dias. */
export function WeeklyChart({ tasks }: { tasks: Task[] }) {
  const data = weeklyProductivity(tasks);
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 320;
  const h = 120;
  const gap = 10;
  const barW = (w - gap * (data.length - 1)) / data.length;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${w} ${h + 22}`}
        className="w-full"
        role="img"
        aria-label={`Produtividade semanal: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
      >
        {data.map((d, i) => {
          const bh = (d.value / max) * h;
          const x = i * (barW + gap);
          return (
            <g key={`${d.label}-${i}`}>
              <rect
                x={x}
                y={h - bh}
                width={barW}
                height={Math.max(bh, 2)}
                rx={6}
                fill={d.value > 0 ? "var(--color-primary)" : "var(--color-muted)"}
              />
              <text
                x={x + barW / 2}
                y={h + 16}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-muted-foreground)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Tarefas concluídas por dia nos últimos 7 dias
      </figcaption>
    </figure>
  );
}
