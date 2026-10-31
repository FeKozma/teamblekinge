import type { CSSProperties } from "react";

// The wordmark PNG (2120×300) holds three runner silhouettes and the text.
// We crop it into four pieces with CSS backgrounds so the runners can animate
// one after another — crouched start, upright, full stride — like a race start.
// Coordinates are in the PNG's own pixels. Size it with `scale` or by setting
// the --s custom property from a class (e.g. "[--s:0.18] md:[--s:0.32]").
const SRC = "/img/logo-wordmark.png";
const TOP = 60;
const HEIGHT = 180;
const PIECES = [
  { x: 72, w: 182, gap: 30 }, // crouched start
  { x: 284, w: 92, gap: 42 }, // upright
  { x: 418, w: 184, gap: 84 }, // full stride
  { x: 686, w: 748, gap: 0 }, // TEAM BLEKINGE / LÖPARFÖRENING
];

export function Logo({ scale, className = "" }: { scale?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Team Blekinge Löparförening"
      className={`inline-flex items-end ${className}`}
      style={scale ? ({ "--s": scale } as CSSProperties) : undefined}
    >
      {PIECES.map((p, i) => (
        <span
          key={p.x}
          aria-hidden="true"
          className={i < 3 ? "logo-runner block" : "block"}
          style={
            {
              "--i": i,
              width: `calc(${p.w}px * var(--s))`,
              height: `calc(${HEIGHT}px * var(--s))`,
              marginRight: `calc(${p.gap}px * var(--s))`,
              backgroundImage: `url(${SRC})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `calc(2120px * var(--s)) auto`,
              backgroundPosition: `calc(${-p.x}px * var(--s)) calc(${-TOP}px * var(--s))`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
