"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/** Bosh sahifada hero ustida shaffof, scroll qilinganda glass fonli header. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const overlay = pathname === "/" && !scrolled;
  return (
    <header
      data-overlay={overlay}
      className={`group/header sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300 ${
        overlay ? "border-b border-transparent bg-transparent" : "border-b border-line bg-bg/80 shadow-[0_1px_0_rgb(0_0_0/0.02)] backdrop-blur-xl"
      }`}
    >
      {children}
    </header>
  );
}
