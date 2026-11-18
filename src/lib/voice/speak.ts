"use client";

/** Javobni ovozda o‘qish: server TTS (o‘zbekcha ovoz) yoki brauzerdagi speechSynthesis. */
let current: HTMLAudioElement | null = null;

export function stopSpeaking() {
  current?.pause();
  current = null;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

export async function speak(text: string, useServer: boolean): Promise<void> {
  stopSpeaking();
  const clean = text.replace(/[“”"«»]/g, "").slice(0, 400);
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
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
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
  u.rate = 1;
  speechSynthesis.speak(u);
}
