"use client";

import { CalendarDays, MapPin, Route, Timer } from "lucide-react";
import { TRIPS, nextTrip } from "@/lib/trips";
import { untilLabel } from "@/lib/dates";
import { useNow } from "@/lib/useNow";
import { CountUp } from "./CountUp";

const PLACES = new Set(TRIPS.flatMap((t) => [t.from, t.to])).size;
const DAYS = new Set(TRIPS.map((t) => t.date)).size;

export function TrustRow() {
  const now = useNow(1000 * 30);
  const next = now ? nextTrip(TRIPS, now) : undefined;
  const stats = [
    { Icon: Route, value: TRIPS.length, label: "ta qatnov" },
    { Icon: MapPin, value: PLACES, label: "ta hudud" },
    { Icon: CalendarDays, value: DAYS, label: "kun ichida" },
  ];
  return (
    <section id="ishonch" aria-label="Qisqa ma’lumot" className="relative z-10 mx-auto -mt-10 max-w-[1200px] scroll-mt-24 px-4 sm:px-6">
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[24px] border border-line bg-line shadow-pop lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
        {stats.map(({ Icon, value, label }) => (
          <div key={label} className="flex flex-col items-start gap-2 bg-card p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink sm:size-12">
              <Icon className="size-5 sm:size-6" aria-hidden />
            </span>
            <p className="min-w-0">
              <span className="block font-display text-2xl font-extrabold leading-none sm:text-4xl">
                <CountUp value={value} />
              </span>
              <span className="mt-1 block text-xs text-muted sm:text-sm">{label}</span>
            </p>
          </div>
        ))}
        <div className="col-span-3 flex items-center gap-4 bg-card p-4 sm:p-6 lg:col-span-1">
          <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-teal text-white">
            <Timer className="size-6" aria-hidden />
          </span>
          <p className="min-w-0" aria-live="off">
            <span className="block text-sm text-muted">Eng yaqin jo‘nash{next ? ` · ${next.id}` : ""}</span>
            <span className="block font-display text-xl font-extrabold tabular-nums sm:text-2xl">
              {now ? (next ? untilLabel(next.departure, now).replace(" qoldi", "") : "Qatnov qolmagan") : "…"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
