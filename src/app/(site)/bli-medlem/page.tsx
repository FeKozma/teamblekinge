import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconInfo, IconRunner } from "@/components/icons";
import { CopyButton } from "@/components/public/CopyButton";
import { IconBus, IconShield, IconTicket } from "@/components/public/icons";
import { Band, BandHeading, wrap } from "@/components/public/layout";
import { MembershipForm, type MembershipFormTexts } from "@/components/public/MembershipForm";
import { RelaySteps } from "@/components/public/RelaySteps";
import { ArrowLink, Page, PageHero, SectionHeading } from "@/components/ui";
import { getClub } from "@/lib/content/club";
import { getPageTexts } from "@/lib/content/pages";
import type { Club } from "@/lib/data/club";
import { paragraphs } from "@/lib/data/pages";

type Texts = Awaited<ReturnType<typeof getPageTexts>>;

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClub();
  return {
    title: "Bli medlem",
    description: `Medlemskapet i ${club.shortName} kostar ${club.fee} kr för hela ${club.feeYear}. Prova på upp till tre pass, ansök, betala – välkommen!`,
  };
}

export default async function JoinPage() {
  const [club, t] = await Promise.all([getClub(), getPageTexts("bli-medlem")]);
  return (
    <Page>
      <PageHero
        kicker={`${club.fee} kr ${t("hero.kicker")} ${club.feeYear}`}
        title={
          <>
            {t("hero.titleStart")}{" "}
            <span className="tilt-pop inline-block -rotate-3 text-orange">{t("hero.titleAccent")}</span>
          </>
        }
        intro={`${t("hero.introBeforeYear")} ${club.feeYear} ${t("hero.introBeforeFee")} ${club.fee} kr ${t("hero.introAfterFee")}`}
      >
        <div className="run-in mt-2 flex flex-wrap gap-3" style={{ "--i": 3 } as CSSProperties}>
          <a href="#ansok" className="btn btn-primary btn-lg flex-1 sm:flex-none">
            {t("hero.apply")}
          </a>
          <Link href="/trana-med-oss#prova-pa" className="btn btn-outline-light btn-lg flex-1 sm:flex-none">
            {t("hero.tryFirst")}
          </Link>
        </div>
      </PageHero>
      <Steps club={club} t={t} />
      <Included club={club} t={t} />
      <Apply club={club} t={t} />
    </Page>
  );
}

