import type { CSSProperties } from "react";
import { IconCheck, IconRunner } from "@/components/icons";
import { dayMonth, longDate } from "@/lib/format";
import { IconFlag } from "./icons";

type Run = { date: string; place: string; note?: string };

/**
 * The year's long runs as stations on a running track. The stretch already
 * run is filled orange, with the runner standing where the season is now:
 * a track you have already run. Horizontal from md, vertical on phones.
 */
export function LongRunTrack({
  runs,
  today,
  texts,
}: {
  runs: Run[];
  today: string;
  /** Page texts: "Nästa långpass:", and what to say once the year's runs are done. */
  texts: { next: string; done: string; doneMore: string };
}) {
  const n = runs.length;
  const lastPast = runs.reduce((acc, r, i) => (r.date < today ? i : acc), -1);
  const progress = lastPast < 0 ? 0 : n > 1 ? lastPast / (n - 1) : 1;
  const pct = `${progress * 100}%`;
  const next = runs[lastPast + 1];
  const edge = `calc(100% / ${n * 2})`;

  return (
    <div className="flex flex-col gap-6">
      <div data-reveal="up" className="relative md:pt-11">
        {/* Phone: vertical rail behind the dots */}
        <div aria-hidden="true" className="absolute top-4 bottom-4 left-[13px] w-1.5 rounded-full bg-line md:hidden">
          <div className="grow-y absolute inset-x-0 top-0 rounded-full bg-orange" style={{ height: pct }} />
        </div>
        {/* Desktop: horizontal rail from the first dot to the last, with the runner on it */}
        <div
          aria-hidden="true"
          className="absolute top-[57px] hidden h-1.5 rounded-full bg-line md:block"
          style={{ left: edge, right: edge }}
        >
          <div className="grow-x absolute inset-y-0 left-0 rounded-full bg-orange" style={{ width: pct }} />
          <span
            className="run-to-x absolute -top-10 flex -translate-x-1/2 flex-col items-center text-orange-dark"
            style={{ left: pct }}
          >
            <IconRunner size={30} strokeWidth={2.4} className="stride" />
          </span>
        </div>

        <ol
          className="relative m-0 grid list-none gap-4 p-0 md:gap-2 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
          style={{ "--n": n } as CSSProperties}
        >
          {runs.map((r, i) => {
            const past = i <= lastPast;
            return (
              <li key={r.date} className="flex items-center gap-4 md:flex-col md:gap-2 md:text-center">
                <span
                  className={`pop-in flex h-8 w-8 flex-none items-center justify-center rounded-full border-[3px] ${
                    past ? "border-orange bg-orange text-ink" : "border-ink bg-white"
                  }`}
                  style={{ "--pop-i": i } as CSSProperties}
                >
                  {past ? (
                    <IconCheck size={15} strokeWidth={3.2} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-ink" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <time dateTime={r.date} className={`text-[16px] font-extrabold ${past ? "text-muted" : ""}`}>
                    {dayMonth(r.date)}
                  </time>
                  <span className="text-[14px] text-muted">
                    {r.place}
                    {r.note && <span className="block text-[13px] font-semibold text-purple">{r.note}</span>}
                  </span>
                  {past && <span className="sr-only">(redan sprunget)</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="m-0 flex items-start gap-2.5 rounded-xl border border-line bg-white px-4 py-3 text-[15px]" data-reveal>
        <IconFlag size={20} className="mt-0.5 flex-none text-orange-dark" />
        {next ? (
          <span>
            <strong>{texts.next}</strong> {longDate(next.date)} · {next.place}
          </span>
        ) : (
          <span>
            <strong>{texts.done}</strong> {texts.doneMore}
          </span>
        )}
      </p>
    </div>
  );
}
