import { Sparkles } from "lucide-react";
import { Photo } from "@/components/Photo";
import { YoldoshBot } from "@/components/YoldoshBot";
import { AssistantPromoChips } from "./AssistantPromoChips";
import { Reveal } from "./Reveal";

const BARS = [0.5, 0.85, 0.6, 1, 0.7, 0.9, 0.55];

export function AssistantPromo() {
  return (
    <section aria-labelledby="ai-title" className="relative isolate overflow-hidden bg-[#0b1220] py-20 text-white sm:py-28">
      <div className="absolute inset-0 -z-20">
        <Photo name="night-road" sizes="100vw" tone="night" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#0b1220]/75" />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold">
            <Sparkles className="size-4 text-[#4ade94]" aria-hidden />
            Yo‘ldosh — AI yordamchi
          </p>
          <h2 id="ai-title" className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            Gapiring yoki yozing — <span className="text-gradient-on-dark">Yo‘ldosh topib beradi</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg text-white/75">
            O‘zbek tilida so‘rang: qatnovni filtrlaydi, kerakli qatnovning so‘rov shaklini ochadi. Transport egalariga esa yo‘nalishdagi yuklarni
            topib beradi.
          </p>
          <div className="mt-8">
            <AssistantPromoChips />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-md">
          <div className="glass rounded-[28px] p-5">
            <div className="flex items-center gap-3">
              <YoldoshBot className="size-20 shrink-0" />
              <div className="flex h-12 flex-1 items-center justify-center gap-1.5" aria-hidden>
                {BARS.map((h, i) => (
                  <span key={i} className="tb-wave-bar w-1.5 rounded-full bg-gradient-to-t from-brand to-[#5eead4]" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 text-sm" aria-label="Suhbat namunasi">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 font-medium text-on-brand">🎤 B tumaniga qatnov bormi?</p>
              <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5 text-white/90">
                Ha, 2 ta qatnov bor: Y02 va Y03. Ro‘yxatni filtrladim.
              </p>
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 font-medium text-on-brand">Y02 ni tanla</p>
              <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5 text-white/90">So‘rov shaklini ochdim — ismingizni kiriting.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
