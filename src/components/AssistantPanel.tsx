"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Loader2, MessageCircle, SendHorizontal, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { TRIPS } from "@/lib/trips";
import { parseIntent } from "@/lib/intent";
import type { ApiResponse } from "@/lib/types";
import type { AssistantAction, AssistantReply, ChatTurn } from "@/lib/assistant-types";
import { ASSISTANT_OPEN_EVENT, ASSISTANT_VOICE_EVENT, dispatchUiAction, type AssistantOpenDetail } from "@/lib/ui-events";
import { startRecording, toWav16kBase64, VoiceError, voiceErrorMessage } from "@/lib/voice/recorder";
import { browserSttSupported, listenOnce } from "@/lib/voice/browser-stt";
import { speak, stopSpeaking } from "@/lib/voice/speak";
import { VoiceButton, type VoiceState } from "./VoiceButton";

type Capabilities = { gemini: boolean; stt: boolean; tts: boolean };
const MUTE_KEY = "tb-voice-muted";

type Message = { id: number; role: "user" | "assistant"; text: string; voice?: boolean };

const SUGGESTIONS = ["B tumaniga qatnovlar", "Eng yaqin qatnov qachon?", "Y02 ni tanla", "Qanday ishlaydi?"];
const GREETING =
  "Assalomu alaykum! Men Yo‘ldosh — qatnov topishga yordam beraman. Qayerga yuk jo‘natmoqchisiz? Yozing yoki quyidagi takliflardan tanlang.";

export type SendOptions = { voice?: boolean; audio?: { data: string; mimeType: string } };

