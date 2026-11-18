"use client";

/** Javobni ovozda o‘qish: server TTS (o‘zbekcha ovoz) yoki brauzerdagi speechSynthesis. O‘qib bo‘lingach resolve bo‘ladi. */
let current: HTMLAudioElement | null = null;
let finish: (() => void) | null = null;

export function stopSpeaking() {
  current?.pause();
  current = null;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  finish?.();
  finish = null;
}

export async function speak(text: string, useServer: boolean): Promise<void> {
  stopSpeaking();
  const clean = text.replace(/[“”"«»*]/g, "").slice(0, 400);
  if (useServer) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean }),
      });
      if (res.ok && res.headers.get("content-type")?.startsWith("audio/")) {
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        current = audio;
        await new Promise<void>((resolve) => {
          finish = resolve;
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
        URL.revokeObjectURL(url);
        finish = null;
        return;
      }
    } catch {
      /* brauzer TTS'ga o‘tamiz */
    }
  }
  if (typeof speechSynthesis === "undefined") return;
  const u = new SpeechSynthesisUtterance(clean);
  const voices = speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang.toLowerCase().startsWith("uz")) ?? voices.find((v) => /^(tr|ru)/i.test(v.lang));
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "uz-UZ";
  await new Promise<void>((resolve) => {
    finish = resolve;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
  finish = null;
}
