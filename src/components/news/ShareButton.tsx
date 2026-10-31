"use client";

import { useState } from "react";
import { IconLink } from "@/components/icons";

/** Share sheet on phones, copy-to-clipboard elsewhere. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href.split("#")[0];
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissed — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked; the address bar still works.
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        aria-label="Dela länk"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-white"
      >
        <IconLink size={22} />
      </button>
      <span
        role="status"
        className={`pointer-events-none absolute top-full right-0 z-10 mt-1 rounded-md bg-ink px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap text-white transition-[opacity,translate] duration-300 ${
          copied ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
      >
        {copied ? "Länken är kopierad" : ""}
      </span>
    </div>
  );
}
