import type { Trip } from "./trips";

/** Demo kuzatuv: GPS'siz, jo‘nash vaqtiga qarab bosqichlar. */
export const STAGES = ["Qabul qilindi", "Tasdiqlandi", "Yuklanmoqda", "Yo‘lda", "Yetib keldi"] as const;
export const CANCELLED = "Bekor qilindi";
export type RequestStatus = (typeof STAGES)[number] | typeof CANCELLED;
export const ALL_STATUSES: readonly RequestStatus[] = [...STAGES, CANCELLED];

/** Qo‘lda o‘rnatilgan holat bo‘lsa — u, aks holda jo‘nash vaqtidan hisoblangan bosqich. -1 = bekor qilingan. */
export function effectiveStage(trip: Pick<Trip, "departure"> | undefined, createdAt: string, status: RequestStatus | undefined, now: Date): number {
  if (status === CANCELLED) return -1;
  if (status) return STAGES.indexOf(status);
  return stageIndex(trip, createdAt, now);
}

export function stageIndex(trip: Pick<Trip, "departure"> | undefined, createdAt: string, now: Date): number {
  const t = now.getTime();
  const created = new Date(createdAt).getTime();
  if (!trip) return 0;
  const dep = new Date(trip.departure).getTime();
  if (t >= dep + 3 * 3600_000) return 4;
  if (t >= dep) return 3;
  if (t >= dep - 2 * 3600_000) return 2;
  if (t >= created + 10 * 60_000) return 1;
  return 0;
}

/** Hozirgi joylashuv (hudud darajasida): yo‘lda bo‘lsa — "X → Y oralig‘ida". */
export function locationLabel(trip: Pick<Trip, "from" | "to"> | undefined, stage: number): string {
  if (!trip) return "—";
  if (stage >= 4) return trip.to;
  if (stage === 3) return `${trip.from} → ${trip.to} yo‘lida`;
  return trip.from;
}
