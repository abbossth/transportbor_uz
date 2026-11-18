/**
 * Lokal buyruq tahlilchisi — Gemini yo‘q, internet yo‘q yoki xato bo‘lganda.
 * Gemini bilan bir xil { reply, action } formatini qaytaradi.
 */
import { ALL, findTrip, nextTrip, routeLabel, whenLabel, type Destination, type Trip } from "./trips.ts";
import { untilLabel } from "./dates.ts";
import { NO_ACTION, type AssistantAction, type CargoSummary } from "./assistant-types.ts";

export type LocalIntent = { reply: string; action: AssistantAction };

const ORDINALS: Record<string, number> = {
  birinchi: 1, ikkinchi: 2, uchinchi: 3, "to'rtinchi": 4, tortinchi: 4, beshinchi: 5,
  "1-": 1, "2-": 2, "3-": 3, "4-": 4, "5-": 5,
};
const SPOKEN_DIGITS: Record<string, string> = { bir: "1", ikki: "2", uch: "3", "to'rt": "4", tort: "4", besh: "5" };

/** Kichik harf, apostroflarni birxillashtirish, kirill harflarini lotinga. */
export function normalizeQuery(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh",
    ъ: "'", ь: "", э: "e", ю: "yu", я: "ya", ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
  };
  return input
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/[а-яёўқғҳ]/g, (ch) => map[ch] ?? ch)
    .replace(/[?!.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function destinationFrom(q: string): { dest: Destination; direction: "to" | "from" } | null {
  // "b tumani", "bi tumaniga", "be-tuman", "s tumani" (kirill "с" → s), "ts tumani" (ц)
  const m = /(?:^|\s)(a|b|bi|be|c|s|si|se|ts)\s*-?\s*tuman(\w*)/.exec(q);
  if (!m) return null;
  const letter = m[1].startsWith("a") ? "A" : m[1].startsWith("b") ? "B" : "C";
  const suffix = m[2] ?? "";
  return { dest: `${letter} tumani` as Destination, direction: /dan$/.test(suffix) ? "from" : "to" };
}

function tripIdFrom(q: string): string | null {
  const direct = /(?:^|[^a-z])(?:y|u|igrek|i)\s*-?\s*0?\s*([1-5])(?![0-9])/.exec(q);
  if (direct) return `Y0${direct[1]}`;
  const spoken = /(?:y|igrek)\s*(?:nol\s*)?(bir|ikki|uch|to'rt|tort|besh)\b/.exec(q);
  if (spoken) return `Y0${SPOKEN_DIGITS[spoken[1]]}`;
  for (const [word, n] of Object.entries(ORDINALS)) {
    if (q.includes(`${word} qatnov`) || q.includes(`${word}qatnov`)) return `Y0${n}`;
  }
  return null;
}

function listText(trips: Trip[]): string {
  return trips.map((t) => `${t.id}: ${routeLabel(t)}, ${whenLabel(t)}`).join("; ");
}

export function parseIntent(text: string, trips: readonly Trip[], now: Date = new Date()): LocalIntent {
  const q = normalizeQuery(text);
  if (!q) return { reply: "Savolingizni yozing yoki mikrofon tugmasini bosing.", action: NO_ACTION };

  if (/narx|qancha turadi|necha pul|to'lov|tolov|pul/.test(q)) {
    return { reply: "Bu sinov loyihasida narx hisoblash yo‘q. Men faqat qatnovni topish va so‘rov shaklini ochishda yordam beraman.", action: NO_ACTION };
  }
  if (/gps|xarita|joylashuv|qayerda ketyapti/.test(q)) {
    return { reply: "Xarita va GPS kuzatuvi bu sinov loyihasida yo‘q.", action: NO_ACTION };
  }
  if (/sig'im|sigim|necha kilo|kg|og'irlik|haydovchi|telefon|qo'ng'iroq/.test(q)) {
    return { reply: "Yuk sig‘imini tekshirish va haydovchi bilan bog‘lanish bu sinov loyihasida yo‘q.", action: NO_ACTION };
  }

  const id = tripIdFrom(q);
  if (id) {
    const trip = findTrip(trips, id);
    if (trip) {
      return { reply: `${trip.id} qatnovi: ${routeLabel(trip)}, ${whenLabel(trip)}. So‘rov shaklini ochdim — ismingiz va yuk tavsifini kiriting.`, action: { type: "select", value: trip.id } };
    }
    return { reply: `${id} raqamli qatnov yo‘q. Mavjud qatnovlar: Y01–Y05.`, action: NO_ACTION };
  }

  const dest = destinationFrom(q);
  if (dest) {
    if (dest.direction === "from") {
      const from = trips.filter((t) => t.from === dest.dest);
      return {
        reply: from.length ? `${dest.dest}dan jo‘naydigan qatnovlar: ${listText(from)}.` : `${dest.dest}dan jo‘naydigan qatnov yo‘q.`,
        action: NO_ACTION,
      };
    }
    const list = trips.filter((t) => t.to === dest.dest);
    return {
      reply: list.length ? `${dest.dest}ga ${list.length} ta qatnov bor: ${listText(list)}. Ro‘yxatni filtrladim.` : `${dest.dest}ga hozircha qatnov yo‘q.`,
      action: { type: "filter", value: dest.dest },
    };
  }

  if (/barcha|hammasi|hamma qatnov|ro'yxat|filtrni tozala/.test(q)) {
    return { reply: `Barcha ${trips.length} ta qatnovni ko‘rsatdim.`, action: { type: "filter", value: ALL } };
  }

  if (/eng yaqin|eng erta|qachon|keyingi|birinchi jo'nay|tezroq/.test(q)) {
    const next = nextTrip(trips, now);
    if (!next) return { reply: "Hozircha jo‘naydigan qatnov qolmagan.", action: NO_ACTION };
    return { reply: `Eng yaqin qatnov — ${next.id}: ${routeLabel(next)}, ${whenLabel(next)} (${untilLabel(next.departure, now)}). Tanlash uchun “${next.id} ni tanla” deng.`, action: NO_ACTION };
  }

  if (/^(salom|assalom|assalomu|hello|hi|hey|xayrli)/.test(q)) {
    return { reply: "Assalomu alaykum! Men Yo‘ldoshman. Qayerga yuk jo‘natmoqchisiz? Masalan: “B tumaniga qatnovlar”.", action: NO_ACTION };
  }
  if (/yordam|qanday ishlaydi|nima qila olasan|qanaqa|help|qanday/.test(q)) {
    return {
      reply: "Men qatnovni topishga yordam beraman: “B tumaniga qatnovlar” desangiz filtrlayman, “Y02 ni tanla” desangiz so‘rov shaklini ochaman. Shaklni o‘zingiz to‘ldirib yuborasiz.",
      action: NO_ACTION,
    };
  }
  if (/rahmat|raxmat|tashakkur/.test(q)) {
    return { reply: "Arzimaydi! Yana savol bo‘lsa, yozing.", action: NO_ACTION };
  }

  return {
    reply: "Buni tushunmadim. Masalan: “B tumaniga qatnovlar”, “Eng yaqin qatnov qachon?” yoki “Y02 ni tanla” deb yozing.",
    action: NO_ACTION,
  };
}

/** Transport egasi rejimi: yo‘nalishdagi yuk so‘rovlarini topadi. */
export function parseCarrierIntent(text: string, trips: readonly Trip[], cargo: readonly CargoSummary[]): LocalIntent {
  const q = normalizeQuery(text);
  const fmt = (list: readonly CargoSummary[]) => list.slice(0, 6).map((c) => `${c.tripId} (${c.route}): ${c.cargo}`).join("; ");
  if (!q) return { reply: "Qaysi yo‘nalishdagi yuklarni qidiryapsiz?", action: NO_ACTION };
  if (/^(salom|assalom|hello|hi)/.test(q)) {
    return { reply: "Assalomu alaykum! Transport egalari uchun yuk topaman. Masalan: “B tumaniga yuk bormi?”", action: NO_ACTION };
  }
  if (/narx|pul|to'lov/.test(q)) return { reply: "Narx hisoblash bu sinov loyihasida yo‘q.", action: NO_ACTION };

  const id = /(?:^|[^a-z])y\s*-?\s*0?([1-5])(?![0-9])/.exec(q);
  if (id) {
    const tid = `Y0${id[1]}`;
    const list = cargo.filter((c) => c.tripId === tid);
    return { reply: list.length ? `${tid} qatnoviga ${list.length} ta yuk so‘rovi bor: ${fmt(list)}.` : `${tid} qatnoviga hozircha yuk so‘rovi yo‘q.`, action: NO_ACTION };
  }
  const m = /(?:^|\s)(a|b|bi|be|c|s|si|se|ts)\s*-?\s*tuman/.exec(q);
  if (m) {
    const dest = `${m[1].startsWith("a") ? "A" : m[1].startsWith("b") ? "B" : "C"} tumani`;
    const tripIds = trips.filter((t) => t.to === dest).map((t) => t.id);
    const list = cargo.filter((c) => tripIds.includes(c.tripId));
    return {
      reply: list.length ? `${dest}ga ${list.length} ta yuk bor: ${fmt(list)}.` : `${dest}ga hozircha yuk so‘rovi yo‘q.`,
      action: NO_ACTION,
    };
  }
  if (/hammasi|barcha|qancha|nechta|yuk bor/.test(q)) {
    return { reply: cargo.length ? `Jami ${cargo.length} ta yuk so‘rovi bor. Oxirgilari: ${fmt(cargo)}.` : "Hozircha yuk so‘rovlari yo‘q.", action: NO_ACTION };
  }
  return { reply: "Masalan: “B tumaniga yuk bormi?”, “Y02 qatnoviga yuk bormi?” yoki “Nechta yuk bor?” deb so‘rang.", action: NO_ACTION };
}
