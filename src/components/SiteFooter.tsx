import { Suspense } from "react";
import { Info } from "lucide-react";
import { DataSourceBadge } from "./DataSourceBadge";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 pb-24 pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Bu sinov loyihasi: haqiqiy xarid, band qilish yoki xabar yuborish amalga oshirilmaydi.</span>
        </p>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <DataSourceBadge />
          </Suspense>
          <span>© 2026 TransportBor</span>
        </div>
      </div>
    </footer>
  );
}
