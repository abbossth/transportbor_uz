import { getTrips, listRequests } from "@/lib/store";
import { askGemini, hasGemini } from "@/lib/gemini";
import { parseCarrierIntent, parseIntent } from "@/lib/intent";
import type { ApiResponse } from "@/lib/types";
import type { AssistantMode, AssistantReply, CargoSummary, ChatTurn } from "@/lib/assistant-types";
import { NO_ACTION } from "@/lib/assistant-types";
import { getSttProvider, getTtsProvider } from "@/lib/voice/server";

const AUDIO_TYPES = ["audio/wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"];
const MAX_AUDIO_BASE64 = 3_000_000; // ~2.2 MB
const MAX_MESSAGE = 500;

function json<T>(body: ApiResponse<T>, status = 200) {
  return Response.json(body, { status });
}

export type AssistantCapabilities = { gemini: boolean; stt: boolean; tts: boolean };

export async function GET() {
  return json<AssistantCapabilities>({
    ok: true,
    data: { gemini: hasGemini(), stt: Boolean(getSttProvider()), tts: Boolean(getTtsProvider()) },
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const raw: unknown = await request.json();
    if (typeof raw !== "object" || raw === null) throw new Error();
    body = raw as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: "So‘rov formati noto‘g‘ri." }, 400);
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";

  let audio: { data: string; mimeType: string } | undefined;
  if (body.audio && typeof body.audio === "object") {
    const a = body.audio as Record<string, unknown>;
    const mimeType = typeof a.mimeType === "string" ? a.mimeType.split(";")[0].trim() : "";
    if (typeof a.data !== "string" || !AUDIO_TYPES.includes(mimeType) || a.data.length > MAX_AUDIO_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(a.data)) {
      return json({ ok: false, message: "Ovozli xabar formati noto‘g‘ri yoki juda uzun (maks. 12 soniya)." }, 400);
    }
    audio = { data: a.data, mimeType };
  }

  if (!message && !audio) {
    return json({ ok: false, message: "Xabar matnini kiriting." }, 400);
  }

  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history
        .filter((t): t is ChatTurn => {
          const turn = t as Partial<ChatTurn>;
          return (turn?.role === "user" || turn?.role === "assistant") && typeof turn.text === "string" && turn.text.trim() !== "";
        })
        .slice(-10)
        .map((t) => ({ role: t.role, text: t.text.slice(0, 1000) }))
    : [];

  const mode: AssistantMode = body.mode === "carrier" ? "carrier" : "shipper";
  const { trips } = await getTrips();
  const cargo: CargoSummary[] =
    mode === "carrier"
      ? (await listRequests()).requests.map(({ code, tripId, route, when, cargo }) => ({ code, tripId, route, when, cargo }))
      : [];
  const now = new Date();

  // 1) O‘zbekcha STT provayderi bo‘lsa — avval matnga o‘giramiz
  let transcript: string | undefined;
  let text = message;
  const stt = audio ? getSttProvider() : null;
  if (audio && stt) {
    try {
      transcript = await stt.transcribe(audio, "uz");
      if (!transcript) {
        return json<AssistantReply>({
          ok: true,
          data: { reply: "Ovoz eshitilmadi. Mikrofon tugmasini bosib, qaytadan gapiring.", action: NO_ACTION, source: "local" },
        });
      }
      text = transcript;
      audio = undefined;
    } catch (error) {
      console.warn(`[assistant] ${stt.name} STT xatosi:`, error instanceof Error ? error.message : error);
    }
  }

  if (hasGemini()) {
    try {
      const result = await askGemini({ mode, cargo, message: text, audio, history, trips, now });
      return json<AssistantReply>({ ok: true, data: { ...result, transcript: transcript ?? result.transcript, source: "gemini" } });
    } catch (error) {
      console.warn("[assistant] Gemini xatosi, lokal tahlilchiga o‘tildi:", error instanceof Error ? error.message : error);
    }
  }

  if (!text) {
    return json<AssistantReply>({
      ok: true,
      data: { reply: "Ovozli xabarni hozir tushunib bo‘lmadi. Iltimos, savolingizni yozib yuboring.", action: NO_ACTION, source: "local" },
    });
  }
  const local = mode === "carrier" ? parseCarrierIntent(text, trips, cargo) : parseIntent(text, trips, now);
  return json<AssistantReply>({ ok: true, data: { ...local, transcript, source: "local" } });
}
