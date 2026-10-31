import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { SpeedLines } from "@/components/ui";
import "./public.css";

export { DemoNote } from "./DemoNote";

// Building blocks shared by the public info pages (Träna med oss, Tävla,
// Föreningen, Bli medlem, Frågor). Same language as the landing page: dark
// slanted bands, skewed heading bars, things that lean and run in.

/** Page-width wrapper with the site's gutters. */
export const wrap = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

const bandTone = {
  ink: "bg-ink text-white",
  purple: "bg-purple text-white",
  orange: "stripes-drift bg-orange text-ink",
} as const;

/** Full-width band with slanted top and bottom edges and speed lines. */
export function Band({
  tone = "ink",
  id,
  labelledBy,
  children,
  className = "",
}: {
  tone?: keyof typeof bandTone;
  id?: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative ${bandTone[tone]} ${className}`}
      style={{ clipPath: "polygon(0 56px, 100% 0, 100% calc(100% - 56px), 0 100%)" }}
    >
      <SpeedLines
        viewBox="0 0 1440 900"
        color={tone === "orange" ? "#221E1F" : "#EE8915"}
        opacity={tone === "orange" ? 0.14 : 0.28}
        lines={[
          [980, 900, 1300, 0],
          [1050, 900, 1370, 0],
          [1120, 900, 1440, 0],
          [-160, 900, 160, 0],
        ]}
      />
      <div className={`${wrap} relative py-[104px] md:py-[120px]`}>{children}</div>
    </section>
  );
}

const barTone = { orange: "bg-orange", ink: "bg-ink", white: "bg-white", purple: "bg-purple" } as const;

/** Big, slightly rotated heading for dark/coloured bands (like "Våra lopp"). */
export function BandHeading({
  id,
  children,
  bar = "orange",
  sub,
  subClassName = "text-mist",
}: {
  id?: string;
  children: ReactNode;
  bar?: keyof typeof barTone;
  sub?: ReactNode;
  subClassName?: string;
}) {
  return (
    <div data-reveal className="flex flex-col gap-3">
      <h2
        id={id}
        className="m-0 flex origin-left -rotate-2 items-center gap-4 text-[32px] leading-[1.1] font-extrabold tracking-[-1px] md:text-[42px]"
      >
        <span aria-hidden="true" className={`skew-bar !h-5 !w-10 ${barTone[bar]}`} />
        {children}
      </h2>
      {sub && <p className={`m-0 max-w-[680px] text-[17px] md:text-[18px] ${subClassName}`}>{sub}</p>}
    </div>
  );
}

/** "Jump to" links under a PageHero: little tilted tags that run in one by one. */
export function JumpNav({ links, label = "På den här sidan" }: { links: { href: string; label: string }[]; label?: string }) {
  return (
    <nav aria-label={label} className="mt-2">
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {links.map((l, i) => (
          <li key={l.href} className="run-in" style={{ "--i": i + 3 } as CSSProperties}>
            <Link
              href={l.href}
              style={{ "--r": i % 2 ? "1.5deg" : "-1.5deg" } as CSSProperties}
              className="inline-flex min-h-10 items-center rounded-full border border-ink-2 bg-ink-3 px-3.5 text-[14px] font-semibold text-white no-underline transition-[background-color,color,rotate,translate] duration-300 [rotate:var(--r)] hover:-translate-y-0.5 hover:bg-orange hover:text-ink hover:[rotate:0deg]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Initials for name tiles: first and last name ("Ida Linn Silfors" → "IS"). */
export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Google Maps search link for an address. */
export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
