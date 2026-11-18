import { Suspense } from "react";
import { Info } from "lucide-react";
import { TripBoard } from "@/components/TripBoard";
import { getTrips } from "@/lib/store";
import { ALL, isDestination } from "@/lib/trips";

async function TripsSection({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const to = Array.isArray(params.to) ? params.to[0] : params.to;
  const { trips } = await getTrips();
  return <TripBoard trips={trips} initialFilter={isDestination(to) ? to : ALL} />;
}

function BoardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-[78px] rounded-[16px] bg-line/60 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`} />
        ))}
      </div>
      <div className="mt-12 h-9 w-48 rounded-lg bg-line/60" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-[16px] bg-line/60" />
        ))}
      </div>
    </div>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <section aria-labelledby="hero-title" className="mb-8 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-ink">
          Kichik yuk uchun transport
        </p>
        <h1 id="hero-title" className="text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
          Yukingizga mos qatnovni <span className="text-brand-ink">bir daqiqada</span> toping
        </h1>
        <p className="mt-4 text-lg text-muted">
          Qatnovni tanlang, ismingiz va yukning qisqa tavsifini yozing — so‘rovingiz shu zahoti qabul qilinadi.
        </p>
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Sinov loyihasi: haqiqiy band qilish amalga oshirilmaydi.
        </p>
      </section>

      <Suspense fallback={<BoardSkeleton />}>
        <TripsSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
