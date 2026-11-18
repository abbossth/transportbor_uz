"use client";

import { MapPin, Route, Timer } from "lucide-react";
import { nextTrip, type Trip } from "@/lib/trips";
import { untilLabel } from "@/lib/dates";

export function HeroStats({ trips, now }: { trips: readonly Trip[]; now: Date | null }) {
  const places = new Set(trips.flatMap((t) => [t.from, t.to])).size;
  const next = now ? nextTrip(trips, now) : undefined;
  const nextText = now ? (next ? untilLabel(next.departure, now).replace(" qoldi", "") : "Qatnov yo‘q") : "…";

  const stats = [
    { Icon: Route, value: String(trips.length), label: "qatnov" },
    { Icon: MapPin, value: String(places), label: "hudud" },
    { Icon: Timer, value: nextText, label: next ? `eng yaqin jo‘nashgacha (${next.id})` : "eng yaqin jo‘nashgacha" },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Qisqa statistika">
      {stats.map(({ Icon, value, label }, i) => (
        <li
          key={label}
          className={`flex items-center gap-3 rounded-[16px] border border-line bg-card p-4 shadow-card ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl font-extrabold tabular-nums leading-tight">{value}</span>
            <span className="block text-sm text-muted">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
