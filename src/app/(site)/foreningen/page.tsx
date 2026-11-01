import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconFacebook, IconFile, IconInstagram, IconMapPin, IconPeople, IconRunner } from "@/components/icons";
import { Band, BandHeading, JumpNav, initials, wrap } from "@/components/public/layout";
import { IconExternal, IconShield, IconShirt } from "@/components/public/icons";
import { ArrowLink, Page, PageHero, Pill, SectionHeading } from "@/components/ui";
import { getBoard, getClub, getHistory, getOtherRoles } from "@/lib/content/club";
import { getPageTexts } from "@/lib/content/pages";
import type { BoardMember, Club, Milestone, RoleGroup } from "@/lib/data/club";
import { paragraphs } from "@/lib/data/pages";

type Texts = Awaited<ReturnType<typeof getPageTexts>>;

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClub();
  return {
    title: "Föreningen",
    description: `${club.name} bildades ${club.founded} och har ${club.members} medlemmar. Styrelse, klubbkläder, policys och föreningsuppgifter.`,
  };
}

const tones = ["bg-ink text-white", "bg-orange text-ink", "bg-purple text-white"];

export default async function ClubPage() {
  const [club, board, roles, history, t] = await Promise.all([
    getClub(),
    getBoard(),
    getOtherRoles(),
    getHistory(),
    getPageTexts("foreningen"),
  ]);
  const titleEnd = t("hero.titleEnd");
  return (
    <Page>
      <PageHero
        kicker={`${t("hero.kicker")} ${club.foundedYear}`}
        title={
          <>
            {t("hero.titleStart")}{" "}
            <span className="tilt-pop inline-block -rotate-3 text-orange">{t("hero.titleAccent")}</span>
            {titleEnd && ` ${titleEnd}`}
          </>
        }
        intro={`${club.name} ${t("hero.introBeforeMembers")} ${club.members} ${t("hero.introBeforeAddress")} ${club.address.street} i ${club.address.area}, ${club.address.city}.`}
      >
        <JumpNav
          links={[
            { href: "#historia", label: t("nav.history") },
            { href: "#styrelsen", label: t("nav.board") },
            { href: "#klubbklader", label: t("nav.kit") },
            { href: "#policys", label: t("nav.policies") },
            { href: "#foreningsuppgifter", label: t("nav.facts") },
          ]}
        />
      </PageHero>
      <Stats club={club} t={t} />
      <Timeline club={club} history={history} t={t} />
      <Board club={club} board={board} roles={roles} t={t} />
      <ClubKit club={club} t={t} />
      <PoliciesAndInfo club={club} roles={roles} t={t} />
    </Page>
  );
}

