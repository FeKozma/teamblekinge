import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CopyIcsLink } from "@/components/calendar/CopyIcsLink";
import { IconCalendar, IconPeople } from "@/components/icons";
import { ArrowLink, Page, PageHero } from "@/components/ui";
import { events, isPublicEvent } from "@/lib/data/events";
import { todayISO } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Kalender" };

// No drawup for this page — built in the same language as the rest: dark
// slanted hero, a two-week strip that overlaps its edge, then the agenda.
export default async function KalenderPage() {
  const user = await getSession();
  const member = !!user;
  const today = todayISO();
  const upcoming = events.filter((e) => e.date >= today && (member || isPublicEvent(e)));

  return (
    <Page>
      <PageHero
        kicker="Kalender"
        title={
          <>
            Nästa pass, nästa lopp,{" "}
            <span className="tilt-pop inline-block translate-y-0.5 -rotate-2 text-orange">nästa runda</span>
          </>
        }
        intro={
          member
            ? "Träningar, våra egna lopp, möten och resor – och löprundorna från Klubbflödet."
            : "Träningar, våra egna lopp, möten och resor. Prenumerera, så hamnar allt i din egen kalender."
        }
      >
        <div className="run-in mt-1 flex flex-wrap gap-3" style={{ "--i": 3 } as CSSProperties}>
          <a href="/kalender.ics" className="btn btn-primary btn-lg flex-1 sm:flex-none">
            <IconCalendar size={20} />
            Prenumerera (iCal)
          </a>
          <CopyIcsLink className="btn btn-outline-light btn-lg flex-1 sm:flex-none" />
        </div>
      </PageHero>

      <CalendarView
        events={upcoming}
        today={today}
        member={member}
        me={user?.id ?? null}
        aside={
          <>
            <section className="card flex flex-col gap-2.5 p-5" data-reveal="right">
              <h2 className="m-0 flex items-center gap-2.5 text-[19px] font-extrabold">
                <IconCalendar size={20} className="text-orange-dark" />
                Prenumerera
              </h2>
              <p className="m-0 text-[15px] text-muted">
                Kopiera kalenderlänken och lägg till den i Google Kalender, Outlook eller Kalender på mobilen – då
                uppdateras den av sig själv.
              </p>
              <p className="m-0 text-[13px] text-muted">
                Prenumerationen innehåller det som är öppet för alla, inte medlemmarnas löprundor.
              </p>
            </section>
            {member ? (
              <section
                className="straighten-hover stripes-drift relative flex rotate-1 flex-col gap-2.5 overflow-hidden rounded bg-orange px-5 py-6 text-ink shadow-[0_10px_22px_rgba(168,84,0,0.25)]"
                data-reveal="right"
                style={{ "--reveal-i": 1 } as CSSProperties}
              >
                <h2 className="m-0 flex items-center gap-2.5 text-[19px] font-extrabold">
                  <IconPeople size={20} />
                  Löprundor från flödet
                </h2>
                <p className="m-0 text-[15px]">
                  När någon lägger upp en löprunda i Klubbflödet hamnar den här, med vilka som hänger med.
                </p>
                <Link href="/flodet" className="btn btn-dark self-start">
                  Lägg upp en löprunda
                </Link>
              </section>
            ) : (
              <section
                className="card flex flex-col gap-2.5 p-5"
                data-reveal="right"
                style={{ "--reveal-i": 1 } as CSSProperties}
              >
                <h2 className="m-0 text-[19px] font-extrabold">Medlem?</h2>
                <p className="m-0 text-[15px] text-muted">
                  Logga in för att se medlemmarnas löprundor, styrelsemöten och resor i kalendern.
                </p>
                <ArrowLink href="/logga-in?next=/kalender">Logga in</ArrowLink>
              </section>
            )}
          </>
        }
      />
    </Page>
  );
}