function Steps({ club, t }: { club: Club; t: Texts }) {
  const tryLink = t("steps.1.link");
  return (
    <section id="sa-gar-det-till" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-6 pb-16`}>
      <SectionHeading sub={t("steps.sub") || undefined}>{t("steps.heading")}</SectionHeading>
      <RelaySteps
        legLabel={t("steps.leg")}
        steps={[
          {
            title: t("steps.1.title"),
            text: (
              <>
                {t("steps.1.text")}
                {tryLink && (
                  <>
                    {" "}
                    <Link href="/trana-med-oss#prova-pa" className="font-semibold">
                      {tryLink}
                    </Link>
                  </>
                )}
              </>
            ),
          },
          {
            title: t("steps.2.title"),
            text: (
              <>
                {t("steps.2.before")}{" "}
                <a href="#ansok" className="font-semibold">
                  {t("steps.2.link")}
                </a>{" "}
                {t("steps.2.after")}
              </>
            ),
          },
          {
            title: `${t("steps.3.title")} ${club.fee} kr`,
            text: (
              <>
                {t("steps.3.beforeSwish")} <strong className="whitespace-nowrap text-ink">{club.swish}</strong>{" "}
                {t("steps.3.beforeBankgiro")} <strong className="whitespace-nowrap text-ink">{club.bankgiro}</strong>.
              </>
            ),
          },
          {
            title: t("steps.4.title"),
            text: t("steps.4.text"),
          },
        ]}
      />
    </section>
  );
}

const perkIcons = [IconShield, IconRunner, IconTicket, IconBus];

function Included({ club, t }: { club: Club; t: Texts }) {
  const perks = perkIcons.map((Icon, i) => ({
    Icon,
    title: t(`included.${i + 1}.title`),
    text: t(`included.${i + 1}.text`),
  }));
  const thursdayLink = t("included.thursday.link");
  const rests = ["-1.5deg", "1deg", "-0.5deg", "1.5deg"];
  return (
    <Band id="det-har-ingar" labelledBy="ingar-rubrik" className="scroll-mt-4">
      <div className="flex flex-col gap-10">
        <BandHeading
          id="ingar-rubrik"
          sub={`${club.fee} kr ${t("included.subMiddle")} ${club.feeYear} ${t("included.subEnd")}`}
        >
          {t("included.heading")}
        </BandHeading>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5 p-0">
          {perks.map(({ Icon, title, text }, i) => (
            <li
              key={i}
              data-settle
              style={{ "--rest-rotate": rests[i], "--reveal-i": i } as CSSProperties}
              className="straighten-hover flex flex-col gap-2 rounded-md bg-white p-5 text-ink shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange text-ink [transform:skewX(-8deg)]">
                <Icon size={24} />
              </span>
              <h3 className="m-0 text-[19px] font-extrabold">{title}</h3>
              <p className="m-0 text-[15px] text-muted">{text}</p>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          <div className="flex gap-3 rounded-md bg-ink-3 p-5 ring-1 ring-ink-2" data-reveal="up">
            <IconInfo size={22} className="mt-0.5 flex-none text-orange" />
            <p className="m-0 text-[16px] text-mist">
              <strong className="text-white">{t("included.member.lead")}</strong> {t("included.member.text")}
            </p>
          </div>
          <div className="flex gap-3 rounded-md bg-ink-3 p-5 ring-1 ring-ink-2" data-reveal="up" style={{ "--reveal-i": 1 } as CSSProperties}>
            <IconInfo size={22} className="mt-0.5 flex-none text-orange" />
            <p className="m-0 text-[16px] text-mist">
              <strong className="text-white">{t("included.thursday.lead")}</strong> {t("included.thursday.beforeFee")}{" "}
              {club.fee} kr {t("included.thursday.afterFee")}
              {thursdayLink && (
                <>
                  {" "}
                  <Link href="/trana-med-oss#torsdagsgruppen" className="font-semibold text-orange hover:text-orange">
                    {thursdayLink}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </Band>
  );
}

function Apply({ club, t }: { club: Club; t: Texts }) {
  return (
    <section id="ansok" className={`${wrap} flex scroll-mt-4 flex-wrap items-start gap-x-10 gap-y-10 pt-6 pb-28`}>
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
        <SectionHeading>{t("apply.heading")}</SectionHeading>
        {paragraphs(t("apply.text")).map((p, i) => (
          <p key={i} className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 + i } as CSSProperties}>
            {p}
          </p>
        ))}
        <div
          data-settle
          style={{ "--rest-rotate": "-1.5deg" } as CSSProperties}
          className="straighten-hover stripes-drift flex flex-col gap-3 rounded-md bg-orange p-5 text-ink shadow-[0_12px_26px_rgba(168,84,0,0.3)]"
        >
          <h3 className="m-0 text-[19px] font-extrabold">
            {t("apply.payHeading")} {club.fee} kr
          </h3>
          <dl className="m-0 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
              <dt className="text-[13px] font-extrabold tracking-[0.5px] uppercase">{t("apply.swish")}</dt>
              <dd className="m-0 flex items-center gap-2">
                <span className="text-[18px] font-extrabold tabular-nums">{club.swish}</span>
                <CopyButton value={club.swish} label="Swishnumret" />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
              <dt className="text-[13px] font-extrabold tracking-[0.5px] uppercase">{t("apply.bankgiro")}</dt>
              <dd className="m-0 flex items-center gap-2">
                <span className="text-[18px] font-extrabold tabular-nums">{club.bankgiro}</span>
                <CopyButton value={club.bankgiro} label="Bankgironumret" />
              </dd>
            </div>
          </dl>
          <p className="m-0 text-[14px]">{t("apply.payNote")}</p>
        </div>
        <ArrowLink href="/fragor" className="self-start">
          {t("apply.faqLink")}
        </ArrowLink>
      </div>

      <div
        className="card min-w-0 flex-[2_1_440px] p-5 shadow-[0_16px_34px_-18px_rgba(34,30,31,0.4)] md:p-7"
        data-reveal="right"
      >
        <h3 className="m-0 mb-5 text-[22px] font-extrabold">{t("apply.formHeading")}</h3>
        <MembershipForm
          fee={club.fee}
          swish={club.swish}
          bankgiro={club.bankgiro}
          texts={membershipFormTexts(t)}
        />
      </div>
    </section>
  );
}

/** The form's texts, read here because client components can't read the store. */
function membershipFormTexts(t: Texts): MembershipFormTexts {
  const group = (id: string) => ({ label: t(`form.group.${id}`), hint: t(`form.group.${id}Hint`) });
  return {
    name: t("form.name"),
    email: t("form.email"),
    emailExample: t("form.emailExample"),
    phone: t("form.phone"),
    optional: t("form.optional"),
    groupQuestion: t("form.groupQuestion"),
    groups: {
      langa: group("langa"),
      korta: group("korta"),
      halsa: group("halsa"),
      torsdag: group("torsdag"),
      "vet-ej": group("unsure"),
    },
    submit: t("form.submit"),
    thanks: t("thanks.heading"),
    thanksBeforeFee: t("thanks.beforeFee"),
    thanksBeforeSwish: t("thanks.beforeSwish"),
    thanksBeforeBankgiro: t("thanks.beforeBankgiro"),
    thanksThursday: t("thanks.thursday"),
    planButton: t("thanks.planButton"),
    again: t("thanks.again"),
  };
}
