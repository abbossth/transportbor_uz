"use client";

import { Loader2, Mic, Square } from "lucide-react";

export type VoiceState = "idle" | "recording" | "processing";

type Props = { state: VoiceState; onClick: () => void; disabled?: boolean; size?: "md" | "sm"; className?: string };

export function VoiceButton({ state, onClick, disabled, size = "md", className = "" }: Props) {
  const dim = size === "md" ? "size-11" : "size-10";
  const recording = state === "recording";
  const label = recording ? "Yozishni to‘xtatish" : state === "processing" ? "Ovoz tahlil qilinmoqda" : "Ovoz bilan so‘rash";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "processing"}
      aria-label={label}
      aria-pressed={recording}
      title={label}
      className={`grid ${dim} shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-60 ${
        recording ? "tb-recording border-danger bg-danger text-white" : "border-line bg-card text-ink hover:border-brand hover:bg-brand-soft"
      } ${className}`}
    >
      {state === "processing" ? (
        <Loader2 className="size-5 animate-spin" aria-hidden />
      ) : recording ? (
        <Square className="size-4 fill-current" aria-hidden />
      ) : (
        <Mic className="size-5" aria-hidden />
      )}
    </button>
  );
}
