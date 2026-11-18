import { SearchX } from "lucide-react";

export function EmptyState({ destination, onReset }: { destination: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[16px] border border-dashed border-line bg-card px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-brand-ink">
        <SearchX className="size-7" aria-hidden />
      </span>
      <div>
        <h3 className="text-lg font-extrabold">Qatnov topilmadi</h3>
        <p className="mt-1 text-muted">“{destination}” yo‘nalishida hozircha qatnov yo‘q.</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 rounded-full bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
      >
        Barchasini ko‘rsatish
      </button>
    </div>
  );
}
