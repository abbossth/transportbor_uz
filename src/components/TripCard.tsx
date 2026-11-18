"use client";

import { ArrowRight, CalendarClock, Clock } from "lucide-react";
import { routeLabel, whenLabel, type Trip } from "@/lib/trips";
import { untilLabel } from "@/lib/dates";
import { RouteLine } from "./RouteLine";

type Props = { trip: Trip; now: Date | null; onSelect: (trip: Trip, trigger: HTMLButtonElement) => void };

export function TripCard({ trip, now, onSelect }: Props) {
  const until = now ? untilLabel(trip.departure, now) : null;
  const departed = until === "Jo‘nab ketgan";
  return (
    <article
      aria-labelledby={`trip-${trip.id}-title`}
      className="group flex flex-col gap-4 rounded-[16px] border border-line bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-pop"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-lg bg-brand-soft px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-brand-ink">
          {trip.id}
        </span>
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
      <RouteLine from={trip.from} to={trip.to} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex items-center gap-2 text-sm font-medium tabular-nums">
          <CalendarClock className="size-4 text-muted" aria-hidden />
          <span className="sr-only">Jo‘nash vaqti:</span>
          {whenLabel(trip)}
        </p>
        <button
          type="button"
          onClick={(e) => onSelect(trip, e.currentTarget)}
          aria-label={`${trip.id} qatnovini tanlash: ${routeLabel(trip)}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          Tanlash
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </div>
    </article>
  );
}
