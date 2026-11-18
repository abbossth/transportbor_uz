import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { TrustRow } from "@/components/home/TrustRow";
import { Regions } from "@/components/home/Regions";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AssistantPromo } from "@/components/home/AssistantPromo";
import { Photo } from "@/components/Photo";
import { TripBoard } from "@/components/TripBoard";
import { getTrips } from "@/lib/store";
import { ALL, isDestination } from "@/lib/trips";

async function TripsSection({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const to = Array.isArray(params.to) ? params.to[0] : params.to;
  const trip = Array.isArray(params.trip) ? params.trip[0] : params.trip;
  const { trips } = await getTrips();
  return (
    <TripBoard
      trips={trips}
      initialFilter={isDestination(to) ? to : ALL}
      initialTripId={typeof trip === "string" ? trip.toUpperCase() : undefined}
    />
  );
}

function BoardSkeleton() {
  return (
    <div aria-hidden className="mx-auto max-w-[1200px] animate-pulse px-4 pt-24 sm:px-6">
      <div className="h-12 w-72 rounded-lg bg-line/60" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-[22px] bg-line/60" />
        ))}
      </div>
    </div>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Hero />
      <TrustRow />
      <Suspense fallback={<BoardSkeleton />}>
        <TripsSection searchParams={searchParams} />
      </Suspense>
      <Regions />
      <HowItWorks photo={<Photo name="van-city" sizes="(min-width: 1024px) 50vw, 100vw" tone="teal" />} />
      <AssistantPromo />
    </>
  );
}
