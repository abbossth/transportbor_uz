import Image from "next/image";
import { getImage, type ImageName } from "@/lib/images";

type Props = {
  name: ImageName;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Rasm bo‘lmasa ko‘rsatiladigan gradient varianti */
  tone?: "night" | "green" | "teal" | "dawn" | "hero";
};

const FALLBACK: Record<NonNullable<Props["tone"]>, string> = {
  night: "radial-gradient(120% 90% at 85% 10%, rgb(11 165 164 / .45), transparent 55%), radial-gradient(90% 80% at 10% 100%, rgb(18 183 106 / .45), transparent 60%), linear-gradient(160deg, #0b1220, #0f2a2a 55%, #0b1220)",
  green: "radial-gradient(100% 80% at 20% 0%, rgb(255 255 255 / .18), transparent 60%), linear-gradient(135deg, #0e9f5b, #12b76a 45%, #0ba5a4)",
  teal: "radial-gradient(100% 80% at 80% 0%, rgb(255 255 255 / .16), transparent 60%), linear-gradient(135deg, #0b6b6a, #0ba5a4 50%, #12b76a)",
  hero: "var(--hero-fallback)",
  dawn: "radial-gradient(90% 70% at 70% 15%, rgb(250 204 21 / .35), transparent 55%), linear-gradient(170deg, #12324a, #1b5e53 50%, #12b76a)",
};

/**
 * Bezak rasmi (lokal, next/image + blur). Fayl yo‘q bo‘lsa — brend gradienti va nozik yo‘l naqshi.
 * Ota element `relative` va o‘lchamli bo‘lishi kerak.
 */
export function Photo({ name, alt = "", sizes, priority, className = "", tone = "night" }: Props) {
  const img = getImage(name);
  if (img) {
    return (
      <Image
        src={img.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={img.blurDataURL ? "blur" : "empty"}
        blurDataURL={img.blurDataURL}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div aria-hidden className={`absolute inset-0 ${className}`} style={{ background: FALLBACK[tone] }}>
      <svg className="absolute inset-0 size-full opacity-[0.14]" preserveAspectRatio="none" viewBox="0 0 400 300">
        <path d="M-20 260 C 80 200, 160 230, 230 160 S 360 60, 430 40" fill="none" stroke={tone === "hero" ? "var(--brand)" : "white"} strokeWidth="2" strokeDasharray="10 12" />
        <path d="M-20 300 C 120 250, 200 280, 300 200 S 380 140, 430 120" fill="none" stroke={tone === "hero" ? "var(--brand)" : "white"} strokeWidth="1" />
      </svg>
    </div>
  );
}
