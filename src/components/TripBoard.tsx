"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL, countByDestination, filterTrips, groupByDate, type Destination, type Trip } from "@/lib/trips";
import { dayLabel } from "@/lib/dates";
import { useNow } from "@/lib/useNow";
import { DestinationFilter } from "./DestinationFilter";
import { TripCard } from "./TripCard";
import { EmptyState } from "./EmptyState";
import { RequestDialog } from "./RequestDialog";
import { HeroStats } from "./HeroStats";
import { UI_ACTION_EVENT, type UiAction } from "@/lib/ui-events";

type Props = { trips: Trip[]; initialFilter: Destination; initialTripId?: string };

export function TripBoard({ trips, initialFilter, initialTripId }: Props) {
  const [filter, setFilterState] = useState<Destination>(initialFilter);
  const [selected, setSelected] = useState<Trip | null>(() => trips.find((t) => t.id === initialTripId) ?? null);
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

  // Yordamchi amallari: filtr → ro‘yxatga scroll; select → so‘rov shaklini ochish
  useEffect(() => {
    function onAction(event: Event) {
      const action = (event as CustomEvent<UiAction>).detail;
      if (action.type === "filter") {
        setFilter(action.value);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        listRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      } else if (action.type === "select") {
        const trip = trips.find((t) => t.id === action.value);
        if (trip) setSelected(trip);
      }
    }
    window.addEventListener(UI_ACTION_EVENT, onAction);
    return () => window.removeEventListener(UI_ACTION_EVENT, onAction);
  }, [trips, setFilter]);

  function closeDialog() {
    setSelected(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("trip")) {
      url.searchParams.delete("trip");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

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

      <RequestDialog trip={selected} tripIds={tripIds} onClose={closeDialog} />
    </>
  );
}
