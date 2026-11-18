"use client";

import { forwardRef } from "react";
import { CheckCircle2, Info, List, RotateCcw } from "lucide-react";
import type { RequestRecord } from "@/lib/types";

type Props = { record: RequestRecord; onBackToList: () => void; onAgain: () => void };

export const Confirmation = forwardRef<HTMLHeadingElement, Props>(function Confirmation(
  { record, onBackToList, onAgain },
  headingRef,
) {
  const rows: [string, string, boolean?][] = [
    ["Qatnov", record.tripId, true],
    ["Yo‘nalish", record.route],
    ["Jo‘nash vaqti", record.when, true],
    ["Ism", record.name],
    ["Yuk tavsifi", record.cargo],
  ];
  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-brand-ink">
          <CheckCircle2 className="size-9" aria-hidden />
        </span>
        <h2 ref={headingRef} tabIndex={-1} id="dialog-title" className="text-2xl font-extrabold outline-none">
          So‘rovingiz qabul qilindi
        </h2>
      </div>

      {/* Chipta */}
      <div className="relative overflow-hidden rounded-[16px] border border-line bg-bg">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-line px-5 py-4">
          <span className="text-sm text-muted">So‘rov raqami</span>
          <span className="font-mono text-lg font-bold tabular-nums tracking-wider text-brand-ink">{record.code}</span>
        </div>
        <span className="absolute -left-2.5 top-[52px] size-5 rounded-full border border-line bg-card" aria-hidden />
        <span className="absolute -right-2.5 top-[52px] size-5 rounded-full border border-line bg-card" aria-hidden />
        <dl className="divide-y divide-line px-5">
          {rows.map(([label, value, nums]) => (
            <div key={label} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-sm text-muted">{label}</dt>
              <dd className={`min-w-0 break-words font-semibold sm:text-right ${nums ? "tabular-nums" : ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm text-ink">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
        Bu sinov so‘rovi, haqiqiy band qilinmadi.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onAgain}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold transition-colors hover:bg-brand-soft"
        >
          <RotateCcw className="size-4" aria-hidden />
          Yana so‘rov yuborish
        </button>
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          <List className="size-4" aria-hidden />
          Ro‘yxatga qaytish
        </button>
      </div>
    </div>
  );
});
