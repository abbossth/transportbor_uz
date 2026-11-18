import { getTrips } from "@/lib/store";
import { askGemini, hasGemini } from "@/lib/gemini";
import { parseIntent } from "@/lib/intent";
import type { ApiResponse } from "@/lib/types";
import type { AssistantReply, ChatTurn } from "@/lib/assistant-types";
import { NO_ACTION } from "@/lib/assistant-types";

const AUDIO_TYPES = ["audio/wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"];
const MAX_AUDIO_BASE64 = 3_000_000; // ~2.2 MB
const MAX_MESSAGE = 500;

function json<T>(body: ApiResponse<T>, status = 200) {
  return Response.json(body, { status });
}

export async function GET() {
  return json({ ok: true, data: { gemini: hasGemini() } });
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

  const { trips } = await getTrips();
  const now = new Date();

  if (hasGemini()) {
    try {
      const result = await askGemini({ message, audio, history, trips, now });
      return json<AssistantReply>({ ok: true, data: { ...result, source: "gemini" } });
    } catch (error) {
      console.warn("[assistant] Gemini xatosi, lokal tahlilchiga o‘tildi:", error instanceof Error ? error.message : error);
    }
  }

  if (!message) {
    return json<AssistantReply>({
      ok: true,
      data: { reply: "Ovozli xabarni hozir tushunib bo‘lmadi. Iltimos, savolingizni yozib yuboring.", action: NO_ACTION, source: "local" },
    });
  }
  return json<AssistantReply>({ ok: true, data: { ...parseIntent(message, trips, now), source: "local" } });
}
