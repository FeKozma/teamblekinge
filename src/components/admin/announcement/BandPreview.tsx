"use client";

import { useEffect, useRef, useState } from "react";
import type { Announcement } from "@/lib/data/announcement";

/**
 * The Aktuellt band as it will look, following the form it sits in as the
 * editor types. Reads the form's fields by name, so it needs no wiring.
 */
export function BandPreview({ initial, today }: { initial: Announcement; today: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [a, setA] = useState(initial);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const read = () => {
      const d = new FormData(form);
      const s = (k: string) => String(d.get(k) ?? "").trim();
      setA({
        show: d.get("show") === "on",
        until: s("until"),
        label: s("label"),
        title: s("title"),
        text: s("text"),
        linkText: s("linkText"),
        href: s("href"),
      });
    };
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
    };
  }, []);

  const hidden = !a.show ? "Bandet är dolt." : a.until && a.until < today ? "Sista dagen har passerat – bandet visas inte." : null;

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div
        aria-hidden="true"
        className={`stripes-drift overflow-hidden rounded-lg bg-orange text-ink transition-opacity ${hidden ? "opacity-40" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 text-[15px]">
          {a.label && (
            <span className="rounded-full bg-ink px-2.5 py-[3px] text-[12px] font-extrabold tracking-[0.5px] text-white uppercase">
              {a.label}
            </span>
          )}
          <span className="font-bold">{a.title || "Rubrik"}</span>
          {a.text && <span className="hidden sm:inline">{a.text}</span>}
          {a.href && a.linkText && (
            <span className="ml-auto font-bold">
              {a.linkText} <span>→</span>
            </span>
          )}
        </div>
      </div>
      <p role="status" className="m-0 text-[13px] text-muted">
        {hidden ?? "Så här ser bandet ut överst på startsidan."}
      </p>
    </div>
  );
}
