"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconBell } from "@/components/icons";
import { useDemoState } from "@/lib/demo-store";

// DEMO notifications. In the real site these come from what the member follows
// (categories, threads, @mentions) — see "Mina aviseringar" in the drawups.
const items = [
  { id: "n1", href: "/nyheter/kyrkstafetten", text: "Anna svarade dig i ”Vi söker löpare till Kyrkstafetten”", when: "08:30" },
  { id: "n2", href: "/flodet", text: "Tomas lade upp en löprunda: långpass lördag 09:00 till Mörtsjön", when: "4 tim" },
  { id: "n3", href: "/nyheter/protokoll-styrelsemote-2026-10-12", text: "Styrelsen: nytt protokoll från 12 oktober", when: "24 okt" },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useDemoState<string[]>("notifications-seen", []);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((i) => !seen.includes(i.id)).length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread ? `Aviseringar, ${unread} olästa` : "Aviseringar"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-ink-2"
      >
        <IconBell size={22} className={unread ? "origin-top motion-safe:animate-[bell_2.4s_ease-in-out_1s_2]" : ""} />
        {!!unread && (
          <span className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-1 text-[11px] font-extrabold text-ink">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-xl border border-line bg-white text-ink shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-extrabold">Aviseringar</span>
            <button
              type="button"
              onClick={() => setSeen(items.map((i) => i.id))}
              className="text-[13px] font-semibold text-orange-dark underline"
            >
              Markera alla som lästa
            </button>
          </div>
          <ul>
            {items.map((i) => (
              <li key={i.id} className="border-b border-line last:border-0">
                <Link
                  href={i.href}
                  onClick={() => {
                    setSeen((s) => (s.includes(i.id) ? s : [...s, i.id]));
                    setOpen(false);
                  }}
                  className="flex gap-3 px-4 py-3 text-[14px] text-ink no-underline hover:bg-paper"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 flex-none rounded-full ${seen.includes(i.id) ? "bg-transparent" : "bg-orange"}`}
                  />
                  <span className="flex flex-col">
                    {i.text}
                    <span className="text-[12px] text-muted">{i.when}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
