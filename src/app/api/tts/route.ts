import { getTtsProvider } from "@/lib/voice/server";

export async function POST(request: Request) {
  const provider = getTtsProvider();
  if (!provider) return Response.json({ ok: false, message: "Ovozli javob xizmati sozlanmagan." }, { status: 503 });

  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim().slice(0, 400) : "";
  } catch {
    /* pastda tekshiriladi */
  }
  if (!text) return Response.json({ ok: false, message: "Matn bo‘sh." }, { status: 400 });

  try {
    const { audio, contentType } = await provider.synthesize(text, "uz");
    return new Response(audio, { headers: { "Content-Type": contentType, "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("[tts] xato:", error instanceof Error ? error.message : error);
    return Response.json({ ok: false, message: "Ovozli javobni tayyorlab bo‘lmadi." }, { status: 502 });
  }
}
