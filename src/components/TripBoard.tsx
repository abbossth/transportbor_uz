"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL, countByDestination, filterTrips, groupByDate, type Destination, type Trip } from "@/lib/trips";
import { dayLabel } from "@/lib/dates";
import { useNow } from "@/lib/useNow";
import { DestinationFilter } from "./DestinationFilter";
import { TripCard } from "./TripCard";
import { EmptyState } from "./EmptyState";
import { RequestDialog } from "./RequestDialog";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { scrollToId } from "@/lib/scroll";
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
        scrollToId("qatnovlar");
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
      <section ref={listRef} id="qatnovlar" aria-labelledby="trips-title" className="scroll-mt-16 pt-20 sm:pt-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink">Qatnovlar</p>
          <h2 id="trips-title" className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">
            Mos qatnovni tanlang
          </h2>
          <p className="mt-3 max-w-xl text-muted">Yetib borish hududi bo‘yicha saralang va qatnovga so‘rov yuboring.</p>
        </div>

        <div className="sticky top-16 z-30 mt-6 border-y border-transparent py-3 backdrop-blur-xl [background:color-mix(in_srgb,var(--bg)_82%,transparent)]">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <LayoutGroup id="destination-filter">
              <DestinationFilter value={filter} counts={counts} onChange={setFilter} />
            </LayoutGroup>
            <p className="hidden text-sm text-muted sm:block" aria-live="polite">
              <span className="font-bold tabular-nums text-ink">{counts[filter]}</span> ta qatnov
              {filter === ALL ? "" : ` · ${filter}ga`}
            </p>
            <p className="sr-only sm:hidden" aria-live="polite">
              {counts[filter]} ta qatnov
            </p>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[1200px] px-4 sm:px-6">
          <LayoutGroup id="trip-list">
            <AnimatePresence mode="popLayout" initial={false}>
              {groups.length === 0 ? (
                <motion.div key="empty" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState destination={filter} onReset={() => setFilter(ALL)} />
                </motion.div>
              ) : (
                groups.map((group) => (
                  <motion.div
                    key={group.date}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-10"
                  >
                    <motion.h3 layout="position" className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-muted">
                      {dayLabel(group.date)}
                      <span className="h-px flex-1 bg-line" aria-hidden />
                    </motion.h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {group.trips.map((trip) => (
                          <TripCard key={trip.id} trip={trip} now={now} onSelect={(t) => setSelected(t)} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </section>

      <RequestDialog trip={selected} tripIds={tripIds} onClose={closeDialog} />
    </>
  );
}
