"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ALL, countByDestination, filterTrips, groupByDate, type Destination, type Trip } from "@/lib/trips";
import { dayLabel } from "@/lib/dates";
import { useNow } from "@/lib/useNow";
import { DestinationFilter } from "./DestinationFilter";
import { TripCard } from "./TripCard";
import { EmptyState } from "./EmptyState";
import { RequestDialog } from "./RequestDialog";
import { HeroStats } from "./HeroStats";

type Props = { trips: Trip[]; initialFilter: Destination };

export function TripBoard({ trips, initialFilter }: Props) {
  const [filter, setFilterState] = useState<Destination>(initialFilter);
  const [selected, setSelected] = useState<Trip | null>(null);
  const listRef = useRef<HTMLElement>(null);
  const now = useNow();

  const tripIds = useMemo(() => trips.map((t) => t.id), [trips]);
  const counts = useMemo(() => countByDestination(trips), [trips]);
  const groups = useMemo(() => groupByDate(filterTrips(trips, filter)), [trips, filter]);

  const setFilter = useCallback((value: Destination) => {
    setFilterState(value);
    const url = new URL(window.location.href);
    if (value === ALL) url.searchParams.delete("to");
    else url.searchParams.set("to", value);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return (
    <>
      <HeroStats trips={trips} now={now} />

      <section ref={listRef} id="qatnovlar" aria-labelledby="trips-title" className="mt-12 scroll-mt-24">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="trips-title" className="text-2xl font-extrabold sm:text-3xl">
              Qatnovlar
            </h2>
            <p className="mt-1 text-muted">Yetib borish hududini tanlang va mos qatnovga so‘rov yuboring.</p>
          </div>
          <DestinationFilter value={filter} counts={counts} onChange={setFilter} />
        </div>

        <p className="sr-only" aria-live="polite">
          {filter === ALL ? "Barcha" : filter} qatnovlar: {counts[filter]} ta
        </p>

        <div className="mt-6 flex flex-col gap-8">
          {groups.length === 0 ? (
            <EmptyState destination={filter} onReset={() => setFilter(ALL)} />
          ) : (
            groups.map((group) => (
              <div key={group.date} className="tb-fade-up">
                <h3 className="mb-3 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-muted">
                  {dayLabel(group.date)}
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} now={now} onSelect={(t) => setSelected(t)} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <RequestDialog trip={selected} tripIds={tripIds} onClose={() => setSelected(null)} />
    </>
  );
}
