import type { ReactNode } from "react";

/** Dashed "this is a demo" note, in the style used on the login page. */
export function DemoNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`m-0 inline-flex items-start gap-2 self-start rounded-xl border border-dashed border-purple/40 bg-purple-soft px-3.5 py-2 text-[14px] text-ink ${className}`}
    >
      <span className="font-extrabold text-purple">Demo</span>
      <span>{children}</span>
    </p>
  );
}
