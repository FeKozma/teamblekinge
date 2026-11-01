"use client";

import { useEffect, useId, useRef, useState, useTransition, type CSSProperties } from "react";
import { cancelSessionAction, reinstateSessionAction } from "@/app/admin/kalender/actions";
import { fieldClass } from "@/components/admin/form";
import { toast } from "@/components/documents/Toaster";
import { DateBadge } from "@/components/ui";
import { longDate } from "@/lib/format";

export type Session = { date: string; cancelled?: boolean; reason?: string };

const PAGE = 8;

/**
 * The coming sessions of a weekly series, each with "Ställ in" (with an
 * optional reason) or, once cancelled, "Ta tillbaka".
 */
export function Sessions({
  seriesId,
  time,
  sessions,
  today,
  focus,
}: {
  seriesId: string;
  time: string;
  /** From today on. */
  sessions: Session[];
  today: string;
  /** A date to open and scroll to (from the calendar's edit link). */
  focus?: string;
}) {
  const focusAt = focus ? sessions.findIndex((s) => s.date === focus) : -1;
  const [limit, setLimit] = useState(Math.max(PAGE, focusAt + 1));
  const [open, setOpen] = useState<string | null>(focusAt >= 0 && !sessions[focusAt].cancelled ? focus! : null);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (focusAt < 0) return;
    list.current
      ?.querySelector<HTMLElement>(`[data-date="${focus}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sessions.length === 0) {
    return (
      <p className="m-0 rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-muted">
        Inga fler pass framåt. Ändra ”Sista gången” ovan om passet ska fortsätta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ol ref={list} className="m-0 flex list-none flex-col divide-y divide-line rounded-[10px] border border-line p-0">
        {sessions.slice(0, limit).map((s, i) => (
          <SessionRow
            key={s.date}
            i={i}
            seriesId={seriesId}
            time={time}
            session={s}
            today={today}
            open={open === s.date}
            focused={s.date === focus}
            onOpen={(on) => setOpen(on ? s.date : null)}
          />
        ))}
      </ol>
      {sessions.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn btn-outline self-start bg-white">
          Visa fler datum · {sessions.length - limit} till
        </button>
      )}
    </div>
  );
}

function SessionRow({
  i,
  seriesId,
  time,
  session: s,
  today,
  open,
  focused,
  onOpen,
}: {
  i: number;
  seriesId: string;
  time: string;
  session: Session;
  today: string;
  open: boolean;
  focused: boolean;
  onOpen: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const id = useId();
  const day = longDate(s.date);

  function cancel(data: FormData) {
    const reason = String(data.get("reason") ?? "");
    const notify = data.get("notify") === "on";
    startTransition(async () => {
      const res = await cancelSessionAction(seriesId, s.date, reason);
      if (!res?.ok) return setError(res?.errors?.reason ?? res?.message ?? "Det gick inte att ställa in passet.");
      setError(undefined);
      onOpen(false);
      if (res.message) toast(res.message);
      if (notify) toast("Demoläget skickar inga mejl. På riktigt får medlemmarna ett mejl om att passet är inställt.", "info");
    });
  }

  function reinstate() {
    startTransition(async () => {
      const res = await reinstateSessionAction(seriesId, s.date);
      if (res?.ok) {
        if (res.message) toast(res.message);
      } else toast(res?.message ?? "Det gick inte att ändra.", "info");
    });
  }

  return (
    <li
      data-date={s.date}
      data-reveal
      style={{ "--reveal-i": Math.min(i, 4) } as CSSProperties}
      className={`flex scroll-mt-24 flex-col gap-3 px-3 py-3 sm:px-4 ${focused ? "bg-orange-soft/60" : ""} ${
        s.cancelled ? "bg-paper/70" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <DateBadge date={s.date} today={today} size={44} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className={`font-bold ${s.cancelled ? "text-muted line-through decoration-2" : ""}`}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </span>
          <span className="text-[14px] text-muted">
            {s.cancelled ? (
              <>
                <span className="mr-1.5 inline-block bg-ink px-1.5 py-px text-[11px] font-extrabold tracking-[1px] text-orange uppercase [rotate:-2deg]">
                  Inställt
                </span>
                {s.reason}
              </>
            ) : (
              <>kl. {time}</>
            )}
          </span>
        </span>
        {s.cancelled ? (
          <button
            type="button"
            disabled={pending}
            onClick={reinstate}
            className="btn btn-outline min-h-10 bg-white px-3 text-[14px] disabled:opacity-70"
          >
            {pending ? "Ändrar …" : "Ta tillbaka"}
            <span className="sr-only">– passet {day} blir av</span>
          </button>
        ) : (
          !open && (
            <button
              type="button"
              onClick={() => onOpen(true)}
              className="btn btn-outline min-h-10 bg-white px-3 text-[14px]"
            >
              Ställ in<span className="sr-only"> passet {day}</span>
            </button>
          )
        )}
      </div>

      {open && !s.cancelled && (
        <form
          action={cancel}
          aria-label={`Ställ in passet ${day}`}
          className="flex flex-col gap-3 rounded-[10px] border border-line bg-white p-3.5 sm:ml-[56px]"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-r`} className="text-[14px] font-semibold">
              Orsak <span className="font-normal text-muted">(valfritt)</span>
            </label>
            <input
              id={`${id}-r`}
              name="reason"
              autoFocus
              maxLength={200}
              placeholder="Till exempel: Banan är avstängd"
              aria-invalid={error ? true : undefined}
              aria-describedby={`${id}-h${error ? ` ${id}-e` : ""}`}
              className={fieldClass}
            />
            {error && (
              <span id={`${id}-e`} className="text-[13px] font-semibold text-[#b3261e]">
                {error}
              </span>
            )}
            <span id={`${id}-h`} className="text-[13px] text-muted">
              Visas i kalendern bredvid ”Inställt”.
            </span>
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 font-semibold">
            <input type="checkbox" name="notify" defaultChecked className="mt-0.5 h-5 w-5 flex-none accent-orange-dark" />
            <span className="flex flex-col">
              Mejla medlemmarna om det
              <span className="text-[13px] font-normal text-muted">Ett kort mejl med datum och orsak. I demon skickas inget.</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className="btn btn-dark disabled:opacity-70">
              {pending ? "Ställer in …" : "Ställ in passet"}
            </button>
            <button type="button" onClick={() => onOpen(false)} className="btn btn-outline">
              Avbryt
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
