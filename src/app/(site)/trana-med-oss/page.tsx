import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconCheck, IconClock, IconMapPin, IconRunner } from "@/components/icons";
import { Band, BandHeading, DemoNote, JumpNav, mapsUrl, wrap } from "@/components/public/layout";
import { paragraphs } from "@/lib/data/pages";
import { IconCoffee, IconExternal } from "@/components/public/icons";
import { LongRunTrack } from "@/components/public/LongRunTrack";
import { ParkingSketch } from "@/components/public/ParkingSketch";
import { around, withLinks } from "@/components/public/text";
import { ArrowLink, DateBadge, Page, PageHero, Pill, SectionHeading } from "@/components/ui";
import { getClub, getOtherRoles } from "@/lib/content/club";
import { getEvents } from "@/lib/content/events";
import { getPageTexts } from "@/lib/content/pages";
import { getLongRuns, getTermPlan, getTrainingGroups } from "@/lib/content/training";
import type { Club } from "@/lib/data/club";
import type { LongRun, TermPlan as Plan, TrainingGroup } from "@/lib/data/training";
import { longDate, todayISO } from "@/lib/format";

type Texts = (key: string) => string;

export async function generateMetadata(): Promise<Metadata> {
  const [club, t] = await Promise.all([getClub(), getPageTexts("trana-med-oss")]);
  return {
    title: "Träna med oss",
    description: `${t("hero.introBefore")} ${streetInArea(club)} ${t("hero.introAfter")}`.replace(/ ([,.])/g, "$1").trim(),
  };
}

/** "Tennvägen 11 A i Torskors" */
const streetInArea = (club: Club) => `${club.address.street} i ${club.address.area}`;
const fullAddress = (club: Club) => `${club.address.street}, ${club.address.zip} ${club.address.city}`;

const toneTop = { ink: "bg-ink", orange: "bg-orange", purple: "bg-purple" } as const;

export default async function TrainWithUsPage() {
  const today = todayISO();
  const [club, roles, groups, plan, runs, t] = await Promise.all([
    getClub(),
    getOtherRoles(),
    getTrainingGroups(),
    getTermPlan(),
    getLongRuns(),
    getPageTexts("trana-med-oss"),
  ]);
  const accent = t("hero.titleAccent");
  // The board may rename the role ("Torsdagsgruppen 2027"); match on the word.
  const thursdayContact = roles.find((r) => /torsdagsgrupp/i.test(r.title))?.names.join(", ");
  return (
    <Page>
      <PageHero
        kicker={`${t("hero.kicker")} · ${club.address.area}, ${club.address.city}`}
        title={
          <>
            {t("hero.title")}
            {accent && (
              <>
                {" "}
                <span className="tilt-pop inline-block -rotate-3 text-orange">{accent}</span>
              </>
            )}
          </>
        }
        intro={around(t("hero.introBefore"), streetInArea(club), t("hero.introAfter"))}
      >
        <JumpNav
          links={[
            { href: "#grupper", label: t("jump.groups") },
            { href: "#halsagruppen", label: t("jump.health") },
            { href: "#terminsplan", label: t("jump.plan") },
            { href: "#prova-pa", label: t("jump.try") },
            { href: "#langpass", label: t("jump.longRuns") },
            { href: "#torsdagsgruppen", label: t("jump.thursday") },
            { href: "#parkering", label: t("jump.parking") },
          ]}
        />
      </PageHero>
      <Groups groups={groups} club={club} t={t} />
      <HealthGroup group={groups.find((g) => g.id === "halsa")} club={club} t={t} />
      <TermPlan today={today} termPlan={plan} groups={groups} t={t} />
      <TryItOut club={club} t={t} />
      <LongRuns today={today} runs={runs} t={t} />
      <ThursdayGroup today={today} club={club} contact={thursdayContact} t={t} />
      <Parking club={club} t={t} />
    </Page>
  );
}

