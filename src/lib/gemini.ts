import { DESTINATIONS, routeLabel, whenLabel, type Trip } from "./trips";
import { dayLabel } from "./dates";
import { sanitizeAction, type AssistantAction, type ChatTurn } from "./assistant-types";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
export const hasGemini = () => Boolean(process.env.GEMINI_API_KEY);

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    transcript: { type: "STRING", description: "Faqat ovozli xabar bo‘lsa: foydalanuvchi aynan nima degani (o‘zbek lotin yozuvida)." },
    reply: { type: "STRING", description: "Foydalanuvchiga qisqa, do‘stona o‘zbekcha javob (1–3 gap)." },
    action: {
      type: "OBJECT",
      properties: {
        type: { type: "STRING", enum: ["filter", "select", "none"] },
        value: { type: "STRING" },
      },
      required: ["type", "value"],
    },
  },
  required: ["reply", "action"],
} as const;

function systemInstruction(trips: readonly Trip[], now: Date): string {
  const list = trips.map((t) => `- ${t.id}: ${routeLabel(t)}; jo‘nash: ${whenLabel(t)} (${dayLabel(t.date)}); ISO ${t.departure}`).join("\n");
  const nowText = new Intl.DateTimeFormat("uz-UZ", { timeZone: "Asia/Tashkent", dateStyle: "short", timeStyle: "short" }).format(now);
  return `Sen "Yo‘ldosh" — TransportBor saytining yordamchisisan. Sayt kichik yuk jo‘natish uchun mos qatnovni topishga yordam beradi.

QOIDALAR:
- Har doim o‘zbek tilida (lotin yozuvi), qisqa (1–3 gap) va do‘stona javob ber.
- Faqat quyidagi 5 ta qatnov haqida gapir. Yangi qatnov, haydovchi, mashina, narx yoki vaqt to‘qib chiqarma.
- Narx, to‘lov, GPS/xarita, yuk sig‘imi, haydovchi bilan bog‘lanish va haqiqiy band qilish haqida so‘rashsa: "bu sinov loyihasida yo‘q" de.
- So‘rovni o‘zing yubormaysan — faqat filtrlaysan yoki so‘rov shaklini ochib berasan, foydalanuvchi ism va yuk tavsifini o‘zi kiritadi.
- Mavzudan tashqari savollarga muloyimlik bilan qatnovlar mavzusiga qaytar.

AMALLAR (action):
- "filter": foydalanuvchi yetib borish hududi bo‘yicha qatnovlarni so‘rasa. value aniq shulardan biri: ${DESTINATIONS.map((d) => `"${d}"`).join(", ")}. Filtr "Qayerga" ustuni bo‘yicha ishlaydi.
- "select": aniq bitta qatnovni tanlash/ochish so‘ralsa. value: "Y01"…"Y05".
- "none": boshqa hollarda, value: "".
- Amal sahifada darhol bajariladi, shuning uchun javobda uni bajarilgan deb ayt ("Ro‘yxatni filtrladim", "So‘rov shaklini ochdim").
- "A tumanidan" (qayerdan) degan savolga filtr qo‘llama — javobda mos qatnovlarni sanab ber, action "none".

Hozirgi vaqt (Toshkent): ${nowText}. Jo‘nab ketgan qatnovni "jo‘nab ketgan" deb ayt.

QATNOVLAR:
${list}`;
}

type GeminiInput = {
  message?: string;
  audio?: { data: string; mimeType: string };
  history: ChatTurn[];
  trips: readonly Trip[];
  now: Date;
};

export type GeminiResult = { reply: string; action: AssistantAction; transcript?: string };

export async function askGemini({ message, audio, history, trips, now }: GeminiInput): Promise<GeminiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY yo‘q");

  const userParts: Record<string, unknown>[] = [];
  if (audio) {
    userParts.push({ inlineData: { mimeType: audio.mimeType, data: audio.data } });
    userParts.push({
      text: "Bu foydalanuvchining ovozli xabari (o‘zbek tilida). Avval transcript maydoniga aynan nima deyilganini o‘zbek lotin yozuvida yoz, so‘ng reply va action ni ber.",
    });
  }
  if (message) userParts.push({ text: message });

  const contents = [
    ...history.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.text }] })),
    { role: "user", parts: userParts },
  ];

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction(trips, now) }] },
      contents,
      generationConfig: {
        temperature: 0.3,
        thinkingConfig: { thinkingLevel: "low" },
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
  const text = body.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("") ?? "";
  const parsed = JSON.parse(text) as { reply?: unknown; action?: unknown; transcript?: unknown };
  if (typeof parsed.reply !== "string" || !parsed.reply.trim()) throw new Error("Gemini bo‘sh javob qaytardi");

  return {
    reply: parsed.reply.trim().slice(0, 800),
    action: sanitizeAction(parsed.action),
    transcript: typeof parsed.transcript === "string" && parsed.transcript.trim() ? parsed.transcript.trim().slice(0, 300) : undefined,
  };
}
