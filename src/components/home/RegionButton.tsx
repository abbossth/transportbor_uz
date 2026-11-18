"use client";

import type { ReactNode } from "react";
import { dispatchUiAction } from "@/lib/ui-events";
import type { Destination } from "@/lib/trips";

export function RegionButton({ value, label, children }: { value: Destination; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => dispatchUiAction({ type: "filter", value })}
      className="press group relative isolate flex h-72 w-full flex-col justify-end overflow-hidden rounded-[24px] p-6 text-left text-white shadow-card hover:shadow-pop sm:h-80"
    >
      {children}
    </button>
  );
}
