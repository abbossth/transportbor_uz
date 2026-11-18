"use client";

import { motion } from "motion/react";
import { DESTINATIONS, type Destination } from "@/lib/trips";

type Props = {
  value: Destination;
  counts: Record<Destination, number>;
  onChange: (value: Destination) => void;
};

export function DestinationFilter({ value, counts, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Yetib borish hududi bo‘yicha filtr"
      className="grid grid-cols-2 gap-1.5 rounded-[22px] border border-line bg-card p-1.5 shadow-card sm:inline-grid sm:grid-cols-4"
    >
      {DESTINATIONS.map((dest) => {
        const active = dest === value;
        return (
          <button
            key={dest}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(dest)}
            className={`press relative flex min-h-11 items-center justify-between gap-3 rounded-2xl px-4 text-sm font-bold sm:justify-center ${
              active ? "text-on-brand" : "text-ink hover:bg-bg"
            }`}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-brand shadow-[0_6px_18px_-6px_rgb(18_183_106/0.65)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative">{dest}</span>
            <span
              className={`relative min-w-6 rounded-full px-2 py-0.5 text-center text-xs tabular-nums ${
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
