import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { Tone } from "@/lib/data/users";
import { people } from "@/lib/data/users";
import { dayNum, monthShort, relativeDay } from "@/lib/format";

/**
 * Wrap every page's content in this. Route changes then animate: the old page
 * runs off to the left, the new one runs in from the right (see globals.css,
 * `.run-page`). Must sit in page.tsx, not a layout — layouts persist across
 * navigations, so enter/exit never fire there.
 */
export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <ViewTransition enter="run-page" exit="run-page" default="none">
      <main id="main" className={`pb-24 md:pb-0 ${className}`}>
        {children}
      </main>
    </ViewTransition>
  );
}

const toneBg: Record<Tone, string> = {
  ink: "bg-ink text-white",
  orange: "bg-orange text-ink",
  purple: "bg-purple text-white",
};
const toneBar: Record<Tone, string> = {
  ink: "bg-ink",
  orange: "bg-orange",
  purple: "bg-purple",
};

export function toneClasses(tone: Tone) {
  return toneBg[tone];
}

/** Section heading with the skewed accent bar that sprints in on scroll. */
export function SectionHeading({
  children,
  tone = "orange",
  as: Tag = "h2",
  size = "md",
  action,
  sub,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  as?: "h1" | "h2" | "h3";
  size?: "md" | "lg";
  action?: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 ${className}`}
    >
      <div>
        <Tag
          className={`m-0 flex items-center font-extrabold ${
            size === "lg"
              ? "gap-4 text-[34px] tracking-[-1px] md:text-[44px]"
              : "gap-3.5 text-[24px] tracking-[-0.5px] md:text-[28px]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`skew-bar ${toneBar[tone]} ${size === "lg" ? "!h-5 !w-10" : ""}`}
          />
          {children}
        </Tag>
        {sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`arrow-link ${className}`}>
      {children} <span className="arrow">→</span>
    </Link>
  );
}

export function Pill({
  tone = "ink",
  children,
  className = "",
}: {
  tone?: Tone | "soft";
  children: ReactNode;
  className?: string;
}) {
  const cls = tone === "soft" ? "bg-paper text-ink border border-line" : toneBg[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 self-start rounded-full px-2.5 py-[3px] text-[13px] font-bold ${cls} ${className}`}
    >
      {children}
    </span>
  );
}

/** Square date tile: "29 / OKT", or "I DAG" on the day itself. */
export function DateBadge({
  date,
  today,
  highlight = false,
  size = 48,
}: {
  date: string;
  today?: string;
  highlight?: boolean;
  size?: number;
}) {
  const rel = today ? relativeDay(date, today) : null;
  return (
    <span
      className={`flex flex-none flex-col items-center justify-center rounded-lg leading-[1.1] ${
        highlight ? "bg-orange text-ink" : "bg-ink text-white"
      }`}
      style={{ width: size, height: size }}
    >
      {rel ? (
        <span
          className={`px-1 text-center text-[11px] font-extrabold uppercase ${highlight ? "" : "text-orange"}`}
        >
          {rel}
        </span>
      ) : (
        <>
          <span className="text-[17px] font-extrabold">{dayNum(date)}</span>
          <span
            className={`text-[11px] font-extrabold uppercase ${highlight ? "" : "text-orange"}`}
          >
            {monthShort(date)}
          </span>
        </>
      )}
    </span>
  );
}

export function Avatar({
  person,
  size = 36,
  className = "",
}: {
  person: string;
  size?: number;
  className?: string;
}) {
  const p = people[person];
  const tone: Tone = p?.tone ?? "ink";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-none items-center justify-center rounded-full font-bold ${toneBg[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {p?.initial ?? "?"}
    </span>
  );
}

/**
 * Diagonal speed lines with bright streaks running along them.
 * `lines` are [x1, y1, x2, y2] in the 1440×640 viewBox.
 */
export function SpeedLines({
  lines,
  viewBox = "0 0 1440 640",
  color = "#EE8915",
  opacity = 0.28,
  className = "",
  children,
}: {
  lines: [number, number, number, number][];
  viewBox?: string;
  color?: string;
  opacity?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <g fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {lines.map(([x1, y1, x2, y2]) => (
          <path key={`${x1}-${y1}`} d={`M${x1} ${y1} L${x2} ${y2}`} />
        ))}
      </g>
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        {lines.map(([x1, y1, x2, y2], i) => (
          <path
            key={`s-${x1}-${y1}`}
            pathLength={1470}
            className="speed-streak"
            style={
              {
                "--streak-dur": `${3.6 + ((i * 7) % 5) * 0.5}s`,
                "--streak-delay": `${(i * 1.3) % 3.1}s`,
              } as CSSProperties
            }
            d={`M${x1} ${y1} L${x2} ${y2}`}
          />
        ))}
      </g>
      {children}
    </svg>
  );
}

/**
 * Dark, slanted page header for inner pages — the same language as the
 * landing hero, at a smaller scale.
 */
export function PageHero({
  kicker,
  title,
  intro,
  children,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden bg-ink text-white"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 56px), 0 100%)" }}
    >
      <SpeedLines
        lines={[
          [700, 640, 1060, 0],
          [780, 640, 1140, 0],
          [860, 640, 1220, 0],
          [940, 640, 1300, 0],
        ]}
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-4 px-4 pt-12 pb-24 md:px-6 md:pt-16 md:pb-28">
        {kicker && (
          <span className="run-in self-start bg-orange px-3 py-1 text-[13px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
            {kicker}
          </span>
        )}
        <h1
          className="run-in m-0 max-w-[820px] text-[38px] leading-[1.05] font-extrabold tracking-[-1px] md:text-[52px]"
          style={{ "--i": 1 } as CSSProperties}
        >
          {title}
        </h1>
        {intro && (
          <p
            className="run-in m-0 max-w-[640px] text-[17px] text-mist md:text-[18px]"
            style={{ "--i": 2 } as CSSProperties}
          >
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
