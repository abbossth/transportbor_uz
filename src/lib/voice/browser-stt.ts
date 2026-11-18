"use client";

import { VoiceError } from "./recorder";

/** Zaxira yo‘l: brauzerning o‘z nutq tanishi (Chrome: webkitSpeechRecognition). */
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const browserSttSupported = () => typeof window !== "undefined" && Boolean(getCtor());

export function listenOnce(lang = "uz-UZ"): { stop: () => void; result: Promise<string> } {
  const Ctor = getCtor();
  if (!Ctor) throw new VoiceError("unsupported");
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  const result = new Promise<string>((resolve, reject) => {
    let text = "";
    rec.onresult = (e) => {
      text = e.results[0]?.[0]?.transcript ?? "";
    };
    rec.onerror = (e) =>
      reject(new VoiceError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "no-speech" : "failed"));
    rec.onend = () => (text.trim() ? resolve(text.trim()) : reject(new VoiceError("no-speech")));
  });
  rec.start();
  return { stop: () => rec.stop(), result };
}
