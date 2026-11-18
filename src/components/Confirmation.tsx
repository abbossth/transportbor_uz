"use client";

import { forwardRef, useEffect, useRef } from "react";
import { Info, List, RotateCcw } from "lucide-react";
import type { RequestRecord } from "@/lib/types";

type Props = { record: RequestRecord; onBackToList: () => void; onAgain: () => void };

const BRAND_COLORS = ["#12B76A", "#0BA5A4", "#4ADE94", "#E7F8EF"];

/** Qisqa (≈1 soniya) brend rangidagi confetti — dialog ichidagi canvas'da (top-layer ustida). */
function useConfetti(canvas: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    if (!canvas.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let reset: (() => void) | undefined;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled || !canvas.current) return;
      const fire = confetti.create(canvas.current, { resize: true, useWorker: true });
      reset = fire.reset;
      void fire({ particleCount: 70, spread: 75, startVelocity: 32, gravity: 1.3, decay: 0.9, ticks: 70, scalar: 0.9, origin: { x: 0.5, y: 0.22 }, colors: BRAND_COLORS });
    });
    return () => {
      cancelled = true;
      reset?.();
    };
  }, [canvas]);
}

export const Confirmation = forwardRef<HTMLHeadingElement, Props>(function Confirmation({ record, onBackToList, onAgain }, headingRef) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useConfetti(canvasRef);

  const rows: [string, string, boolean?][] = [
    ["Qatnov", record.tripId, true],
    ["Yo‘nalish", record.route],
    ["Jo‘nash vaqti", record.when, true],
    ["Ism", record.name],
    ["Yuk tavsifi", record.cargo],
  ];

  return (
    <div className="relative flex flex-col gap-5 p-5 sm:p-7" role="status" aria-live="polite">
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full" />

      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="var(--brand-soft)" />
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--brand)" strokeWidth="3" pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="tb-draw" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
          <path d="M20 33 l8 8 l16 -18" fill="none" stroke="var(--brand)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="tb-draw" style={{ animationDelay: "0.45s", animationDuration: "0.5s" }} />
        </svg>
        <h2 ref={headingRef} tabIndex={-1} id="dialog-title" className="text-2xl font-extrabold tracking-[-0.02em] outline-none">
          So‘rovingiz qabul qilindi
        </h2>
      </div>

      {/* Chipta */}
      <div className="tb-ticket-up relative rounded-[22px] border border-line bg-bg shadow-card">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <span className="text-sm text-muted">So‘rov raqami</span>
          <span className="font-mono text-lg font-bold tabular-nums tracking-wider text-brand-ink">{record.code}</span>
        </div>
        <div className="relative h-0 border-t-2 border-dashed border-line" aria-hidden>
          <span className="absolute -left-3 -top-3 size-6 rounded-full border border-line bg-card [clip-path:inset(0_0_0_50%)]" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full border border-line bg-card [clip-path:inset(0_50%_0_0)]" />
        </div>
        <dl className="divide-y divide-line px-5">
          {rows.map(([label, value, nums]) => (
            <div key={label} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-sm text-muted">{label}</dt>
              <dd className={`min-w-0 break-words font-semibold sm:text-right ${nums ? "tabular-nums" : ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="flex items-start gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-ink">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
        Bu sinov so‘rovi, haqiqiy band qilinmadi.
      </p>


      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onAgain}
          className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold hover:bg-brand-soft"
        >
          <RotateCcw className="size-4" aria-hidden />
          Yana so‘rov yuborish
        </button>
        <button
          type="button"
          onClick={onBackToList}
          className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover"
        >
          <List className="size-4" aria-hidden />
          Ro‘yxatga qaytish
        </button>
      </div>
    </div>
  );
});
