"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconLink } from "@/components/icons";
import { toast } from "./Toaster";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No async clipboard (plain http on a LAN address, old browsers): fall back
    // to a hidden textarea and the legacy copy command.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

const variants = {
  /** The table buttons in the admin drawup. */
  small:
    "min-h-9 rounded-md border border-[#cfc8c4] bg-white px-3 text-[13px] font-semibold text-ink hover:border-ink",
  /** "Kopiera länk till mappen" and the document page. */
  outline:
    "min-h-11 rounded-lg border-[1.5px] border-[#cfc8c4] bg-white px-4 text-[15px] font-semibold text-ink hover:border-ink",
};

/**
 * Copies the absolute URL of `href` (a site path) and confirms with a toast.
 * The links work anywhere – a guest who opens one logs in and lands right on it.
 */
export function CopyLinkButton({
  href,
  label = "Kopiera länk",
  what,
  variant = "small",
  icon = false,
  className = "",
}: {
  href: string;
  label?: string;
  /** For screen readers: "Kopiera länk till {what}". */
  what?: string;
  variant?: keyof typeof variants;
  icon?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onClick() {
    const url = new URL(href, window.location.origin).toString();
    if (await copyText(url)) {
      setCopied(true);
      toast(`Länken är kopierad – ${url.replace(/^https?:\/\//, "")}`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      toast("Kunde inte kopiera – markera adressen i webbläsaren i stället.", "info");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={what ? `${label} till ${what}` : undefined}
      className={`inline-flex flex-none cursor-pointer items-center justify-center gap-2 transition-[border-color,translate] duration-200 hover:-translate-y-px ${variants[variant]} ${className}`}
    >
      {copied ? (
        <IconCheck size={variant === "small" ? 14 : 16} strokeWidth={3} className="copied-pop text-green" />
      ) : (
        icon && <IconLink size={16} />
      )}
      {copied ? "Kopierad!" : label}
    </button>
  );
}
