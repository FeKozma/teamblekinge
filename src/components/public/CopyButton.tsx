"use client";

import { useState } from "react";
import { IconCheck } from "@/components/icons";
import { IconCopy } from "./icons";

/** Copies a payment number (Swish, bankgiro) without the spaces. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, ""));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked (insecure origin etc.) — the number is still on screen.
        }
      }}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
    >
      {copied ? <IconCheck size={16} className="text-green" /> : <IconCopy size={16} />}
      <span aria-live="polite">{copied ? "Kopierat" : "Kopiera"}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
