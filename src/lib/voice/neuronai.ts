import type { AudioInput, SpeechToTextProvider, TextToSpeechProvider } from "./types";

const BASE_URL = process.env.NEURONAI_BASE_URL || "https://my.neuronai.uz/api/v1";
const EXT: Record<string, string> = { "audio/wav": "wav", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/mpeg": "mp3" };

function authHeader(): Record<string, string> {
  const key = process.env.NEURONAI_API_KEY;
  if (!key) throw new Error("NEURONAI_API_KEY yo‘q");
  return { Authorization: `Bearer ${key}` };
}

/** NeuronAI — o‘zbek tiliga ixtisoslashgan STT/TTS (https://my.neuronai.uz). */
export const neuronAiStt: SpeechToTextProvider = {
  name: "NeuronAI",
  async transcribe(audio: AudioInput, language) {
    const form = new FormData();
    const bytes = Buffer.from(audio.data, "base64");
    form.append("file", new Blob([bytes], { type: audio.mimeType }), `voice.${EXT[audio.mimeType] ?? "wav"}`);
    form.append("language", language);
    const res = await fetch(`${BASE_URL}/stt/transcribe`, {
      method: "POST",
      headers: authHeader(),
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`NeuronAI STT HTTP ${res.status}`);
    const body = (await res.json()) as { data?: { text?: unknown } };
    return typeof body.data?.text === "string" ? body.data.text.trim() : "";
  },
};

export const neuronAiTts: TextToSpeechProvider = {
  name: "NeuronAI",
  async synthesize(text, language) {
    const res = await fetch(`${BASE_URL}/tts/synthesize`, {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id: process.env.NEURONAI_VOICE || "kamron", language }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`NeuronAI TTS HTTP ${res.status}`);
    return { audio: await res.arrayBuffer(), contentType: res.headers.get("content-type") || "audio/wav" };
  },
};
