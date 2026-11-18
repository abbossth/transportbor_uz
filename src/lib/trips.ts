export type Trip = {
  id: string;
  from: string;
  to: string;
  /** "20.11.2026" */
  date: string;
  /** "09:00" */
  time: string;
  /** ISO 8601, Toshkent vaqti (+05:00) */
  departure: string;
};

/** Bilet 006 boshlang‘ich ma’lumotlari: o‘zgartirilmaydi. */
export const TRIPS: readonly Trip[] = [
  { id: "Y01", from: "Viloyat markazi", to: "A tumani", date: "20.11.2026", time: "09:00", departure: "2026-11-20T09:00:00+05:00" },
  { id: "Y02", from: "Viloyat markazi", to: "B tumani", date: "20.11.2026", time: "10:00", departure: "2026-11-20T10:00:00+05:00" },
  { id: "Y03", from: "A tumani", to: "B tumani", date: "20.11.2026", time: "14:00", departure: "2026-11-20T14:00:00+05:00" },
  { id: "Y04", from: "B tumani", to: "C tumani", date: "21.11.2026", time: "09:00", departure: "2026-11-21T09:00:00+05:00" },
  { id: "Y05", from: "C tumani", to: "A tumani", date: "21.11.2026", time: "11:00", departure: "2026-11-21T11:00:00+05:00" },
];

export const ALL = "Barchasi";
export const DESTINATIONS = [ALL, "A tumani", "B tumani", "C tumani"] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const TRIP_IDS: readonly string[] = TRIPS.map((t) => t.id);

export function isDestination(value: unknown): value is Destination {
  return typeof value === "string" && (DESTINATIONS as readonly string[]).includes(value);
}

/** "Qayerga" ustuni bo‘yicha filtr. */
export function filterTrips(trips: readonly Trip[], dest: Destination): Trip[] {
  if (dest === ALL) return [...trips];
  return trips.filter((t) => t.to === dest);
}

export function countByDestination(trips: readonly Trip[]): Record<Destination, number> {
  return Object.fromEntries(
    DESTINATIONS.map((d) => [d, filterTrips(trips, d).length]),
  ) as Record<Destination, number>;
}

export function findTrip(trips: readonly Trip[], id: unknown): Trip | undefined {
  if (typeof id !== "string") return undefined;
  const key = id.trim().toUpperCase();
  return trips.find((t) => t.id === key);
}

export function routeLabel(trip: Pick<Trip, "from" | "to">): string {
  return `${trip.from} → ${trip.to}`;
}

export function whenLabel(trip: Pick<Trip, "date" | "time">): string {
  return `${trip.date}, ${trip.time}`;
}

/** Sana bo‘yicha guruhlash (tartib saqlanadi). */
export function groupByDate(trips: readonly Trip[]): { date: string; trips: Trip[] }[] {
  const groups: { date: string; trips: Trip[] }[] = [];
  for (const trip of [...trips].sort((a, b) => a.departure.localeCompare(b.departure))) {
    const last = groups.at(-1);
    if (last && last.date === trip.date) last.trips.push(trip);
    else groups.push({ date: trip.date, trips: [trip] });
  }
  return groups;
}

/** Hali jo‘namagan eng yaqin qatnov. */
export function nextTrip(trips: readonly Trip[], now: Date): Trip | undefined {
  return [...trips]
    .filter((t) => new Date(t.departure).getTime() > now.getTime())
    .sort((a, b) => a.departure.localeCompare(b.departure))[0];
}
