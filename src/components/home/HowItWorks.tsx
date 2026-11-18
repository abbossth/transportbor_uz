"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { BadgeCheck, MousePointerClick, PackageOpen, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import type { ReactNode } from "react";

const STEPS: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: MousePointerClick, title: "Qatnovni tanlang", text: "Yetib borish hududi bo‘yicha saralang va mos qatnovda “Tanlash” ni bosing." },
  { Icon: PackageOpen, title: "Yukni yozing", text: "Ismingiz va yukning qisqa tavsifini kiriting, masalan: “2 quti kitob”." },
  { Icon: BadgeCheck, title: "Tasdiqni oling", text: "So‘rov raqamli chipta shu zahoti chiqadi. Holatini “Kuzatish” sahifasida ko‘rasiz." },
];

export function HowItWorks({ photo }: { photo: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section aria-labelledby="how-title" className="bg-card py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-2 h-72 overflow-hidden rounded-[24px] shadow-pop sm:h-[440px] lg:order-1">{photo}</Reveal>
        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink">Qanday ishlaydi</p>
            <h2 id="how-title" className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">
              Uch qadam — va yukingiz yo‘lda
            </h2>
          </Reveal>
          <ol ref={ref} className="relative mt-10 flex flex-col gap-8">
            <span aria-hidden className="absolute bottom-6 left-6 top-6 w-0.5 -translate-x-1/2 bg-line" />
            <motion.span aria-hidden style={{ scaleY: fill }} className="absolute bottom-6 left-6 top-6 w-0.5 origin-top -translate-x-1/2 bg-gradient-to-b from-brand to-teal" />
            {STEPS.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <li className="relative flex gap-5">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand shadow-[0_8px_20px_-8px_rgb(18_183_106/0.7)]">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div className="pt-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">{i + 1}-qadam</p>
                    <h3 className="mt-0.5 text-xl font-extrabold">{title}</h3>
                    <p className="mt-1 text-muted">{text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