function Stats({ club, t }: { club: Club; t: Texts }) {
  const stats = [
    { big: String(club.foundedYear), small: t("stats.foundedText"), rest: "-2deg" },
    { big: club.members, small: t("stats.membersText"), rest: "1.5deg" },
    { big: t("stats.trainingBig"), small: `${t("stats.trainingText")} ${club.address.area}`, rest: "-1deg" },
  ];
  return (
    <div className={`${wrap} pt-6 pb-10`}>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 p-0">
        {stats.map((s, i) => (
          <li
            key={i}
            data-settle
            style={{ "--rest-rotate": s.rest, "--reveal-i": i } as CSSProperties}
            className="straighten-hover card flex flex-col gap-1 p-5 shadow-[0_10px_22px_-12px_rgba(34,30,31,0.3)]"
          >
            <span className="text-[38px] leading-none font-extrabold tracking-[-1px] text-orange-dark">{s.big}</span>
            <span className="text-[15px] text-muted">{s.small}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Timeline({ club, history, t }: { club: Club; history: Milestone[]; t: Texts }) {
  return (
    <section id="historia" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-6 pb-20`}>
      <SectionHeading sub={`${t("history.subBeforeMembers")} ${club.members} ${t("history.subAfterMembers")}`}>
        {t("history.heading")}
      </SectionHeading>

      <div className="tl-track relative" data-reveal="up">
        {/* The track: three lanes, the middle one fills orange as you scroll */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[18px] w-9 -translate-x-1/2 rounded-full bg-ink md:left-1/2 md:w-12"
        >
          <span className="absolute inset-y-3 left-1/3 border-l-2 border-dashed border-white/25" />
          <span className="absolute inset-y-3 left-2/3 border-l-2 border-dashed border-white/25" />
          <span className="tl-fill grow-y absolute inset-y-0 left-1/3 w-1/3 rounded-full bg-orange" />
          <span className="tl-runner absolute left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
            <span className="stride flex h-10 w-10 items-center justify-center rounded-full bg-orange text-ink shadow-[0_6px_14px_rgba(0,0,0,0.35)] ring-4 ring-paper">
              <IconRunner size={22} strokeWidth={2.4} />
            </span>
          </span>
        </div>

        <ol className="relative m-0 flex list-none flex-col gap-10 p-0 py-6 md:gap-4">
          {history.map((m, i) => {
            const right = i % 2 === 1;
            return (
              <li key={i} className="relative pl-14 md:grid md:grid-cols-2 md:gap-x-24 md:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-[18px] z-[2] -translate-x-1/2 bg-white px-1.5 py-0.5 text-[13px] font-extrabold text-ink shadow-[0_3px_8px_rgba(0,0,0,0.25)] md:left-1/2 md:px-2.5 md:text-[15px]"
                  style={{ rotate: right ? "4deg" : "-4deg" }}
                >
                  {m.mark}
                </span>
                <div data-reveal={right ? "right" : ""} className={right ? "md:col-start-2" : "md:col-start-1"}>
                  <article
                    className={`straighten-hover flex flex-col gap-1.5 rounded-md p-5 ${
                      m.planned
                        ? "border-2 border-dashed border-purple/50 bg-purple-soft"
                        : "card shadow-[0_10px_24px_-14px_rgba(34,30,31,0.35)]"
                    } ${right ? "md:[rotate:1deg]" : "md:text-right md:[rotate:-1deg]"}`}
                  >
                    <span
                      className={`flex items-center gap-2 text-[13px] font-extrabold tracking-[0.5px] uppercase ${
                        m.planned ? "text-purple" : "text-orange-dark"
                      } ${right ? "" : "md:justify-end"}`}
                    >
                      {m.when}
                      {m.planned && <Pill tone="purple">{t("history.planned")}</Pill>}
                    </span>
                    <h3 className="m-0 text-[20px] leading-tight font-extrabold">{m.title}</h3>
                    <p className="m-0 text-[15px] text-muted">{m.text}</p>
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Board({ club, board, roles, t }: { club: Club; board: BoardMember[]; roles: RoleGroup[]; t: Texts }) {
  return (
    <Band id="styrelsen" labelledBy="styrelsen-rubrik" className="scroll-mt-4">
      <div className="flex flex-col gap-10">
        <BandHeading
          id="styrelsen-rubrik"
          sub={`${t("board.subYear")} ${club.feeYear}. ${t("board.subContact")} ${club.contact.name}.`}
        >
          {t("board.heading")}
        </BandHeading>

        {board.length > 0 && (
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 p-0">
            {board.map((p, i) => (
              <li
                key={i}
                data-settle
                style={{ "--rest-rotate": `${[-1.5, 1, -0.5, 1.5, -1, 0.5, -1.2][i % 7]}deg`, "--reveal-i": i % 4 } as CSSProperties}
                className={`straighten-hover flex items-center gap-4 rounded-md bg-white p-4 text-ink shadow-[0_14px_30px_rgba(0,0,0,0.35)] ${
                  i === 0 ? "ring-4 ring-orange" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-14 w-14 flex-none items-center justify-center rounded-full text-[19px] font-extrabold ${tones[i % 3]}`}
                >
                  {initials(p.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[17px] leading-tight font-extrabold">{p.name}</span>
                  <span className="text-[14px] font-semibold text-muted">{p.role}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {roles.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="m-0 text-[20px] font-extrabold" data-reveal>
              {t("board.rolesHeading")}
            </h3>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-0">
              {roles.map((r, i) => (
                <li
                  key={i}
                  data-reveal="up"
                  style={{ "--reveal-i": i } as CSSProperties}
                  className="flex flex-col gap-2.5 rounded-md bg-ink-3 p-4 ring-1 ring-ink-2"
                >
                  <span className="flex items-center gap-2 text-[13px] font-extrabold tracking-[0.5px] text-orange uppercase">
                    <IconPeople size={18} />
                    {r.title}
                  </span>
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {r.names.map((n, j) => (
                      <li key={j} className="flex items-center gap-2 rounded-full bg-ink py-1 pr-3 pl-1 text-[14px] font-semibold">
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-[11px] font-extrabold text-ink"
                        >
                          {initials(n)}
                        </span>
                        {n}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Band>
  );
}

function ClubKit({ club, t }: { club: Club; t: Texts }) {
  const text = paragraphs(t("kit.text"));
  const note = t("kit.note");
  return (
    <section id="klubbklader" className={`${wrap} flex scroll-mt-4 flex-wrap items-center gap-x-12 gap-y-8 pt-8 pb-16`}>
      <div className="group relative min-w-0 flex-[1_1_420px]" data-reveal>
        <div className="relative -rotate-2">
          <span aria-hidden="true" className="absolute top-3 -right-3 -bottom-3 left-3 bg-orange" />
          <Image
            src="/img/klubbklader-trimtex.jpg"
            alt={t("kit.imageAlt")}
            width={1200}
            height={367}
            sizes="(min-width: 768px) 600px, 100vw"
            className="diag-img relative block h-[180px] w-full object-cover object-[30%_50%] md:h-[240px]"
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
        <SectionHeading>{t("kit.heading")}</SectionHeading>
        {text.map((p, i) => (
          <p key={i} className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 + i } as CSSProperties}>
            {p}
          </p>
        ))}
        {note && (
          <p
            className="m-0 flex items-start gap-2 text-[15px] text-muted"
            data-reveal
            style={{ "--reveal-i": 1 + text.length } as CSSProperties}
          >
            <IconShirt size={20} className="mt-0.5 flex-none text-purple" />
            {note}
          </p>
        )}
        <a
          href={club.trimtexShop}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-dark self-start"
          data-reveal
          style={{ "--reveal-i": 2 + text.length } as CSSProperties}
        >
          {t("kit.button")} <IconExternal size={16} />
          <span className="sr-only">(öppnas i ny flik)</span>
        </a>
      </div>
    </section>
  );
}

function PoliciesAndInfo({ club, roles, t }: { club: Club; roles: RoleGroup[]; t: Texts }) {
  // Who answers for anti-doping is a role on the board page, not a fixed name.
  const antidoping = roles.find((r) => /antidoping/i.test(r.title) && r.names.length);
  const policies = [
    { title: t("policies.drugs") },
    { title: t("policies.equality") },
    { title: t("policies.antidoping"), text: antidoping && `${antidoping.title}: ${antidoping.names.join(", ")}` },
  ];
  const facebookName = t("facts.facebookName");
  return (
    <section className={`${wrap} flex flex-wrap items-start gap-x-10 gap-y-12 pt-4 pb-28`}>
      <div id="policys" className="flex min-w-0 flex-[2_1_440px] scroll-mt-4 flex-col gap-5">
        <SectionHeading tone="purple" sub={t("policies.sub") || undefined}>
          {t("policies.heading")}
        </SectionHeading>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-0">
          {policies.map((p, i) => (
            <li key={i} data-reveal="up" style={{ "--reveal-i": i } as CSSProperties}>
              <Link
                href="/dokument"
                className="lean-hover card flex h-full flex-col gap-2 p-4 text-ink no-underline hover:text-ink"
              >
                <span className="flex items-center gap-2 text-[17px] font-extrabold">
                  {i === 2 ? (
                    <IconShield size={20} className="flex-none text-purple" />
                  ) : (
                    <IconFile size={20} className="flex-none text-purple" />
                  )}
                  {p.title}
                </span>
                {p.text && <span className="text-[14px] text-muted">{p.text}</span>}
                <span className="mt-auto text-[14px] font-semibold text-orange-dark">{t("policies.link")} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div id="foreningsuppgifter" className="flex min-w-0 flex-[1_1_300px] scroll-mt-4 flex-col gap-5">
        <SectionHeading tone="ink">{t("facts.heading")}</SectionHeading>
        <div
          data-settle
          style={{ "--rest-rotate": "1deg" } as CSSProperties}
          className="card flex flex-col gap-4 p-5"
        >
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
            <dt className="text-muted">{t("facts.name")}</dt>
            <dd className="m-0 font-semibold">{club.name}</dd>
            <dt className="text-muted">{t("facts.founded")}</dt>
            <dd className="m-0 font-semibold">{club.founded}</dd>
            <dt className="text-muted">{t("facts.orgNr")}</dt>
            <dd className="m-0 font-semibold tabular-nums">{club.orgNr}</dd>
            <dt className="text-muted">{t("facts.foreningsNr")}</dt>
            <dd className="m-0 font-semibold tabular-nums">{club.foreningsNr}</dd>
          </dl>
          <p className="m-0 flex items-start gap-2 border-t border-line pt-3 text-[15px]">
            <IconMapPin size={20} className="mt-0.5 flex-none text-orange-dark" />
            <span>
              {t("facts.place")}, {club.address.street}
              <br />
              {club.address.zip} {club.address.city} ({club.address.area})
            </span>
          </p>
          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            <a href={club.instagram} className="btn btn-outline min-h-10 px-3 text-[14px]">
              <IconInstagram size={18} /> {t("facts.instagram")}
            </a>
            <a href={club.facebookGroup} className="btn btn-outline min-h-10 px-3 text-[14px]">
              <IconFacebook size={18} /> {t("facts.facebook")}
              {facebookName && <span className="sr-only">{facebookName}</span>}
            </a>
          </div>
          <ArrowLink href="/fragor#kontakt">{t("facts.contact")}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
