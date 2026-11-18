"use client";

/** MediaRecorder bilan yozib olish (maks. muddat bilan). */
export type Recording = { stop: () => void; result: Promise<Blob> };
export type RecordOptions = {
  maxMs?: number;
  /** 0..1 — jonli ovoz darajasi (vizualizatsiya uchun) */
  onLevel?: (level: number) => void;
  /** Gap tugagach (≈1.3 s jimlik) avtomatik to‘xtash — ovozli suhbat rejimi */
  autoStop?: boolean;
};

export async function startRecording(opts: RecordOptions | number = {}): Promise<Recording> {
  const { maxMs = 12_000, onLevel, autoStop = false } = typeof opts === "number" ? { maxMs: opts } : opts;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    throw new VoiceError("unsupported");
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  } catch (e) {
    throw new VoiceError(e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError") ? "denied" : "no-mic");
  }
  const recorder = new MediaRecorder(stream);

  // Jonli daraja + jimlikni aniqlash
  let raf = 0;
  let meterCtx: AudioContext | null = null;
  if (onLevel || autoStop) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    meterCtx = new Ctx();
    const analyser = meterCtx.createAnalyser();
    analyser.fftSize = 512;
    meterCtx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const started = performance.now();
    let spoke = false;
    let quietSince = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += ((v - 128) / 128) ** 2;
      const rms = Math.sqrt(sum / data.length);
      onLevel?.(Math.min(1, rms * 6));
      if (autoStop) {
        const now = performance.now();
        if (rms > 0.045) {
          spoke = true;
          quietSince = 0;
        } else if (spoke) {
          quietSince ||= now;
          if (now - quietSince > 1300) return stop();
        } else if (now - started > 7000) {
          return stop();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  const result = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      cancelAnimationFrame(raf);
      void meterCtx?.close();
      onLevel?.(0);
      stream.getTracks().forEach((t) => t.stop());
      clearTimeout(timer);
      if (chunks.length === 0) reject(new VoiceError("empty"));
      else resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
    };
  });
  const stop = () => recorder.state !== "inactive" && recorder.stop();
  const timer = setTimeout(stop, maxMs);
  recorder.start();
  return { stop, result };
}

/** Istalgan audio → 16 kHz mono WAV (base64). */
export async function toWav16kBase64(blob: Blob): Promise<string> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  } finally {
    void ctx.close();
  }
  const rate = 16_000;
  const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * rate)), rate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  const pcm = rendered.getChannelData(0);
  if (decoded.duration < 0.4) throw new VoiceError("empty");

  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export type VoiceErrorCode = "unsupported" | "denied" | "no-mic" | "empty" | "no-speech" | "failed";
export class VoiceError extends Error {
  constructor(public code: VoiceErrorCode) {
    super(code);
  }
}

export function voiceErrorMessage(code: VoiceErrorCode): string {
  switch (code) {
    case "unsupported":
      return "Brauzeringiz ovozli kiritishni qo‘llamaydi. Savolingizni yozib yuboring.";
    case "denied":
      return "Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering yoki savolni yozing.";
    case "no-mic":
      return "Mikrofon topilmadi. Savolingizni yozib yuboring.";
    case "empty":
    case "no-speech":
      return "Ovoz eshitilmadi. Mikrofon tugmasini bosib, qaytadan gapiring.";
    default:
      return "Ovozni tanib bo‘lmadi. Qayta urinib ko‘ring yoki yozib yuboring.";
  }
}
