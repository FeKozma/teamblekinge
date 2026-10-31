import type { CSSProperties, ReactNode } from "react";

export type RelayStep = { title: string; text: ReactNode };

/**
 * Steps as the legs of a relay: an orange baton is handed from step to step,
 * over and over, and each number lights up as the baton arrives (public.css).
 * Four equal columns from md, four equal rows on phones — the baton's
 * keyframes assume evenly spaced stations, so the grid has no gaps.
 */
export function RelaySteps({ steps }: { steps: RelayStep[] }) {
  return (
    <div className="relative">
      {/* Rail + baton between the first and last number */}
      <div
        aria-hidden="true"
        className="absolute top-[12.5%] bottom-[12.5%] left-[24px] w-0 md:top-[24px] md:right-[12.5%] md:bottom-auto md:left-[12.5%] md:h-0 md:w-auto"
      >
        <span className="absolute inset-y-0 -left-[3px] w-1.5 rounded-full bg-ink/10 md:inset-x-0 md:inset-y-auto md:-top-[3px] md:left-0 md:h-1.5 md:w-auto" />
        {/* Carried beside the numbers (phones) / above them (desktop), never covering them */}
        <span className="relay-baton absolute z-[2] ml-8 block h-9 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange shadow-[0_4px_10px_rgba(168,84,0,0.5)] ring-2 ring-ink md:-mt-[38px] md:ml-0 md:h-3.5 md:w-12 md:[transform:skewX(-20deg)]" />
      </div>

      <ol className="relative m-0 grid list-none auto-rows-fr p-0 md:grid-cols-4 md:auto-rows-auto">
        {steps.map((s, i) => (
          <li
            key={s.title}
            data-reveal={i % 2 ? "up" : ""}
            style={{ "--reveal-i": i } as CSSProperties}
            className="flex items-center gap-4 py-2.5 md:flex-col md:items-center md:gap-4 md:px-3 md:py-0 md:text-center"
          >
            <span
              className="relay-mark relative z-[1] flex h-12 w-12 flex-none items-center justify-center rounded-full bg-ink text-[22px] font-extrabold text-orange ring-4 ring-paper"
              style={{ "--leg": i } as CSSProperties}
            >
              {i + 1}
            </span>
            <div
              className="straighten-hover flex min-w-0 flex-1 flex-col gap-1 self-stretch rounded-md border border-line bg-white p-4 shadow-[0_10px_22px_-14px_rgba(34,30,31,0.35)] md:self-auto md:p-5"
              style={{ rotate: `${[-1.2, 0.8, -0.6, 1.2][i % 4]}deg` }}
            >
              <span className="text-[12px] font-extrabold tracking-[1px] text-orange-dark uppercase">
                Sträcka {i + 1}
              </span>
              <h3 className="m-0 text-[20px] leading-tight font-extrabold">{s.title}</h3>
              <div className="text-[15px] text-muted">{s.text}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
