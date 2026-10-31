import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { IconFacebook, IconInstagram, IconMail, IconMapPin, IconUser } from "@/components/icons";
import { ContactForm } from "@/components/public/ContactForm";
import { FaqSearch } from "@/components/public/FaqSearch";
import { IconExternal } from "@/components/public/icons";
import { JumpNav, mapsUrl, wrap } from "@/components/public/layout";
import { Page, PageHero, SectionHeading } from "@/components/ui";
import { club, faqs } from "@/lib/data/club";

export const metadata: Metadata = {
  title: "Frågor & kontakt",
  description:
    "Vanliga frågor om medlemskap, träning och våra lopp – och hur du når Team Blekinge Löparförening.",
};

export default function FaqPage() {
  return (
    <Page>
      <PageHero
        kicker="Frågor & kontakt"
        title="Vanliga frågor"
        intro="Svar på det vi oftast får frågor om via mejl. Hittar du inte svaret? Hör av dig."
      >
        <JumpNav
          links={[
            { href: "#fragor", label: "Frågor och svar" },
            { href: "#kontakt", label: "Kontakt" },
          ]}
        />
      </PageHero>

      <section id="fragor" aria-label="Frågor och svar" className={`${wrap} scroll-mt-4 pt-6 pb-16`}>
        <FaqSearch faqs={faqs} />
      </section>

      <Contact />
    </Page>
  );
}

function Contact() {
  const address = `${club.address.street}, ${club.address.zip} ${club.address.city}`;
  return (
    <section id="kontakt" className="scroll-mt-4 border-t border-line bg-white">
      <div className={`${wrap} flex flex-wrap items-start gap-x-10 gap-y-10 pt-14 pb-28`}>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
          <SectionHeading sub="Skriv till oss, eller kom förbi en tisdag.">Kontakt</SectionHeading>
          <div
            data-settle
            style={{ "--rest-rotate": "-1.5deg" } as CSSProperties}
            className="straighten-hover relative flex flex-col gap-4 overflow-hidden rounded-md bg-ink p-6 text-white shadow-[0_18px_34px_-12px_rgba(34,30,31,0.55)]"
          >
            <svg aria-hidden="true" viewBox="0 0 300 300" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
              <g stroke="#EE8915" strokeWidth="2" opacity="0.22">
                <path d="M190 300 L300 110" />
                <path d="M225 300 L300 170" />
                <path d="M260 300 L300 230" />
              </g>
            </svg>
            <p className="relative m-0 flex items-start gap-3">
              <IconUser size={22} className="mt-0.5 flex-none text-orange" />
              <span>
                <span className="block text-[13px] font-extrabold tracking-[0.5px] text-orange uppercase">Kontaktperson</span>
                <strong className="text-[18px]">{club.contact.name}</strong>, {club.contact.role.toLowerCase()}
              </span>
            </p>
            <p className="relative m-0 flex items-start gap-3">
              <IconMail size={22} className="mt-0.5 flex-none text-orange" />
              <span>
                <span className="block text-[13px] font-extrabold tracking-[0.5px] text-orange uppercase">Frågor om loppen</span>
                <a href={`mailto:${club.contact.raceEmail}`} className="font-semibold break-all text-white hover:text-orange">
                  {club.contact.raceEmail}
                </a>
              </span>
            </p>
            <p className="relative m-0 flex items-start gap-3">
              <IconMapPin size={22} className="mt-0.5 flex-none text-orange" />
              <span>
                <span className="block text-[13px] font-extrabold tracking-[0.5px] text-orange uppercase">Klubblokalen</span>
                {club.address.street}, {club.address.area}
                <br />
                {club.address.zip} {club.address.city}
                <br />
                <a
                  href={mapsUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[15px] font-semibold text-orange hover:text-orange"
                >
                  Visa på karta <IconExternal size={14} />
                  <span className="sr-only">(öppnas i ny flik)</span>
                </a>
              </span>
            </p>
            <p className="relative m-0 border-t border-ink-2 pt-3 text-[14px] text-mist">
              Föreningsnummer {club.foreningsNr} · Org.nr {club.orgNr}
            </p>
            <div className="relative flex flex-wrap gap-2">
              <a href={club.instagram} className="btn btn-outline-light min-h-10 px-3 text-[14px]">
                <IconInstagram size={18} /> Instagram
              </a>
              <a href={club.facebookGroup} className="btn btn-outline-light min-h-10 px-3 text-[14px]">
                <IconFacebook size={18} /> Facebookgruppen
                <span className="sr-only">Team Blekinge LF medlem</span>
              </a>
            </div>
          </div>
        </div>

        <div className="card min-w-0 flex-[2_1_440px] p-5 shadow-[0_16px_34px_-18px_rgba(34,30,31,0.4)] md:p-7" data-reveal="right">
          <h3 className="m-0 mb-5 text-[22px] font-extrabold">Skriv till oss</h3>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
