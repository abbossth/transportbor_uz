"use client";

import { forwardRef, type PointerEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, CalendarClock, Clock, Truck } from "lucide-react";
import { routeLabel, whenLabel, type Trip } from "@/lib/trips";
import { untilLabel } from "@/lib/dates";

type Props = { trip: Trip; now: Date | null; onSelect: (trip: Trip) => void };

const EASE = [0.22, 1, 0.36, 1] as const;

function trackPointer(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export const TripCard = forwardRef<HTMLElement, Props>(function TripCard({ trip, now, onSelect }, ref) {
  const until = now ? untilLabel(trip.departure, now) : null;
  const departed = until === "Jo‘nab ketgan";
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: EASE }}
      onPointerMove={trackPointer}
      aria-labelledby={`trip-${trip.id}-title`}
      className="spotlight group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-card shadow-card transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-brand/60 hover:shadow-pop"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <span className="rounded-xl bg-brand-soft px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-brand-ink">{trip.id}</span>
        <span
          className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
            departed ? "bg-danger/10 text-danger-ink" : "bg-bg text-muted"
          }`}
        >
          <Clock className="size-3.5" aria-hidden />
          {until ?? "…"}
        </span>
      </div>

      <h3 id={`trip-${trip.id}-title`} className="sr-only">
        {trip.id}: {routeLabel(trip)}
      </h3>

      {/* Yo‘nalish: nuqta — punktir — nuqta */}
      <div className="grid grid-cols-[28px_1fr] gap-x-3 px-5 pt-5" aria-hidden>
        <div className="relative row-span-2 flex flex-col items-center">
          <span className="mt-1.5 size-3.5 shrink-0 rounded-full border-[3px] border-brand bg-card" />
          <svg className="my-1 w-1 flex-1" preserveAspectRatio="none" viewBox="0 0 4 100">
            <line x1="2" y1="0" x2="2" y2="100" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" className="tb-dash-flow text-line group-hover:text-brand" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="mb-1.5 size-3.5 shrink-0 rounded-full bg-brand ring-4 ring-brand-soft" />
          <span className="absolute left-1/2 top-[38%] grid size-6 -translate-x-1/2 place-items-center rounded-full border border-line bg-card text-brand-ink shadow-card transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-3">
            <Truck className="size-3.5" />
          </span>
        </div>
        <p className="min-w-0 pb-5">
          <span className="block text-xs font-medium text-muted">Qayerdan</span>
          <span className="block break-words font-display text-lg font-extrabold leading-tight">{trip.from}</span>
        </p>
        <p className="min-w-0">
          <span className="block text-xs font-medium text-muted">Qayerga</span>
          <span className="block break-words font-display text-lg font-extrabold leading-tight">{trip.to}</span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
        <p className="flex items-center gap-2 text-sm font-semibold tabular-nums">
          <CalendarClock className="size-4 text-muted" aria-hidden />
          <span className="sr-only">Jo‘nash vaqti:</span>
          {whenLabel(trip)}
        </p>
        <button
          type="button"
          onClick={() => onSelect(trip)}
          aria-label={`${trip.id} qatnovini tanlash: ${routeLabel(trip)}`}
          className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover"
        >
          Tanlash
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </button>
      </div>
    </motion.article>
  );
});
