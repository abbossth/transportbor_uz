"use client";

import { DESTINATIONS, type Destination } from "@/lib/trips";

type Props = {
  value: Destination;
  counts: Record<Destination, number>;
  onChange: (value: Destination) => void;
};

export function DestinationFilter({ value, counts, onChange }: Props) {
  return (
    <div role="group" aria-label="Yetib borish hududi bo‘yicha filtr" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {DESTINATIONS.map((dest) => {
        const active = dest === value;
        return (
          <button
            key={dest}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(dest)}
            className={`flex min-h-11 items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition-all sm:justify-start ${
              active
                ? "border-brand bg-brand text-on-brand shadow-card"
                : "border-line bg-card text-ink hover:border-brand hover:bg-brand-soft"
            }`}
          >
            <span>{dest}</span>
            <span
              className={`min-w-6 rounded-full px-2 py-0.5 text-xs tabular-nums ${
                active ? "bg-on-brand/15 text-on-brand" : "bg-bg text-muted"
              }`}
              aria-label={`${counts[dest]} ta qatnov`}
            >
              {counts[dest]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