export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [voice, setVoice] = useState<VoiceState>("idle");
  // Faqat ochiq panelda ko‘rinadi (SSR'da chizilmaydi) — hydration xavfsiz
  const [muted, setMuted] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const stopRef = useRef<(() => void) | null>(null);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Gemini / STT / TTS mavjudligini bir marta aniqlaymiz
  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json() as Promise<ApiResponse<Capabilities>>)
      .then((b) => setCaps(b.ok ? b.data : { gemini: false, stt: false, tts: false }))
      .catch(() => setCaps({ gemini: false, stt: false, tts: false }));
  }, []);
  const mode = caps ? (caps.gemini ? "gemini" : "local") : null;

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (next) stopSpeaking();
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* e’tiborsiz */
    }
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const close = useCallback(() => {
    stopRef.current?.();
    stopSpeaking();
    setOpen(false);
    fabRef.current?.focus();
  }, []);

  const runAction = useCallback(
    (action: AssistantAction) => {
      if (action.type === "none") return;
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      if (isMobile || action.type === "select") setOpen(false);
      if (pathname !== "/") {
        const q = action.type === "filter" ? (action.value === "Barchasi" ? "" : `?to=${encodeURIComponent(action.value)}`) : `?trip=${action.value}`;
        router.push(`/${q}`);
        return;
      }
      // Panel yopilish animatsiyasidan keyin
      setTimeout(() => dispatchUiAction(action), 50);
    },
    [pathname, router],
  );

  const push = useCallback((role: Message["role"], text: string, voice?: boolean) => {
    const msg: Message = { id: nextId.current++, role, text, voice };
    setMessages((m) => [...m, msg]);
    return msg;
  }, []);

  const send = useCallback(
    async (text: string, opts: SendOptions = {}): Promise<AssistantReply | null> => {
      const clean = text.trim();
      if ((!clean && !opts.audio) || pending) return null;
      const history: ChatTurn[] = messages
        .filter((m) => m.id !== 0)
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));
      if (clean) push("user", opts.voice ? `🎤 ${clean}` : clean, opts.voice);
      setInput("");
      setPending(true);

      let result: AssistantReply;
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean || undefined, history, audio: opts.audio }),
        });
        const body = (await res.json()) as ApiResponse<AssistantReply>;
        if (!body.ok) throw new Error(body.message);
        result = body.data;
      } catch {
        // Server yoki internet yo‘q — brauzerdagi lokal tahlilchi
        result = clean
          ? { ...parseIntent(clean, TRIPS), source: "local" }
          : { reply: "Ovozli xabarni yuborib bo‘lmadi. Iltimos, savolingizni yozib yuboring.", action: { type: "none", value: "" }, source: "local" };
      }

      if (!clean && result.transcript) push("user", `🎤 ${result.transcript}`, true);
      push("assistant", result.reply);
      setPending(false);
      runAction(result.action);
      if (opts.voice && !muted) void speak(result.reply, Boolean(caps?.tts));
      return result;
    },
    [messages, pending, push, runAction, muted, caps],
  );

  /** Mikrofon: 1-bosish — yozish, 2-bosish — to‘xtatish va yuborish. */
  const toggleVoice = useCallback(async () => {
    if (voice === "recording") {
      stopRef.current?.();
      return;
    }
    if (voice !== "idle" || pending) return;
    stopSpeaking();
    const serverAudio = Boolean(caps?.stt || caps?.gemini) && typeof MediaRecorder !== "undefined";
    try {
      if (serverAudio) {
        const rec = await startRecording(12_000);
        stopRef.current = rec.stop;
        setVoice("recording");
        const blob = await rec.result;
        setVoice("processing");
        const data = await toWav16kBase64(blob);
        await send("", { audio: { data, mimeType: "audio/wav" }, voice: true });
      } else if (browserSttSupported()) {
        const listening = listenOnce("uz-UZ");
        stopRef.current = listening.stop;
        setVoice("recording");
        const text = await listening.result;
        setVoice("processing");
        await send(text, { voice: true });
      } else {
        throw new VoiceError("unsupported");
      }
    } catch (error) {
      push("assistant", voiceErrorMessage(error instanceof VoiceError ? error.code : "failed"));
    } finally {
      stopRef.current = null;
      setVoice("idle");
    }
  }, [voice, pending, caps, send, push]);

  // Header'dagi mikrofon tugmasi
  const toggleVoiceRef = useRef(toggleVoice);
  const sendRef = useRef(send);
  useEffect(() => {
    toggleVoiceRef.current = toggleVoice;
    sendRef.current = send;
  }, [toggleVoice, send]);
  useEffect(() => {
    const onVoice = () => {
      setOpen(true);
      void toggleVoiceRef.current();
    };
    const onOpen = (e: Event) => {
      setOpen(true);
      const msg = (e as CustomEvent<AssistantOpenDetail>).detail?.message;
      if (msg) void sendRef.current(msg);
    };
    window.addEventListener(ASSISTANT_VOICE_EVENT, onVoice);
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(ASSISTANT_VOICE_EVENT, onVoice);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    };
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? "Yordamchini yopish" : "Yo‘ldosh yordamchisini ochish"}
        className={`fixed bottom-5 right-4 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-brand pl-4 pr-5 font-bold text-on-brand shadow-pop transition-all hover:bg-brand-hover sm:bottom-6 sm:right-6 ${
          open ? "max-sm:hidden" : ""
        }`}
      >
        {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
        <span>{open ? "Yopish" : "Yo‘ldosh"}</span>
      </button>

      {open && (
        <section
          id="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          className="tb-fade-up fixed inset-0 z-50 flex flex-col bg-card text-ink sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(620px,calc(100dvh-130px))] sm:w-[390px] sm:rounded-[20px] sm:border sm:border-line sm:shadow-pop"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink">
              <Bot className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="assistant-title" className="text-base font-extrabold">
                Yo‘ldosh
              </h2>
              <p className="flex items-center gap-1 text-xs text-muted">
                <Sparkles className="size-3" aria-hidden />
                {mode === "gemini" ? "Gemini AI" : mode === "local" ? "Lokal rejim" : "Ulanmoqda…"} · AI yordamchi
              </p>
            </div>
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={muted ? "Ovozli javobni yoqish" : "Ovozli javobni o‘chirish"}
              title={muted ? "Ovozli javob o‘chiq" : "Ovozli javob yoqiq"}
              className="grid size-10 place-items-center rounded-full border border-line text-muted hover:bg-bg hover:text-ink"
            >
              {muted ? <VolumeX className="size-5" aria-hidden /> : <Volume2 className="size-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Yordamchini yopish"
              className="grid size-10 place-items-center rounded-full border border-line text-muted hover:bg-bg hover:text-ink"
            >
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite" aria-relevant="additions">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "rounded-br-md bg-brand text-on-brand" : "rounded-bl-md bg-bg text-ink"
                  }`}
                >
                  <span className="sr-only">{m.role === "user" ? "Siz: " : "Yo‘ldosh: "}</span>
                  {m.text}
                </p>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <p className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-bg px-4 py-2.5 text-sm text-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Yo‘ldosh o‘ylayapti…
                </p>
              </div>
            )}
          </div>

          {voice !== "idle" && (
            <p role="status" className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm font-semibold text-danger-ink">
              <span className={`size-2.5 rounded-full bg-danger ${voice === "recording" ? "tb-recording" : ""}`} aria-hidden />
              {voice === "recording" ? "Tinglayapman… (to‘xtatish uchun ■ ni bosing)" : "Ovoz tahlil qilinmoqda…"}
            </p>
          )}

          <div className="flex flex-wrap gap-2 px-4 pb-3" aria-label="Tezkor takliflar">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => void send(s)}
                className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-soft disabled:opacity-60"
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <label htmlFor="assistant-input" className="sr-only">
              Yordamchiga xabar
            </label>
            <input
              ref={inputRef}
              id="assistant-input"
              type="text"
              autoComplete="off"
              maxLength={500}
              placeholder="Masalan: B tumaniga qatnov bormi?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-base text-ink placeholder:text-muted/80 focus:bg-card focus:outline-none focus-visible:outline-3 focus-visible:outline-brand sm:text-sm"
            />
            <VoiceButton state={voice} onClick={() => void toggleVoice()} disabled={pending && voice === "idle"} />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Yuborish"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              <SendHorizontal className="size-5" aria-hidden />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