function Groups({ groups, club, t }: { groups: TrainingGroup[]; club: Club; t: Texts }) {
  const rests = ["-1deg", "0.8deg", "-0.6deg"];
  return (
    <section id="grupper" className={`${wrap} flex scroll-mt-4 flex-col gap-6 pt-8 pb-16`}>
      <SectionHeading sub={around(t("groups.subBefore"), club.address.street, t("groups.subAfter"))}>
        {t("groups.heading")}
      </SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-6">
        {groups.map((g, i) => {
          return (
            <article
              key={g.id}
              data-settle
              style={{ "--rest-rotate": rests[i % rests.length], "--reveal-i": i } as CSSProperties}
              className="straighten-hover relative flex flex-col gap-3 overflow-hidden rounded-[4px_4px_12px_12px] border border-line bg-white p-5 pt-7 shadow-[0_10px_24px_rgba(34,30,31,0.10)]"
            >
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-2 ${toneTop[g.tone]}`} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Pill tone={g.tone}>{g.name}</Pill>
                <span className="text-[13px] font-extrabold tracking-[0.5px] text-muted uppercase">{g.distance}</span>
              </div>
              <h3 className="m-0 flex items-center gap-2 text-[26px] font-extrabold tracking-[-0.5px]">
                <IconClock size={22} className="text-orange-dark" />
                {t("groups.day")} {g.time}
              </h3>
              <p className="m-0 text-[16px]">{g.suits}</p>
              <ul className="m-0 flex list-none flex-col gap-1.5 border-t border-line p-0 pt-3 text-[15px] text-muted">
                {g.needs.map((n) => (
                  <li key={n} className="flex gap-2">
                    <IconCheck size={18} strokeWidth={2.6} className="mt-0.5 flex-none text-orange-dark" />
                    {n}
                  </li>
                ))}
              </ul>
              {g.id === "halsa" && (
                <ArrowLink href="#halsagruppen" className="mt-1">
                  {t("groups.healthLink")}
                </ArrowLink>
              )}
            </article>
          );
        })}
      </div>
      {t("groups.help") && (
        <p className="m-0 text-[15px] text-muted" data-reveal>
          {withLinks(t("groups.help"), [{ words: t("groups.helpLink"), href: "/fragor", className: "font-semibold" }])}
        </p>
      )}
    </section>
  );
}

function HealthGroup({ group, club, t }: { group?: TrainingGroup; club: Club; t: Texts }) {
  const [run, walk] = [t("health.rhythmRun"), t("health.rhythmWalk")];
  // One loop of the walk–run rhythm; rendered twice for a seamless marquee.
  const rhythm = [
    { kind: "run", label: run },
    { kind: "walk", label: walk },
    { kind: "run", label: run },
    { kind: "walk", label: walk },
    { kind: "other", label: t("health.rhythmStrength") },
    { kind: "run", label: run },
    { kind: "walk", label: walk },
    { kind: "other", label: t("health.rhythmBalance") },
  ];
  return (
    <Band tone="purple" id="halsagruppen" labelledBy="halsagruppen-rubrik" className="scroll-mt-4">
      <div className="flex flex-wrap items-center gap-x-14 gap-y-10">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <BandHeading id="halsagruppen-rubrik">{t("health.heading")}</BandHeading>
          <p
            className="m-0 max-w-[560px] text-[24px] leading-[1.25] font-extrabold md:text-[28px]"
            data-reveal
            style={{ "--reveal-i": 1 } as CSSProperties}
          >
            {t("health.quote")}
          </p>
          {paragraphs(t("health.text")).map((p, i) => (
            <p
              key={i}
              className="m-0 max-w-[560px] text-[17px] text-white/85"
              data-reveal
              style={{ "--reveal-i": 2 } as CSSProperties}
            >
              {p}
            </p>
          ))}
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0" data-reveal style={{ "--reveal-i": 3 } as CSSProperties}>
            {group && (
              <li className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 font-semibold">
                <IconClock size={18} className="text-orange" /> {t("health.when")} {group.time}
              </li>
            )}
            <li className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 font-semibold">
              <IconMapPin size={18} className="text-orange" /> {t("health.place")}, {club.address.street}
            </li>
          </ul>
          <Link href="#prova-pa" className="btn btn-primary self-start" data-reveal style={{ "--reveal-i": 4 } as CSSProperties}>
            {t("health.button")}
          </Link>
        </div>

        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-3" data-reveal="right">
          <div className="-rotate-2 rounded-xl bg-ink/35 p-4 ring-1 ring-white/15">
            <p className="m-0 mb-3 text-[13px] font-extrabold tracking-[1px] text-orange uppercase">
              {t("health.rhythmLabel")}
            </p>
            <div className="marquee overflow-hidden" aria-hidden="true">
              <ul className="marquee-track m-0 list-none gap-2 p-0" style={{ animationDuration: "18s" }}>
                {[...rhythm, ...rhythm].map((r, i) => (
                  <li
                    key={i}
                    className={`flex h-14 flex-none items-center gap-2 rounded-md px-4 text-[15px] font-extrabold [transform:skewX(-12deg)] ${
                      r.kind === "run"
                        ? "w-[132px] bg-orange text-ink"
                        : r.kind === "walk"
                          ? "w-[92px] bg-white/90 text-purple"
                          : "w-[112px] bg-purple-soft text-purple"
                    }`}
                  >
                    {r.kind === "run" && <IconRunner size={20} strokeWidth={2.4} />}
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
            <p className="m-0 mt-3 text-[15px] text-white/85">{t("health.rhythmText")}</p>
          </div>
        </div>
      </div>
    </Band>
  );
}

function TermPlan({
  today,
  termPlan,
  groups,
  t,
}: {
  today: string;
  termPlan: Plan;
  groups: TrainingGroup[];
  t: Texts;
}) {
  const upcoming = Object.entries(termPlan)
    .filter(([date]) => date >= today)
    .sort(([a], [b]) => a.localeCompare(b));
  const rests = ["-0.8deg", "0.6deg", "-0.4deg", "0.8deg"];
  return (
    <section id="terminsplan" className={`${wrap} flex scroll-mt-4 flex-col gap-6 pt-6 pb-16`}>
      <SectionHeading
        tone="ink"
        sub={t("plan.sub")}
        action={<DemoNote>Tränarna fyller i terminsplanen</DemoNote>}
      >
        {t("plan.heading")}
      </SectionHeading>
      {upcoming.length === 0 ? (
        <p className="card m-0 p-5 text-muted">{t("plan.empty")}</p>
      ) : (
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(270px,1fr))] items-start gap-5 p-0">
          {upcoming.map(([date, plan], i) => (
            <li
              key={date}
              data-settle
              style={{ "--rest-rotate": rests[i % rests.length], "--reveal-i": i } as CSSProperties}
              className={`straighten-hover card flex flex-col gap-3 p-5 ${i === 0 ? "border-orange shadow-[0_12px_26px_-10px_rgba(168,84,0,0.45)]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-lg ${i === 0 ? "live-dot" : ""}`}>
                  <DateBadge date={date} today={today} highlight={i === 0} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[17px] font-extrabold first-letter:uppercase">{longDate(date)}</span>
                  {i === 0 && <span className="text-[13px] font-bold text-orange-dark">{t("plan.next")}</span>}
                </span>
              </div>
              <dl className="m-0 flex flex-col gap-2.5">
                {groups
                  .filter((g) => plan[g.id])
                  .map((g) => (
                    <div key={g.id} className="flex flex-col gap-1 border-t border-line pt-2.5">
                      <dt className="flex items-center gap-2">
                        <Pill tone={g.tone}>{g.short}</Pill>
                        <span className="text-[13px] text-muted">{g.time}</span>
                      </dt>
                      <dd className="m-0 text-[15px] font-semibold">{plan[g.id]}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function TryItOut({ club, t }: { club: Club; t: Texts }) {
  const steps = [
    { title: t("try.step1Title"), text: t("try.step1Text") },
    { title: t("try.step2Title"), text: around("", `${streetInArea(club)}.`, t("try.step2Text")) },
    { title: t("try.step3Title"), text: t("try.step3Text") },
  ];
  const rests = ["-2deg", "1.5deg", "-1deg"];
  return (
    <Band tone="orange" id="prova-pa" labelledBy="prova-pa-rubrik" className="scroll-mt-4">
      <div className="flex flex-col gap-10">
        <BandHeading
          id="prova-pa-rubrik"
          bar="ink"
          subClassName="text-ink"
          sub={t("try.sub")}
        >
          {t("try.heading")}
        </BandHeading>

        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-start gap-6 p-0 md:gap-8">
          {steps.map((s, i) => (
            <li
              key={i}
              data-settle
              style={{ "--rest-rotate": rests[i], "--reveal-i": i } as CSSProperties}
              className="straighten-hover relative flex flex-col gap-2 rounded-md bg-white p-6 pt-5 shadow-[0_14px_28px_rgba(122,61,0,0.28)]"
            >
              <span
                aria-hidden="true"
                className="-mt-12 mb-1 self-start bg-ink px-3 text-[52px] leading-[1.15] font-extrabold text-orange [transform:skewX(-12deg)]"
              >
                {i + 1}
              </span>
              <h3 className="m-0 text-[21px] font-extrabold">
                <span className="sr-only">Steg {i + 1}: </span>
                {s.title}
              </h3>
              <p className="m-0 text-[16px] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4" data-reveal="up">
          <div className="flex gap-3 rounded-xl bg-ink p-5 text-white">
            <IconClock size={24} className="mt-0.5 flex-none text-orange" />
            <div>
              <h3 className="m-0 text-[17px] font-extrabold">{t("try.whenTitle")}</h3>
              <p className="m-0 mt-1 text-[15px] text-mist">{t("try.whenText")}</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl bg-ink p-5 text-white">
            <IconRunner size={24} className="mt-0.5 flex-none text-orange" />
            <div>
              <h3 className="m-0 text-[17px] font-extrabold">{t("try.bringTitle")}</h3>
              <p className="m-0 mt-1 text-[15px] text-mist">{t("try.bringText")}</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl bg-ink p-5 text-white">
            <IconCoffee size={24} className="mt-0.5 flex-none text-orange" />
            <div>
              <h3 className="m-0 text-[17px] font-extrabold">{t("try.afterTitle")}</h3>
              <p className="m-0 mt-1 text-[15px] text-mist">{t("try.afterText")}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3" data-reveal>
          <Link href="#parkering" className="btn btn-dark btn-lg">
            {t("try.findButton")}
          </Link>
          <Link href="/bli-medlem" className="btn btn-lg border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white">
            {t("try.joinButton")}
          </Link>
        </div>
      </div>
    </Band>
  );
}

function LongRuns({ today, runs, t }: { today: string; runs: LongRun[]; t: Texts }) {
  const sorted = [...runs].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <section id="langpass" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-6 pb-16`}>
      <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
          <SectionHeading sub={t("longRuns.sub")}>{t("longRuns.heading")}</SectionHeading>
          {paragraphs(t("longRuns.text")).map((p, i) => (
            <p key={i} className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
              {p}
            </p>
          ))}
          {t("longRuns.note") && (
            <p className="m-0 text-[15px] text-muted" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
              {withLinks(t("longRuns.note"), [{ words: t("longRuns.noteLink"), href: "/nyheter" }])}
            </p>
          )}
        </div>
        <div className="group relative min-w-0 flex-[1_1_320px]" data-reveal="right">
          <div className="relative rotate-2">
            <span aria-hidden="true" className="absolute top-3 -right-3 -bottom-3 left-3 rounded-sm bg-orange" />
            <Image
              src="/img/fika-i-solen.jpg"
              alt="Klubbmedlemmar fikar på en filt i solen efter ett långpass"
              width={900}
              height={675}
              sizes="(min-width: 768px) 440px, 100vw"
              className="diag-img relative block h-[220px] w-full object-cover md:h-[260px]"
            />
          </div>
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-[19px] font-extrabold">
            {t("longRuns.listHeading")} {sorted[0].date.slice(0, 4)}
          </h3>
          <LongRunTrack
            runs={sorted}
            today={today}
            texts={{ next: t("longRuns.next"), done: t("longRuns.done"), doneMore: t("longRuns.doneMore") }}
          />
        </div>
      )}
    </section>
  );
}

async function ThursdayGroup({ today, club, contact, t }: { today: string; club: Club; contact?: string; t: Texts }) {
  const thursdays = (await getEvents()).filter((e) => e.id.startsWith("torsdagsgruppen-") && e.date >= today).slice(0, 3);
  return (
    <section id="torsdagsgruppen" className="scroll-mt-4 bg-white py-16">
      <div className={`${wrap} flex flex-wrap items-center gap-x-14 gap-y-10`}>
        <div
          data-settle
          style={{ "--rest-rotate": "-2deg" } as CSSProperties}
          className="straighten-hover relative flex min-w-0 flex-[1_1_300px] flex-col gap-2 overflow-hidden rounded-md bg-ink p-7 text-white shadow-[0_18px_34px_-12px_rgba(34,30,31,0.55)] md:max-w-[400px]"
        >
          <svg aria-hidden="true" viewBox="0 0 300 220" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <g stroke="#EE8915" strokeWidth="2" opacity="0.3">
              <path d="M180 220 L300 50" />
              <path d="M215 220 L300 100" />
              <path d="M250 220 L300 150" />
            </g>
          </svg>
          <span className="relative self-start bg-orange px-2.5 py-0.5 text-[12px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
            {t("thursday.badge")}
          </span>
          <span className="relative mt-2 text-[56px] leading-none font-extrabold tracking-[-2px]">
            {club.fee} kr
          </span>
          <span className="relative text-[17px] text-mist">{t("thursday.feeText")}</span>
        </div>

        <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-4">
          <SectionHeading tone="purple">{t("thursday.heading")}</SectionHeading>
          <p className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
            {around(t("thursday.textBefore"), club.address.street, t("thursday.textAfter"))}
          </p>
          <p className="m-0 text-[15px] text-muted" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
            {contact && (
              <>
                {t("thursday.contact")} <strong className="text-ink">{contact}</strong> ·{" "}
              </>
            )}
            <Link href="/fragor#kontakt">{t("thursday.contactLink")}</Link>
          </p>
          {thursdays.length > 0 && (
            <div className="flex flex-col gap-2" data-reveal style={{ "--reveal-i": 3 } as CSSProperties}>
              <span className="text-[13px] font-extrabold tracking-[0.5px] text-muted uppercase">{t("thursday.next")}</span>
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {thursdays.map((e, i) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-paper py-1.5 pr-4 pl-1.5"
                    style={{ rotate: i % 2 ? "1deg" : "-1deg" }}
                  >
                    <DateBadge date={e.date} today={today} size={42} />
                    <span className="text-[14px] font-semibold">kl. {e.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Parking({ club, t }: { club: Club; t: Texts }) {
  return (
    <section id="parkering" className={`${wrap} flex scroll-mt-4 flex-col gap-6 pt-16 pb-28`}>
      <SectionHeading>{t("parking.heading")}</SectionHeading>
      <div className="flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4" data-reveal>
          <div className="card flex flex-col gap-3 p-5">
            <span className="flex items-start gap-3">
              <IconMapPin size={24} className="mt-0.5 flex-none text-orange-dark" />
              <span className="flex flex-col">
                <strong className="text-[18px]">{t("parking.place")}</strong>
                <span>
                  {club.address.street}, {club.address.area}
                </span>
                <span>
                  {club.address.zip} {club.address.city}
                </span>
              </span>
            </span>
            <a
              href={mapsUrl(fullAddress(club))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark self-start"
            >
              {t("parking.mapButton")} <IconExternal size={16} />
              <span className="sr-only">(öppnas i ny flik)</span>
            </a>
          </div>
          <div className="card flex flex-col gap-3 p-5">
            <h3 className="m-0 text-[18px] font-extrabold">{t("parking.title")}</h3>
            <p className="m-0 text-[17px] font-semibold">{t("parking.text")}</p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
              <li className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-5 w-8 flex-none rounded border-2 border-green bg-green/20" />
                {t("parking.green")}
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-5 w-8 flex-none rounded border-2 border-[#B3261E] bg-[#B3261E]/15" />
                {t("parking.red")}
              </li>
            </ul>
          </div>
        </div>

        <figure
          className="m-0 flex min-w-0 flex-[2_1_420px] flex-col gap-2 lg:max-w-[620px]"
          data-settle
          style={{ "--rest-rotate": "1deg" } as CSSProperties}
        >
          <div className="overflow-hidden rounded-xl border border-line bg-white p-2 shadow-[0_12px_28px_-14px_rgba(34,30,31,0.4)]">
            <ParkingSketch street={club.address.street} place={t("parking.place")} />
          </div>
          {t("parking.caption") && <figcaption className="text-[14px] text-muted">{t("parking.caption")}</figcaption>}
        </figure>
      </div>
    </section>
  );
}
