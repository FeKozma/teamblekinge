import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { FormSection } from "@/components/admin/form";
import { IconChevronRight, IconLock, IconPeople, IconPlus } from "@/components/icons";
import { DateBadge, Pill } from "@/components/ui";
import { getEventSeries, getOneOffEvents } from "@/lib/content/events";
import {
  byStart,
  eventKindLabel,
  seriesEvents,
  weekdayNames,
  weekdayPlural,
  type ClubEvent,
  type EventSeries,
} from "@/lib/data/events";
import { dayMonth, longDate, monthsLong, todayISO } from "@/lib/format";

export const metadata: Metadata = { title: "Kalender" };

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function AdminCalendarPage() {
  if (!(await requireBoard())) return null;
  const today = todayISO();
  const [oneOff, series] = await Promise.all([getOneOffEvents(), getEventSeries()]);
  const own = oneOff.filter((e) => e.source !== "flode").sort(byStart);
  const upcoming = own.filter((e) => e.date >= today);
  const past = own.filter((e) => e.date < today).reverse();
  const runs = oneOff.filter((e) => e.source === "flode" && e.date >= today).sort(byStart);

  return (
    <AdminPage
      title="Kalender"
      intro="Träningar, möten, lopp och resor. Det du lägger in syns direkt i kalendern, på startsidan och i kalenderprenumerationen – i demon bara för dig."
      publicHref="/kalender"
      publicLabel="Visa kalendern"
      actions={
        <Link href="/admin/kalender/ny" className="btn btn-primary btn-lg lean-hover">
          <IconPlus size={20} strokeWidth={2.6} /> Lägg in i kalendern
        </Link>
      }
    >
      <FormSection
        title="På gång"
        description="Möten, lopp, resor och extra träningar – det som händer en gång. Klicka för att ändra, ställa in eller ta bort."
      >
        {upcoming.length ? (
          <MonthList events={upcoming} today={today} />
        ) : (
          <p className="m-0 rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-muted">
            Inget inlagt framåt.{" "}
            <Link href="/admin/kalender/ny" className="font-semibold">
              Lägg in något
            </Link>
          </p>
        )}
        {past.length > 0 && (
          <details className="group rounded-[10px] border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
              <IconChevronRight size={16} className="transition-transform group-open:rotate-90" />
              Det som redan har varit ({past.length})
            </summary>
            <div className="border-t border-line p-3 sm:p-4">
              <MonthList events={past} today={today} />
            </div>
          </details>
        )}
      </FormSection>

      <FormSection
        title="Återkommande pass"
        description="Pass som går samma veckodag och tid varje vecka. Öppna ett pass för att ändra det eller ställa in ett enstaka tillfälle."
        aside={
          <Link href="/admin/kalender/aterkommande/ny" className="btn btn-outline bg-white">
            <IconPlus size={18} /> Nytt återkommande pass
          </Link>
        }
      >
        {series.length ? (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {series.map((s, i) => (
              <SeriesRow key={s.id} s={s} i={i} today={today} />
            ))}
          </ul>
        ) : (
          <p className="m-0 rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-muted">
            Inga återkommande pass.
          </p>
        )}
      </FormSection>

      <FormSection
        title="Löprundor från Klubbflödet"
        description={
          <>
            Medlemmarna lägger själva upp löprundor i Klubbflödet, och de hamnar automatiskt i kalendern – bara för
            inloggade medlemmar. Därför kan du inte ändra dem här: den som lagt upp rundan ändrar den i flödet.
          </>
        }
      >
        {runs.length ? (
          <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-[10px] border border-line p-0">
            {runs.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                <DateBadge date={e.date} today={today} size={44} />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="font-bold">{e.title}</span>
                  <span className="text-[14px] text-muted">
                    {capitalize(longDate(e.date))} kl. {e.time} · {e.place}
                  </span>
                </span>
                <span className="inline-flex flex-none items-center gap-1 text-[13px] font-bold text-purple">
                  <IconPeople size={15} /> Från flödet
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-muted">Inga löprundor upplagda just nu.</p>
        )}
      </FormSection>

      <p className="m-0 pb-10 text-[14px] text-muted">
        Rubriken och texterna överst på kalendersidan ändrar du under{" "}
        <Link href="/admin/sidor/kalender" className="font-semibold">
          Sidtexter › Kalender
        </Link>
        .
      </p>
    </AdminPage>
  );
}

/** One-off events grouped by month, each a link to its editor. */
function MonthList({ events, today }: { events: ClubEvent[]; today: string }) {
  const months: { key: string; items: ClubEvent[] }[] = [];
  for (const e of events) {
    const key = e.date.slice(0, 7);
    if (months.at(-1)?.key !== key) months.push({ key, items: [] });
    months.at(-1)!.items.push(e);
  }
  let n = 0;
  return (
    <div className="flex flex-col gap-4">
      {months.map((m) => {
        const [y, mo] = m.key.split("-").map(Number);
        return (
          <section key={m.key} className="flex flex-col gap-2" aria-label={`${monthsLong[mo - 1]} ${y}`}>
            <h3 className="m-0 flex items-baseline gap-2 text-[15px] font-extrabold">
              <span aria-hidden="true" className="skew-bar h-2.5 w-3.5 bg-ink" />
              {capitalize(monthsLong[mo - 1])}
              <span className="text-[13px] font-bold text-muted">{y}</span>
            </h3>
            <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-[10px] border border-line p-0">
              {m.items.map((e) => (
                <EventRow key={e.id} e={e} today={today} i={n++} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function EventRow({ e, today, i }: { e: ClubEvent; today: string; i: number }) {
  return (
    <li data-reveal style={{ "--reveal-i": Math.min(i, 5) } as CSSProperties}>
      <Link
        href={`/admin/kalender/${e.id}`}
        className="group flex items-center gap-3 px-3 py-2.5 text-ink no-underline transition-colors hover:bg-paper/70 hover:text-ink sm:px-4"
      >
        <DateBadge date={e.date} today={today} size={44} highlight={e.kind === "lopp" && !e.cancelled} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {e.cancelled && (
              <span className="bg-ink px-1.5 py-px text-[11px] font-extrabold tracking-[1px] text-orange uppercase [rotate:-2deg]">
                Inställt
              </span>
            )}
            <span className={`font-bold ${e.cancelled ? "text-muted line-through decoration-2" : ""}`}>{e.title}</span>
            {e.membersOnly && (
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-purple">
                <IconLock size={13} /> Medlemmar
              </span>
            )}
          </span>
          <span className="text-[14px] text-muted">
            {capitalize(longDate(e.date))} kl. {e.time} · {e.place}
          </span>
        </span>
        <Pill tone="soft" className="flex-none max-sm:hidden">
          {eventKindLabel[e.kind]}
        </Pill>
        <IconChevronRight
          size={18}
          className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </li>
  );
}

function SeriesRow({ s, i, today }: { s: EventSeries; i: number; today: string }) {
  const coming = seriesEvents(s, today).filter((e) => e.date >= today);
  const next = coming.find((e) => !e.cancelled);
  const off = coming.filter((e) => e.cancelled).length;
  const first = coming[0]?.date;
  const last = coming.at(-1)?.date;
  return (
    <li
      data-settle
      style={{ "--rest-rotate": i % 2 ? "0.4deg" : "-0.4deg", "--reveal-i": i } as CSSProperties}
    >
      <Link
        href={`/admin/kalender/aterkommande/${s.id}`}
        className="straighten-hover group flex items-center gap-4 rounded-[10px] border border-line bg-white px-4 py-3.5 text-ink no-underline hover:border-ink hover:text-ink"
      >
        <span className="flex h-12 w-12 flex-none -skew-x-[10deg] flex-col items-center justify-center rounded-lg bg-ink text-white">
          <span className="skew-x-[10deg] text-[11px] font-extrabold text-orange uppercase">
            {weekdayNames[s.weekday - 1].slice(0, 3)}
          </span>
          <span className="skew-x-[10deg] text-[14px] leading-none font-extrabold tabular-nums">{s.time}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="text-[17px] font-bold">{s.title}</span>
            {s.membersOnly && (
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-purple">
                <IconLock size={13} /> Medlemmar
              </span>
            )}
          </span>
          <span className="text-[14px] text-muted">
            {capitalize(weekdayPlural(s.weekday))} kl. {s.time} · {s.place}
          </span>
          <span className="text-[13px] text-muted">
            {first && last
              ? s.until
                ? `${dayMonth(first)} – ${dayMonth(last)}`
                : `Från ${dayMonth(first)}, tills vidare`
              : "Inga fler pass framåt"}
            {next && <> · Nästa: {longDate(next.date)}</>}
            {off > 0 && (
              <span className="font-semibold text-orange-dark"> · {off === 1 ? "1 inställt pass" : `${off} inställda pass`}</span>
            )}
          </span>
        </span>
        <IconChevronRight
          size={18}
          className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </li>
  );
}
