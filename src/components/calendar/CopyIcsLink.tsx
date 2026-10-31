"use client";

import { useState } from "react";
import { IconCheck, IconLink } from "@/components/icons";

/** Copies the absolute iCal URL, for "add calendar from URL" in calendar apps. */
export function CopyIcsLink({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(new URL("/kalender.ics", window.location.href).href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
          } catch {
            // Clipboard blocked: the link next to this button still works.
          }
        }}
      >
        {copied ? <IconCheck size={18} strokeWidth={2.6} /> : <IconLink size={18} />}
        {copied ? "Länken är kopierad" : "Kopiera kalenderlänk"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Kalenderlänken är kopierad" : ""}
      </span>
    </>
  );
}
