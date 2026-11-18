const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
] as const;

const WEEKDAYS = [
  "yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba",
] as const;

/** "20.11.2026" → "20-noyabr, juma" */
export function dayLabel(date: string): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  if (!match) return date;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm) - 1;
  const weekday = new Date(Date.UTC(Number(yyyy), month, day)).getUTCDay();
  return `${day}-${MONTHS[month]}, ${WEEKDAYS[weekday]}`;
}

/** Jo‘nashgacha qolgan vaqt: "2 kun 3 soat qoldi", "45 daqiqa qoldi" yoki "Jo‘nab ketgan". */
export function untilLabel(iso: string, now: Date): string {
  const diff = new Date(iso).getTime() - now.getTime();
  if (!Number.isFinite(diff) || diff <= 0) return "Jo‘nab ketgan";

  const totalMinutes = Math.max(1, Math.floor(diff / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days} kun ${hours} soat qoldi` : `${days} kun qoldi`;
  if (hours > 0) return minutes > 0 ? `${hours} soat ${minutes} daqiqa qoldi` : `${hours} soat qoldi`;
  return `${minutes} daqiqa qoldi`;
}
