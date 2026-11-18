import { Truck } from "lucide-react";
import type { CSSProperties } from "react";

/** Oddiy sxema (xarita emas): 4 ta hudud va 5 ta qatnov yo‘nalishi. */
const NODES = [
  { id: "VM", label: "Viloyat markazi", x: 70, y: 210, anchor: "end" as const, dx: -14, dy: 5 },
  { id: "A", label: "A tumani", x: 330, y: 70, anchor: "start" as const, dx: 14, dy: -6 },
  { id: "B", label: "B tumani", x: 370, y: 250, anchor: "start" as const, dx: 0, dy: 30 },
  { id: "C", label: "C tumani", x: 210, y: 350, anchor: "middle" as const, dx: 0, dy: 32 },
];

const ROUTES = [
  { id: "Y01", d: "M70 210 Q 170 90 330 70", lx: 185, ly: 112 },
  { id: "Y02", d: "M70 210 Q 210 260 370 250", lx: 215, ly: 250 },
  { id: "Y03", d: "M330 70 Q 400 150 370 250", lx: 392, ly: 158 },
  { id: "Y04", d: "M370 250 Q 320 340 210 350", lx: 312, ly: 328 },
  { id: "Y05", d: "M210 350 Q 230 170 330 70", lx: 254, ly: 192 },
];

export function RouteSchematic() {
  return (
    <figure className="glass relative hidden rounded-[24px] p-5 text-white shadow-pop lg:block">
      <div className="relative h-[400px] w-[440px]">
        <svg
          viewBox="0 0 440 400"
          width={440}
          height={400}
          role="img"
          aria-labelledby="schema-title"
          className="absolute inset-0 overflow-visible"
        >
          <title id="schema-title">
            Yo‘nalishlar sxemasi: Y01 Viloyat markazi → A tumani, Y02 Viloyat markazi → B tumani, Y03 A tumani → B tumani, Y04 B tumani →
            C tumani, Y05 C tumani → A tumani
          </title>
          <defs>
            <linearGradient id="route-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#4ade94" />
              <stop offset="1" stopColor="#5eead4" />
            </linearGradient>
          </defs>
          {ROUTES.map((r) => (
            <path key={`base-${r.id}`} d={r.d} fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="6" strokeLinecap="round" />
          ))}
          {ROUTES.map((r, i) => (
            <path
              key={r.id}
              d={r.d}
              pathLength={1}
              fill="none"
              stroke="url(#route-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
              className="tb-draw"
              style={{ animationDelay: `${0.5 + i * 0.28}s` }}
            />
          ))}
          {ROUTES.map((r, i) => (
            <g key={`l-${r.id}`} className="tb-fade-in" style={{ animationDelay: `${1 + i * 0.28}s` }}>
              <rect x={r.lx - 19} y={r.ly - 11} width="38" height="22" rx="11" fill="#0b1220" fillOpacity="0.75" stroke="white" strokeOpacity="0.25" />
              <text x={r.lx} y={r.ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="white" className="tabular-nums">
                {r.id}
              </text>
            </g>
          ))}
          {NODES.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="14" fill="#12b76a" fillOpacity="0.2" />
              <circle cx={n.x} cy={n.y} r="7" fill="#12b76a" stroke="white" strokeWidth="2.5" />
              <text x={n.x + n.dx} y={n.y + n.dy} textAnchor={n.anchor} fontSize="13" fontWeight="700" fill="white">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
        {ROUTES.map((r, i) => (
          <span
            key={`t-${r.id}`}
            aria-hidden
            className="tb-truck absolute left-0 top-0 grid size-7 place-items-center rounded-full bg-white text-brand-ink shadow-card"
            style={
              {
                offsetPath: `path("${r.d}")`,
                offsetAnchor: "center",
                animationDuration: `${7 + i * 1.3}s`,
                animationDelay: `${2 + i * 0.4}s`,
              } as CSSProperties
            }
          >
            <Truck className="size-4" />
          </span>
        ))}
      </div>
      <figcaption className="mt-2 flex items-center justify-between text-xs text-white/75">
        <span className="font-semibold text-white">Yo‘nalishlar sxemasi</span>
        <span>Bu xarita emas, faqat sxema</span>
      </figcaption>
    </figure>
  );
}
