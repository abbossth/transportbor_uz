"use client";

import { useState, type CSSProperties } from "react";
import { MapPin, Warehouse } from "lucide-react";
import { TRIPS, routeLabel, whenLabel } from "@/lib/trips";
import { dispatchUiAction } from "@/lib/ui-events";

/**
 * Yo‘nalishlar sxemasi (xarita emas): markaz-hub, 3 ta hudud "bekati" va 5 ta qatnov.
 * Yo‘nalish ustiga kelinsa yorishadi va tafsilot chiqadi; bosilsa shu qatnovning so‘rov shakli ochiladi.
 */
const W = 440;
const H = 380;

const NODES = [
  { name: "Viloyat markazi", x: 78, y: 188, hub: true },
  { name: "A tumani", x: 340, y: 64, hub: false },
  { name: "B tumani", x: 384, y: 214, hub: false },
  { name: "C tumani", x: 226, y: 330, hub: false },
] as const;

const PATHS: Record<string, { d: string; tip: [number, number] }> = {
  Y01: { d: "M78 188 C 140 110, 236 64, 340 64", tip: [190, 96] },
  Y02: { d: "M78 188 C 180 204, 280 226, 384 214", tip: [232, 214] },
  Y03: { d: "M340 64 C 400 104, 406 164, 384 214", tip: [396, 140] },
  Y04: { d: "M384 214 C 364 292, 300 330, 226 330", tip: [326, 302] },
  Y05: { d: "M226 330 C 222 236, 258 132, 340 64", tip: [246, 222] },
};

const ROUTES = TRIPS.map((t) => ({ ...t, ...PATHS[t.id] })).filter((r) => r.d);

