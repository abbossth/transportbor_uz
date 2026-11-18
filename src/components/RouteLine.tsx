type Props = { from: string; to: string; size?: "md" | "lg" };

/** Nuqta va chiziqdan iborat vizual yo‘l: Qayerdan → Qayerga. */
export function RouteLine({ from, to, size = "md" }: Props) {
  const text = size === "lg" ? "text-lg" : "text-base";
  return (
    <div className="grid grid-cols-[14px_1fr] gap-x-3" aria-label={`${from} → ${to}`} role="img">
      <span className="mt-1.5 size-3.5 rounded-full border-[3px] border-brand bg-card" aria-hidden />
      <p className={`min-w-0 break-words font-semibold leading-snug ${text}`}>
        <span className="block text-xs font-medium text-muted">Qayerdan</span>
        {from}
      </p>
      <span className="mx-auto my-1 h-5 w-0 border-l-2 border-dashed border-line" aria-hidden />
      <span aria-hidden />
      <span className="mt-1.5 size-3.5 rounded-full bg-brand ring-4 ring-brand-soft" aria-hidden />
      <p className={`min-w-0 break-words font-semibold leading-snug ${text}`}>
        <span className="block text-xs font-medium text-muted">Qayerga</span>
        {to}
      </p>
    </div>
  );
}
