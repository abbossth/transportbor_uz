"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tb-theme", next ? "dark" : "light");
    } catch {
      /* localStorage mavjud emas: mavzu faqat shu sahifada saqlanadi */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Kunduzgi rejimga o‘tish" : "Tungi rejimga o‘tish"}
      title={dark ? "Kunduzgi rejim" : "Tungi rejim"}
      className="grid size-10 place-items-center rounded-full border border-line bg-card text-ink transition-colors hover:bg-brand-soft"
    >
      {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
}
