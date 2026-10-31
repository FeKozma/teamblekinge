"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconInfo } from "@/components/icons";
import "./documents.css";

// Minimal toasts for "Länken är kopierad" and friends. Anything can call
// `toast()`; the one <Toaster> on the page shows it in a polite live region.

const EVENT = "tb-toast";
const SHOW_MS = 3200;

type Tone = "ok" | "info";
type Item = { id: number; message: string; tone: Tone; leaving?: boolean };

export function toast(message: string, tone: Tone = "ok") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, tone } }));
}

let nextId = 1;

/** `aboveTabBar`: lift the toasts clear of the public site's mobile tab bar. */
export function Toaster({ aboveTabBar = false }: { aboveTabBar?: boolean }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const onToast = (e: Event) => {
      const { message, tone } = (e as CustomEvent<{ message: string; tone: Tone }>).detail;
      const id = nextId++;
      // Same message twice in a row (double-click on "Kopiera") → keep one.
      setItems((prev) => [...prev.filter((x) => x.message !== message), { id, message, tone }].slice(-3));
      later(() => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, leaving: true } : x))), SHOW_MS);
      later(() => setItems((prev) => prev.filter((x) => x.id !== id)), SHOW_MS + 320);
    };
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 z-[90] flex flex-col items-center gap-2 px-4 md:right-6 md:bottom-6 md:left-auto md:items-end md:px-0 ${
        aboveTabBar ? "bottom-[calc(env(safe-area-inset-bottom)+80px)]" : "bottom-4"
      }`}
    >
      {items.map((t) => (
        <div
          key={t.id}
          data-leaving={t.leaving || undefined}
          className="doc-toast flex max-w-[420px] items-center gap-3 rounded-lg bg-ink py-3 pr-4 pl-3 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(34,30,31,0.35)]"
        >
          <span
            aria-hidden="true"
            className={`flex h-7 w-7 flex-none -skew-x-[12deg] items-center justify-center rounded-[5px] ${
              t.tone === "ok" ? "bg-orange text-ink" : "bg-purple text-white"
            }`}
          >
            {t.tone === "ok" ? <IconCheck size={16} strokeWidth={3} /> : <IconInfo size={16} strokeWidth={2.4} />}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
