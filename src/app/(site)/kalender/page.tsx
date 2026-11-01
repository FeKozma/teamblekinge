import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CopyIcsLink } from "@/components/calendar/CopyIcsLink";
import { IconCalendar, IconPeople, IconPlus } from "@/components/icons";
import { ArrowLink, Page, PageHero } from "@/components/ui";
import { getEvents } from "@/lib/content/events";
import { getPageTexts } from "@/lib/content/pages";
import { isPublicEvent } from "@/lib/data/events";
import { paragraphs } from "@/lib/data/pages";
import { todayISO } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Kalender" };

// No drawup for this page — built in the same language as the rest: dark
// slanted hero, a two-week strip that overlaps its edge, then the agenda.
export default async function KalenderPage() {
  const [user, events, t] = await Promise.all([getSession(), getEvents({ cancelled: true }), getPageTexts("kalender")]);
  const member = !!user;
  const board = user?.role === "board";
  const today = todayISO();
  const upcoming = events.filter((e) => e.date >= today && (member || isPublicEvent(e)));

  return (
    <Page>
      <PageHero
        kicker={t("hero.kicker")}
        title={
          <>
            {t("hero.title")}
            {t("hero.titleAccent") && (
              <>
                {" "}
                <span className="tilt-pop inline-block translate-y-0.5 -rotate-2 text-orange">
                  {t("hero.titleAccent")}
                </span>
              </>
            )}
          </>
        }
        intro={member ? t("hero.introMember") : t("hero.introGuest")}
      >
        <div className="run-in mt-1 flex flex-wrap gap-3" style={{ "--i": 3 } as CSSProperties}>
          {board && (
            <Link href="/admin/kalender/ny" className="btn btn-primary btn-lg flex-1 sm:flex-none">
              <IconPlus size={20} />
              Lägg in i kalendern
            </Link>
          )}
          <a href="/kalender.ics" className={`btn btn-lg flex-1 sm:flex-none ${board ? "btn-outline-light" : "btn-primary"}`}>
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
        editable={board}
        aside={
          <>
            <section className="card flex flex-col gap-2.5 p-5" data-reveal="right">
              <h2 className="m-0 flex items-center gap-2.5 text-[19px] font-extrabold">
                <IconCalendar size={20} className="text-orange-dark" />
                {t("subscribe.heading")}
              </h2>
              {paragraphs(t("subscribe.text")).map((p) => (
                <p key={p} className="m-0 text-[15px] text-muted">
                  {p}
                </p>
              ))}
              <p className="m-0 text-[13px] text-muted">{t("subscribe.note")}</p>
            </section>
            {member ? (
              <section
                className="straighten-hover stripes-drift relative flex rotate-1 flex-col gap-2.5 overflow-hidden rounded bg-orange px-5 py-6 text-ink shadow-[0_10px_22px_rgba(168,84,0,0.25)]"
                data-reveal="right"
                style={{ "--reveal-i": 1 } as CSSProperties}
              >
                <h2 className="m-0 flex items-center gap-2.5 text-[19px] font-extrabold">
                  <IconPeople size={20} />
                  {t("members.heading")}
                </h2>
                {paragraphs(t("members.text")).map((p) => (
                  <p key={p} className="m-0 text-[15px]">
                    {p}
                  </p>
                ))}
                <Link href="/flodet" className="btn btn-dark self-start">
                  {t("members.button")}
                </Link>
              </section>
            ) : (
              <section
                className="card flex flex-col gap-2.5 p-5"
                data-reveal="right"
                style={{ "--reveal-i": 1 } as CSSProperties}
              >
                <h2 className="m-0 text-[19px] font-extrabold">{t("guests.heading")}</h2>
                {paragraphs(t("guests.text")).map((p) => (
                  <p key={p} className="m-0 text-[15px] text-muted">
                    {p}
                  </p>
                ))}
                <ArrowLink href="/logga-in?next=/kalender">Logga in</ArrowLink>
              </section>
            )}
          </>
        }
      />
    </Page>
  );
}
