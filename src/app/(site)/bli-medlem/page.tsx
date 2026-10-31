import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconInfo, IconRunner } from "@/components/icons";
import { CopyButton } from "@/components/public/CopyButton";
import { IconBus, IconShield, IconTicket } from "@/components/public/icons";
import { Band, BandHeading, wrap } from "@/components/public/layout";
import { MembershipForm } from "@/components/public/MembershipForm";
import { RelaySteps } from "@/components/public/RelaySteps";
import { ArrowLink, Page, PageHero, SectionHeading } from "@/components/ui";
import { club } from "@/lib/data/club";

export const metadata: Metadata = {
  title: "Bli medlem",
  description: `Medlemskapet i Team Blekinge kostar ${club.fee} kr för hela ${club.feeYear}. Prova på upp till tre pass, ansök, betala – välkommen!`,
};

export default function JoinPage() {
  return (
    <Page>
      <PageHero
        kicker={`${club.fee} kr för hela ${club.feeYear}`}
        title={
          <>
            Bli <span className="tilt-pop inline-block -rotate-3 text-orange">medlem</span>
          </>
        }
        intro={`Avgiften för ${club.feeYear} är ${club.fee} kr per person och gäller för hela året, oavsett när på året du betalar in den.`}
      >
        <div className="run-in mt-2 flex flex-wrap gap-3" style={{ "--i": 3 } as CSSProperties}>
          <a href="#ansok" className="btn btn-primary btn-lg flex-1 sm:flex-none">
            Ansök nu
          </a>
          <Link href="/trana-med-oss#prova-pa" className="btn btn-outline-light btn-lg flex-1 sm:flex-none">
            Prova på först
          </Link>
        </div>
      </PageHero>
      <Steps />
      <Included />
      <Apply />
    </Page>
  );
}

function Steps() {
  return (
    <section id="sa-gar-det-till" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-6 pb-16`}>
      <SectionHeading sub="Fyra sträckor – och stafettpinnen går vidare till dig.">Så går det till</SectionHeading>
      <RelaySteps
        steps={[
          {
            title: "Prova på",
            text: (
              <>
                Var med på upp till 3 träningspass. Du väljer själv vilka, intervall eller långdistans.{" "}
                <Link href="/trana-med-oss#prova-pa" className="font-semibold">
                  Så går det till
                </Link>
              </>
            ),
          },
          {
            title: "Ansök",
            text: (
              <>
                Fyll i{" "}
                <a href="#ansok" className="font-semibold">
                  ansökan
                </a>{" "}
                med namn och kontaktuppgifter.
              </>
            ),
          },
          {
            title: `Betala ${club.fee} kr`,
            text: (
              <>
                När ansökan är godkänd: Swish <strong className="whitespace-nowrap text-ink">{club.swish}</strong> eller
                bankgiro <strong className="whitespace-nowrap text-ink">{club.bankgiro}</strong>.
              </>
            ),
          },
          {
            title: "Välkommen!",
            text: "Nu är du medlem – automatiskt, tills du själv säger upp medlemskapet.",
          },
        ]}
      />
    </section>
  );
}

function Included() {
  const perks = [
    { Icon: IconShield, title: "Olycksfallsförsäkring", text: "Ingår i medlemsavgiften och gäller på föreningens träningar." },
    { Icon: IconRunner, title: "Alla träningar", text: "Intervaller i tre grupper på tisdagar, Hälsagruppen och månadens långpass." },
    { Icon: IconTicket, title: "Subventionerade startavgifter", text: "Föreningen betalar en del av startavgiften till vissa tävlingar." },
    { Icon: IconBus, title: "Bussresor till självkostnadspris", text: "Till en del tävlingar åker vi buss tillsammans." },
  ];
  const rests = ["-1.5deg", "1deg", "-0.5deg", "1.5deg"];
  return (
    <Band id="det-har-ingar" labelledBy="ingar-rubrik" className="scroll-mt-4">
      <div className="flex flex-col gap-10">
        <BandHeading id="ingar-rubrik" sub={`${club.fee} kr för hela ${club.feeYear} – oavsett när på året du går med.`}>
          Det här ingår
        </BandHeading>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5 p-0">
          {perks.map(({ Icon, title, text }, i) => (
            <li
              key={title}
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
              <strong className="text-white">Medlem tills du säger upp.</strong> Du är medlem automatiskt tills du säger
              upp medlemskapet – du betalar bara årets avgift.
            </p>
          </div>
          <div className="flex gap-3 rounded-md bg-ink-3 p-5 ring-1 ring-ink-2" data-reveal="up" style={{ "--reveal-i": 1 } as CSSProperties}>
            <IconInfo size={22} className="mt-0.5 flex-none text-orange" />
            <p className="m-0 text-[16px] text-mist">
              <strong className="text-white">Torsdagsgruppen</strong> (60+ eller dagledig): {club.fee} kr för hela årets
              aktiviteter, medlemskapet ingår.{" "}
              <Link href="/trana-med-oss#torsdagsgruppen" className="font-semibold text-orange hover:text-orange">
                Läs mer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Band>
  );
}

function Apply() {
  return (
    <section id="ansok" className={`${wrap} flex scroll-mt-4 flex-wrap items-start gap-x-10 gap-y-10 pt-6 pb-28`}>
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
        <SectionHeading>Ansök om medlemskap</SectionHeading>
        <p className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
          Har du provat på och vill fortsätta? Fyll i ansökan. När den är godkänd betalar du årets avgift.
        </p>
        <div
          data-settle
          style={{ "--rest-rotate": "-1.5deg" } as CSSProperties}
          className="straighten-hover stripes-drift flex flex-col gap-3 rounded-md bg-orange p-5 text-ink shadow-[0_12px_26px_rgba(168,84,0,0.3)]"
        >
          <h3 className="m-0 text-[19px] font-extrabold">Betala {club.fee} kr</h3>
          <dl className="m-0 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
              <dt className="text-[13px] font-extrabold tracking-[0.5px] uppercase">Swish</dt>
              <dd className="m-0 flex items-center gap-2">
                <span className="text-[18px] font-extrabold tabular-nums">{club.swish}</span>
                <CopyButton value={club.swish} label="Swishnumret" />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
              <dt className="text-[13px] font-extrabold tracking-[0.5px] uppercase">Bankgiro</dt>
              <dd className="m-0 flex items-center gap-2">
                <span className="text-[18px] font-extrabold tabular-nums">{club.bankgiro}</span>
                <CopyButton value={club.bankgiro} label="Bankgironumret" />
              </dd>
            </div>
          </dl>
          <p className="m-0 text-[14px]">Betala först när ansökan är godkänd.</p>
        </div>
        <ArrowLink href="/fragor" className="self-start">
          Fler frågor om medlemskapet
        </ArrowLink>
      </div>

      <div
        className="card min-w-0 flex-[2_1_440px] p-5 shadow-[0_16px_34px_-18px_rgba(34,30,31,0.4)] md:p-7"
        data-reveal="right"
      >
        <h3 className="m-0 mb-5 text-[22px] font-extrabold">Ansökan</h3>
        <MembershipForm />
      </div>
    </section>
  );
}
