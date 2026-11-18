/** Yengil SVG diagrammalar (kutubxonasiz). Hover — <title> tooltip, ma’lumot jadvali sr-only. */

export type Slice = { label: string; value: number; color: string };

/** Holatlar ketma-ketligi uchun bir tusli yashil shkala (och → to‘q) + bekor qilingan uchun neytral. */
export const STAGE_COLORS = ["#A6F4C5", "#6CE9A6", "#32D583", "#12B76A", "#067647"];
export const CANCEL_COLOR = "#98A2B3";

export function DonutChart({ data, center, sub }: { data: Slice[]; center: string; sub: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  const visible = data.filter((x) => x.value > 0).length;
  const offsets = data.map((_, i) => data.slice(0, i).reduce((s, d) => s + (d.value / total) * c, 0));
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg viewBox="0 0 140 140" className="size-40 shrink-0" role="img" aria-label={`${center} ${sub}`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--line)" strokeWidth="16" />
        {data.map((d) => {
          if (d.value === 0) return null;
          const len = (d.value / total) * c;
          const gap = visible > 1 ? 2 : 0;
          return (
            <circle
              key={d.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="16"
              strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
              strokeDashoffset={-offsets[data.indexOf(d)]}
              transform="rotate(-90 70 70)"
              className="tb-fade-in transition-[stroke-width] hover:[stroke-width:20]"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
        })}
        <text x="70" y="68" textAnchor="middle" className="fill-ink font-display text-[26px] font-extrabold">
          {center}
        </text>
        <text x="70" y="88" textAnchor="middle" className="fill-muted text-[11px]">
          {sub}
        </text>
      </svg>
      <ul className="grid w-full grid-cols-1 gap-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm" style={{ background: d.color }} aria-hidden />
              {d.label}
            </span>
            <span className="font-semibold tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({ data, unit }: { data: { label: string; sub?: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex h-44 items-end gap-3 border-b border-line" role="img" aria-label={data.map((d) => `${d.label}: ${d.value} ${unit}`).join(", ")}>
        {data.map((d, i) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold tabular-nums text-muted group-hover:text-ink">{d.value}</span>
            <div
              title={`${d.label}${d.sub ? ` (${d.sub})` : ""}: ${d.value} ${unit}`}
              className="tb-bar w-full max-w-12 rounded-t-[4px] bg-brand transition-colors group-hover:bg-brand-hover"
              style={{ height: `${(d.value / max) * 82 + (d.value ? 2 : 0)}%`, animationDelay: `${i * 0.06}s` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <p className="font-mono text-xs font-bold">{d.label}</p>
            {d.sub && <p className="truncate text-[11px] text-muted">{d.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AreaChart({ points, unit }: { points: { label: string; value: number }[]; unit: string }) {
  const W = 320;
  const H = 120;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = W / Math.max(1, points.length - 1);
  const xy = points.map((p, i) => [i * step, H - 10 - (p.value / max) * (H - 30)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={points.map((p) => `${p.label}: ${p.value}`).join(", ")}>
        <defs>
          <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-fill)" className="tb-fade-in" />
        <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="tb-draw" />
        {xy.map(([x, y], i) => (
          <g key={points[i].label}>
            <circle cx={x} cy={y} r="4" fill="var(--card)" stroke="var(--brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <rect x={x - step / 2} y="0" width={step} height={H} fill="transparent">
              <title>{`${points[i].label}: ${points[i].value} ${unit}`}</title>
            </rect>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
