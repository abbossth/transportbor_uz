"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AudioLines, Loader2, Mic, Package, PhoneOff, SendHorizontal, Square, Truck, Volume2, VolumeX, X } from "lucide-react";
import { TRIPS } from "@/lib/trips";
import { parseIntent } from "@/lib/intent";
import type { ApiResponse } from "@/lib/types";
import type { AssistantAction, AssistantMode, AssistantReply, ChatTurn } from "@/lib/assistant-types";
import { ASSISTANT_OPEN_EVENT, ASSISTANT_VOICE_EVENT, dispatchUiAction, type AssistantOpenDetail } from "@/lib/ui-events";
import { startRecording, toWav16kBase64, VoiceError, voiceErrorMessage } from "@/lib/voice/recorder";
import { browserSttSupported, listenOnce } from "@/lib/voice/browser-stt";
import { speak, stopSpeaking } from "@/lib/voice/speak";
import { YoldoshBot, type BotState } from "@/components/YoldoshBot";

type Message = { id: number; role: "user" | "assistant"; text: string };
type Capabilities = { gemini: boolean; stt: boolean; tts: boolean };
type VoiceState = "idle" | "recording" | "processing";

const MUTE_KEY = "tb-voice-muted";

const MODES: Record<AssistantMode, { tab: string; Icon: typeof Truck; hello: string; sub: string; placeholder: string; chips: string[] }> = {
  shipper: {
    tab: "Transport topish",
    Icon: Truck,
    hello: "Salom! Men Yo‘ldoshman 👋",
    sub: "Yukingiz qayerga borishini ayting — mos qatnovni topib, so‘rov shaklini ochib beraman.",
    placeholder: "Yukingizni qayerga yubormoqchisiz?",
    chips: ["B tumaniga qatnovlar", "Eng yaqin qatnov qachon?", "Y02 ni tanla", "Qanday ishlaydi?"],
  },
  carrier: {
    tab: "Yuk topish",
    Icon: Package,
    hello: "Salom, transport egasi! 👋",
    sub: "Qaysi yo‘nalishga ketyapsiz? Qatnovlaringizga kelgan yuk so‘rovlarini topib beraman.",
    placeholder: "Qaysi yo‘nalishda yuk qidiryapsiz?",
    chips: ["B tumaniga yuk bormi?", "Y02 qatnoviga yuk bormi?", "Nechta yuk bor?", "C tumaniga yuk"],
  },
};

const BUBBLES = ["Yukingizga mos qatnovni topaman", "“B tumaniga qatnov bormi?” deb so‘rang", "Ovoz bilan ham gaplashsa bo‘ladi 🎤", "Transport egalariga yuk topaman"];

/* ---------- Yulduzli fon (deterministik, modul darajasida) ---------- */
const STARS = (() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 80 }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: rand() < 0.15 ? 2.5 : rand() < 0.5 ? 1.8 : 1.2,
    delay: rand() * 5,
    dur: 2.5 + rand() * 4,
  }));
})();

