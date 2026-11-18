"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input {...props} type={show ? "text" : "password"} className={`${className ?? ""} pr-14`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}
        aria-pressed={show}
        className="press absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-line/50 hover:text-ink"
      >
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </span>
  );
}
