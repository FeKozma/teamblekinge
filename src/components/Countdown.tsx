"use client";

import { useEffect, useState } from "react";

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Live countdown to a start time; ticks every second. */
export function Countdown({ to, className = "" }: { to: string; className?: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing on the server so the numbers never mismatch on hydration.
  if (now === null) return <span className={className} aria-hidden="true" />;
  const left = target - now;
  if (left <= 0) return <span className={className}>Loppet är igång!</span>;
  const t = split(left);
  const cells: [number, string][] = [
    [t.d, "dagar"],
    [t.h, "tim"],
    [t.m, "min"],
    [t.s, "sek"],
  ];
  return (
    <span className={`inline-flex gap-1.5 ${className}`} role="timer" aria-label={`${t.d} dagar ${t.h} timmar kvar`}>
      {cells.map(([v, label]) => (
        <span key={label} className="flex min-w-[46px] flex-col items-center rounded-md bg-ink-3 px-1.5 py-1 leading-none">
          <span className="text-[20px] font-extrabold tabular-nums text-white">{String(v).padStart(2, "0")}</span>
          <span className="mt-1 text-[10px] font-bold tracking-[0.5px] text-orange uppercase">{label}</span>
        </span>
      ))}
    </span>
  );
}