/* ---------- Yozuv mashinkasi pufagi ---------- */
function Typewriter({ phrases }: { phrases: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = phrases[0];
      return;
    }
    let i = 0;
    let n = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const p = phrases[i % phrases.length];
      n += deleting ? -1 : 1;
      el.textContent = p.slice(0, n);
      let wait = deleting ? 22 : 48;
      if (!deleting && n >= p.length) {
        deleting = true;
        wait = 2400;
      } else if (deleting && n <= 0) {
        deleting = false;
        i++;
        wait = 350;
      }
      timer = setTimeout(step, wait);
    };
    timer = setTimeout(step, 900);
    return () => clearTimeout(timer);
  }, [phrases]);
  return (
    <span className="after:ml-0.5 after:inline-block after:h-[1.05em] after:w-[2px] after:translate-y-[0.15em] after:animate-pulse after:bg-brand after:content-['']">
      <span ref={ref} />
    </span>
  );
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>("shipper");
  const [messages, setMessages] = useState<Record<AssistantMode, Message[]>>({ shipper: [], carrier: [] });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [speaking, setSpeaking] = useState(false);
  const [conversation, setConversation] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const nextId = useRef(1);
  const stopRef = useRef<(() => void) | null>(null);
  const convRef = useRef(false);
  const orbRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const cfg = MODES[mode];
  const thread = messages[mode];

  const botState: BotState = voice === "recording" ? "listening" : speaking ? "speaking" : pending || voice === "processing" ? "thinking" : "idle";

  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json() as Promise<ApiResponse<Capabilities>>)
      .then((b) => setCaps(b.ok ? b.data : { gemini: false, stt: false, tts: false }))
      .catch(() => setCaps({ gemini: false, stt: false, tts: false }));
  }, []);

  // Ochiq paytda fon scroll'i qotadi
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("scroll-locked");
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread, pending]);

  const setLevel = useCallback((l: number) => {
    orbRef.current?.style.setProperty("--lvl", l.toFixed(3));
  }, []);

  const endConversation = useCallback(() => {
    convRef.current = false;
    setConversation(false);
    stopRef.current?.();
    stopSpeaking();
  }, []);

  const close = useCallback(() => {
    endConversation();
    setOpen(false);
    launcherRef.current?.focus();
  }, [endConversation]);

  const push = useCallback((m: AssistantMode, role: Message["role"], text: string) => {
    const msg = { id: nextId.current++, role, text };
    setMessages((all) => ({ ...all, [m]: [...all[m], msg] }));
  }, []);

  const runAction = useCallback(
    (action: AssistantAction, reply: string) => {
      if (action.type === "none") return;
      // Natijani ko‘rsatish uchun oynani yopamiz; javob launcher pufagida qoladi
      convRef.current = false;
      setConversation(false);
      setOpen(false);
      setBubble(reply);
      if (pathname !== "/") {
        const q = action.type === "filter" ? (action.value === "Barchasi" ? "" : `?to=${encodeURIComponent(action.value)}`) : `?trip=${action.value}`;
        router.push(`/${q}`);
        return;
      }
      setTimeout(() => dispatchUiAction(action), 80);
    },
    [pathname, router],
  );

  const send = useCallback(
    async (text: string, opts: { audio?: { data: string; mimeType: string }; voice?: boolean } = {}): Promise<AssistantReply | null> => {
      const clean = text.trim();
      if (!clean && !opts.audio) return null;
      const m = mode;
      const history: ChatTurn[] = messages[m].slice(-10).map((x) => ({ role: x.role, text: x.text }));
      if (clean) push(m, "user", opts.voice ? `🎤 ${clean}` : clean);
      setInput("");
      setPending(true);
      let result: AssistantReply;
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean || undefined, history, audio: opts.audio, mode: m }),
        });
        const body = (await res.json()) as ApiResponse<AssistantReply>;
        if (!body.ok) throw new Error(body.message);
        result = body.data;
      } catch {
        result = clean
          ? { ...parseIntent(clean, TRIPS), source: "local" }
          : { reply: "Ovozli xabarni yuborib bo‘lmadi. Iltimos, savolingizni yozing.", action: { type: "none", value: "" }, source: "local" };
      }
      if (!clean && result.transcript) push(m, "user", `🎤 ${result.transcript}`);
      push(m, "assistant", result.reply);
      setPending(false);
      if (opts.voice && !muted) {
        setSpeaking(true);
        const speech = speak(result.reply, Boolean(caps?.tts)).finally(() => setSpeaking(false));
        if (result.action.type === "none") await speech;
      }
      runAction(result.action, result.reply);
      return result;
    },
    [mode, messages, push, muted, caps, runAction],
  );

  /** Bir marta tinglab, yuboradi. autoStop — ovozli suhbatda jimlikda o‘zi to‘xtaydi. */
  const listenAndSend = useCallback(
    async (autoStop: boolean): Promise<AssistantReply | null> => {
      stopSpeaking();
      const serverAudio = Boolean(caps?.stt || caps?.gemini) && typeof MediaRecorder !== "undefined";
      try {
        if (serverAudio) {
          const rec = await startRecording({ maxMs: 12_000, onLevel: setLevel, autoStop });
          stopRef.current = rec.stop;
          setVoice("recording");
          const blob = await rec.result;
          setVoice("processing");
          const data = await toWav16kBase64(blob);
          return await send("", { audio: { data, mimeType: "audio/wav" }, voice: true });
        }
        if (browserSttSupported()) {
          const l = listenOnce("uz-UZ");
          stopRef.current = l.stop;
          setVoice("recording");
          const text = await l.result;
          setVoice("processing");
          return await send(text, { voice: true });
        }
        throw new VoiceError("unsupported");
      } catch (error) {
        push(mode, "assistant", voiceErrorMessage(error instanceof VoiceError ? error.code : "failed"));
        return null;
      } finally {
        stopRef.current = null;
        setVoice("idle");
      }
    },
    [caps, send, push, mode, setLevel],
  );

  /** Bir martalik mikrofon: 1-bosish yozadi, 2-bosish to‘xtatadi. */
  const toggleMic = useCallback(() => {
    if (voice === "recording") return stopRef.current?.();
    if (voice !== "idle" || pending) return;
    void listenAndSend(false);
  }, [voice, pending, listenAndSend]);

  /** Ovozli suhbat: tinglash → javob → o‘qish → yana tinglash. */
  const startConversation = useCallback(async () => {
    if (convRef.current) return endConversation();
    convRef.current = true;
    setConversation(true);
    while (convRef.current) {
      const r = await listenAndSend(true);
      if (!r || r.action.type !== "none") break;
    }
    convRef.current = false;
    setConversation(false);
  }, [listenAndSend, endConversation]);

  // Tashqi hodisalar: header mikrofoni va "ochish (xabar bilan)"
  const latest = useRef({ send, startConversation });
  useEffect(() => {
    latest.current = { send, startConversation };
  }, [send, startConversation]);
  useEffect(() => {
    const onVoice = () => {
      setOpen(true);
      void latest.current.startConversation();
    };
    const onOpen = (e: Event) => {
      setOpen(true);
      const msg = (e as CustomEvent<AssistantOpenDetail>).detail?.message;
      if (msg) void latest.current.send(msg);
    };
    window.addEventListener(ASSISTANT_VOICE_EVENT, onVoice);
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(ASSISTANT_VOICE_EVENT, onVoice);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    };
  }, []);

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

  function switchMode(m: AssistantMode) {
    if (m === mode) return;
    endConversation();
    setMode(m);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab" || !overlayRef.current) return;
    const items = overlayRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])");
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pending) void send(input);
  }

  const status = voice === "recording" ? "Tinglayapman…" : voice === "processing" || pending ? "O‘ylayapman…" : speaking ? "Gapiryapman…" : conversation ? "Gapiring…" : "";

  return (
    <>
      {/* ---------- Launcher ---------- */}
      {!open && (
        <div className="fixed bottom-3 right-2 z-50 flex items-end gap-1 sm:bottom-4 sm:right-4">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setBubble(null);
            }}
            className="tb-fade-in mb-6 hidden max-w-[300px] rounded-2xl rounded-br-md border border-line bg-card px-4 py-3 text-left text-sm font-bold text-brand-ink shadow-pop sm:block"
            aria-hidden
            tabIndex={-1}
          >
            {bubble ? <span className="line-clamp-3 font-semibold text-ink">{bubble}</span> : <Typewriter phrases={BUBBLES} />}
          </button>
          <button
            ref={launcherRef}
            type="button"
            onClick={() => {
              setOpen(true);
              setBubble(null);
            }}
            aria-label="Yo‘ldosh AI yordamchisini ochish"
            className="press group relative grid size-[84px] place-items-center rounded-full sm:size-24"
          >
            <span aria-hidden className="absolute inset-2 rounded-full bg-brand/25 blur-xl transition-opacity group-hover:opacity-100 sm:opacity-70" />
            <YoldoshBot className="relative size-full drop-shadow-[0_10px_18px_rgb(11_18_32/0.25)]" state={speaking ? "speaking" : "idle"} />
          </button>
        </div>
      )}

      {/* ---------- To‘liq ekranli oyna ---------- */}
      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="yoldosh-title"
          onKeyDown={onKeyDown}
          className="tb-fade-in fixed inset-0 z-[70] flex flex-col overflow-hidden text-white [background:radial-gradient(120%_80%_at_50%_-10%,#14513a_0%,#0a3123_45%,#061c14_100%)]"
        >
          {/* Yulduzlar */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="yb-star absolute rounded-full bg-white"
                style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
              />
            ))}
            <span className="absolute left-1/2 top-[38%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />
          </div>

          {/* Tepa panel */}
          <div className="relative flex items-center justify-between gap-2 p-3 sm:p-5">
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={muted ? "Ovozli javobni yoqish" : "Ovozli javobni o‘chirish"}
              className="press grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              {muted ? <VolumeX className="size-5" aria-hidden /> : <Volume2 className="size-5" aria-hidden />}
            </button>
            <div role="group" aria-label="Rejim" className="flex rounded-full bg-white/10 p-1 backdrop-blur">
              {(Object.keys(MODES) as AssistantMode[]).map((m) => {
                const M = MODES[m];
                const on = m === mode;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    onClick={() => switchMode(m)}
                    className={`press inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm font-bold sm:px-5 ${on ? "bg-white text-[#0a3123] shadow-card" : "text-white/85 hover:text-white"}`}
                  >
                    <M.Icon className="size-4" aria-hidden />
                    {M.tab}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={close} aria-label="Yopish" className="press grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="size-5" aria-hidden />
            </button>
          </div>

          {/* O‘rta qism */}
          <div ref={listRef} className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto overscroll-contain px-4" aria-live="polite">
            {conversation ? (
              <div className="m-auto flex flex-col items-center gap-6 py-6 text-center">
                <div ref={orbRef} className="relative grid size-56 place-items-center [--lvl:0] sm:size-64" data-state={botState}>
                  <span aria-hidden className="yb-orb absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(74_222_148/0.35),rgb(18_183_106/0.08)_60%,transparent_70%)]" />
                  <span aria-hidden className="yb-orb-ring absolute inset-6 rounded-full border border-[#4ade94]/40" />
                  <span aria-hidden className="yb-orb-ring absolute inset-12 rounded-full border border-[#4ade94]/30 [animation-delay:0.6s]" />
                  <YoldoshBot className="relative size-40 sm:size-44" state={botState} wave={false} />
                </div>
                <p className="font-display text-2xl font-extrabold">{status || "Gapiring…"}</p>
                {thread.length > 0 && (
                  <div className="flex max-w-xl flex-col gap-2 text-sm text-white/85">
                    {thread.slice(-2).map((m) => (
                      <p key={m.id} className={m.role === "user" ? "font-semibold text-[#86efac]" : ""}>
                        {m.text}
                      </p>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={endConversation}
                  className="press inline-flex min-h-12 items-center gap-2 rounded-full bg-danger px-6 font-bold text-white hover:opacity-90"
                >
                  <PhoneOff className="size-5" aria-hidden />
                  Suhbatni tugatish
                </button>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-3 py-4">
                {thread.map((m) => (
                  <div key={m.id} className={`tb-fade-up flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
                        m.role === "user" ? "rounded-br-lg bg-brand font-semibold text-on-brand" : "rounded-bl-lg border border-white/10 bg-white/10 text-white backdrop-blur"
                      }`}
                    >
                      <span className="sr-only">{m.role === "user" ? "Siz: " : "Yo‘ldosh: "}</span>
                      {m.text}
                    </p>
                  </div>
                ))}
                {pending && (
                  <p className="inline-flex w-fit items-center gap-2 rounded-3xl rounded-bl-lg bg-white/10 px-4 py-3 text-sm text-white/80">
                    <Loader2 className="size-4 animate-spin" aria-hidden /> Yo‘ldosh o‘ylayapti…
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Pastki qism */}
          {!conversation && (
            <div className="relative mx-auto grid w-full max-w-4xl grid-cols-1 items-end gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-[1fr_auto] sm:px-6 sm:pb-6">
              <div className="min-w-0">
                {thread.length === 0 && (
                  <div className="tb-fade-up mb-4 flex items-center gap-3">
                    <YoldoshBot className="size-16 shrink-0 sm:hidden" state={botState} />
                    <div>
                      <h2 id="yoldosh-title" className="text-xl font-extrabold sm:text-2xl">
                        {cfg.hello}
                      </h2>
                      <p className="mt-1 text-white/75">{cfg.sub}</p>
                    </div>
                  </div>
                )}
                {thread.length > 0 && <h2 id="yoldosh-title" className="sr-only">Yo‘ldosh yordamchi</h2>}
                <div className="mb-3 flex flex-wrap gap-2">
                  {cfg.chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={pending}
                      onClick={() => void send(c)}
                      className="press rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/15 disabled:opacity-60"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-[28px] border border-white/15 bg-white/10 p-2 backdrop-blur focus-within:border-[#4ade94]/70">
                  <label htmlFor="yoldosh-input" className="sr-only">
                    Yo‘ldoshga xabar
                  </label>
                  <input
                    ref={inputRef}
                    id="yoldosh-input"
                    autoComplete="off"
                    maxLength={500}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={cfg.placeholder}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-white placeholder:text-white/55 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={voice === "processing" || (pending && voice === "idle")}
                    aria-pressed={voice === "recording"}
                    aria-label={voice === "recording" ? "Yozishni to‘xtatish" : "Ovoz bilan so‘rash"}
                    className={`press grid size-11 shrink-0 place-items-center rounded-full ${voice === "recording" ? "tb-recording bg-danger text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                  >
                    {voice === "processing" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : voice === "recording" ? <Square className="size-4 fill-current" aria-hidden /> : <Mic className="size-5" aria-hidden />}
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !input.trim()}
                    aria-label="Yuborish"
                    className="press grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand hover:bg-brand-hover disabled:opacity-50"
                  >
                    <SendHorizontal className="size-5" aria-hidden />
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                  <button
                    type="button"
                    onClick={() => void startConversation()}
                    className="press inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-[#0a3123] hover:bg-white/90"
                  >
                    <AudioLines className="size-4" aria-hidden />
                    Ovozli suhbat
                  </button>
                  <span>
                    {status || (caps?.gemini ? "Gemini AI" : "Lokal rejim")}
                    {caps?.stt ? " · o‘zbekcha nutq" : ""}
                  </span>
                </div>
              </div>
              <YoldoshBot className="hidden size-44 sm:block" state={botState} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
