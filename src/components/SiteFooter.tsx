import Link from "next/link";
import Image from "next/image";
import { ResetDemoButton } from "@/components/ResetDemoButton";
import { IconInstagram, IconFacebook } from "@/components/icons";
import { club } from "@/lib/data/club";

export function SiteFooter() {
  return (
    <footer
      className="relative -mt-16 bg-ink pb-24 text-[15px] text-mist md:pb-0"
      style={{ clipPath: "polygon(0 64px, 100% 0, 100% 100%, 0 100%)" }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path d="M1120 400 L1380 0 L1440 0 L1180 400 Z" fill="#EE8915" opacity="0.14" />
        <path d="M1000 400 L1260 0 L1290 0 L1030 400 Z" fill="#EE8915" opacity="0.07" />
      </svg>
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 px-4 pt-28 pb-8 md:px-6">
        <div className="flex flex-col gap-1.5">
          <Image src="/img/logo-emblem.png" alt="Team Blekinge Löparförening" width={96} height={104} />
          <span>
            Klubblokalen, {club.address.street}, {club.address.area}, {club.address.city}
          </span>
          <Link href="/fragor#kontakt" className="text-orange">
            Kontakta oss
          </Link>
          <span className="mt-2 flex gap-2">
            <a href={club.instagram} aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-2 text-mist hover:border-orange hover:text-orange">
              <IconInstagram size={20} />
            </a>
            <a href={club.facebookGroup} aria-label="Facebookgruppen för medlemmar" className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-2 text-mist hover:border-orange hover:text-orange">
              <IconFacebook size={20} />
            </a>
          </span>
        </div>
        <nav aria-label="Sidfot" className="flex flex-col gap-1.5">
          <span className="font-bold text-white">Hitta</span>
          <Link href="/trana-med-oss#prova-pa" className="text-mist">Prova på</Link>
          <Link href="/trana-med-oss" className="text-mist">Träningspass</Link>
          <Link href="/kalender" className="text-mist">Kalender</Link>
          <Link href="/tavla#resultat" className="text-mist">Resultatarkiv</Link>
        </nav>
        <nav aria-label="Föreningen" className="flex flex-col gap-1.5">
          <span className="font-bold text-white">Föreningen</span>
          <Link href="/foreningen#styrelsen" className="text-mist">Styrelsen och ansvariga</Link>
          <Link href="/trana-med-oss#torsdagsgruppen" className="text-mist">Torsdagsgruppen</Link>
          <Link href="/bli-medlem" className="text-mist">Bli medlem</Link>
          <Link href="/dokument" className="text-mist">Dokument & policys</Link>
          <Link href="/fragor" className="text-mist">Frågor & kontakt</Link>
        </nav>
      </div>
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap justify-between gap-2 border-t border-ink-2 px-4 pt-4 pb-8 text-[13px] text-[#CFC8C4] md:px-6">
        <span>Ingen spårning och inga kakor att godkänna.</span>
        <span>
          Demo av nya teamblekinge.nu · <ResetDemoButton />
        </span>
      </div>
    </footer>
  );
}