export function RouteSchematic() {
  const [active, setActive] = useState<string | null>(null);
  const activeRoute = ROUTES.find((r) => r.id === active);

  return (
    <figure className="glass-surface relative hidden overflow-hidden rounded-[28px] p-5 text-ink shadow-pop lg:block">
      {/* Fon: nuqtali to‘r va yumshoq nur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(color-mix(in_srgb,var(--muted)_35%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(70%_70%_at_50%_45%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand/20 blur-3xl" />

      <div className="relative mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1 text-xs font-bold">
          <span className="tb-dot-pulse size-2 rounded-full bg-brand" aria-hidden />
          Jonli sxema
        </span>
        <span className="text-xs text-muted">Yo‘nalishni bosing</span>
      </div>

      <div className="relative" style={{ width: W, height: H }} onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="absolute inset-0 overflow-visible">
          <defs>
            <linearGradient id="rs-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="var(--route-a)" />
              <stop offset="1" stopColor="var(--route-b)" />
            </linearGradient>
            <filter id="rs-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {ROUTES.map((r, i) => {
            const on = active === r.id;
            const dim = active !== null && !on;
            return (
              <g key={r.id} style={{ opacity: dim ? 0.25 : 1, transition: "opacity 250ms" }}>
                {/* yorug‘lik (glow) */}
                <path d={r.d} fill="none" stroke="url(#rs-grad)" strokeWidth={on ? 10 : 6} strokeLinecap="round" opacity={on ? 0.45 : 0.18} filter="url(#rs-glow)" />
                {/* asosiy chiziq — ketma-ket chiziladi */}
                <path
                  d={r.d}
                  pathLength={1}
                  fill="none"
                  stroke="url(#rs-grad)"
                  strokeWidth={on ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  className="tb-draw"
                  style={{ animationDelay: `${0.4 + i * 0.22}s`, transition: "stroke-width 200ms" }}
                />
                {/* oqim */}
                <path d={r.d} fill="none" stroke="var(--card)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 14" className="rs-flow" opacity="0.9" />
                {/* sichqoncha uchun keng zona */}
                <path
                  d={r.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="22"
                  className="cursor-pointer"
                  style={{ pointerEvents: "stroke" }}
                  onMouseEnter={() => setActive(r.id)}
                  onClick={() => dispatchUiAction({ type: "select", value: r.id })}
                />
              </g>
            );
          })}
        </svg>

        {/* Harakatlanayotgan qatnov "pill"lari */}
        {ROUTES.map((r, i) => (
          <span
            key={`p-${r.id}`}
            aria-hidden
            className="tb-truck pointer-events-none absolute left-0 top-0 inline-flex items-center gap-1 rounded-full border border-line bg-card px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand-ink shadow-card transition-opacity duration-200"
            style={
              {
                offsetPath: `path("${r.d}")`,
                offsetAnchor: "center",
                animationName: "rs-drive",
                animationDuration: `${9 + i * 1.7}s`,
                animationDelay: `${1.6 + i * 0.35}s`,
                opacity: active && active !== r.id ? 0.3 : 1,
              } as CSSProperties
            }
          >
            <span className="size-1.5 rounded-full bg-brand" />
            {r.id}
          </span>
        ))}

        {/* Bekatlar */}
        {NODES.map((n, i) => (
          <div
            key={n.name}
            className="tb-fade-in pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: n.x, top: n.y, animationDelay: `${0.2 + i * 0.12}s` }}
          >
            {n.hub && <span aria-hidden className="rs-hub-ring absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand/50" />}
            <span
              className={`relative grid place-items-center rounded-2xl border-2 border-card shadow-pop ${
                n.hub ? "size-12 bg-gradient-to-br from-brand to-teal text-white" : "size-9 bg-card text-brand-ink ring-1 ring-line"
              }`}
            >
              {n.hub ? <Warehouse className="size-6" aria-hidden /> : <MapPin className="size-[18px]" aria-hidden />}
            </span>
            <span
              className={`absolute whitespace-nowrap rounded-full border border-line bg-card/95 px-2.5 py-1 text-xs font-bold shadow-card ${
                n.hub ? "left-1/2 top-full mt-2 -translate-x-1/2" : n.name === "C tumani" ? "left-full top-1/2 ml-2 -translate-y-1/2" : "right-full top-1/2 mr-2 -translate-y-1/2"
              }`}
            >
              {n.name}
            </span>
          </div>
        ))}

        {/* Tafsilot */}
        {activeRoute && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-2xl border border-line bg-card p-3 shadow-pop"
            style={{ left: activeRoute.tip[0], top: activeRoute.tip[1], animation: "tb-fade-in 0.18s ease-out both" }}
          >
            <p className="flex items-center justify-between gap-2">
              <span className="rounded-lg bg-brand-soft px-2 py-0.5 font-mono text-xs font-bold text-brand-ink">{activeRoute.id}</span>
              <span className="text-xs font-semibold tabular-nums text-muted">{whenLabel(activeRoute)}</span>
            </p>
            <p className="mt-1.5 text-sm font-bold leading-snug">{routeLabel(activeRoute)}</p>
            <p className="mt-1 text-xs font-semibold text-brand-ink">Bosing — so‘rov shakli ochiladi</p>
          </div>
        )}
      </div>

      {/* Klaviatura uchun ham qulay: yo‘nalishlar ro‘yxati */}
      <figcaption className="relative mt-4">
        <span className="sr-only">Yo‘nalishlar sxemasi. Bu xarita emas, faqat sxema.</span>
        <ul className="flex flex-wrap gap-1.5" aria-label="Yo‘nalishlar">
          {ROUTES.map((r) => (
            <li key={`b-${r.id}`}>
              <button
                type="button"
                onMouseEnter={() => setActive(r.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(r.id)}
                onBlur={() => setActive(null)}
                onClick={() => dispatchUiAction({ type: "select", value: r.id })}
                aria-label={`${r.id}: ${routeLabel(r)}, ${whenLabel(r)} — so‘rov shaklini ochish`}
                className={`press rounded-full border px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${
                  active === r.id ? "border-brand bg-brand text-on-brand" : "border-line bg-card text-ink hover:border-brand"
                }`}
              >
                {r.id}
              </button>
            </li>
          ))}
          <li className="ml-auto self-center text-[11px] text-muted">Xarita emas — sxema</li>
        </ul>
      </figcaption>
    </figure>
  );
}
