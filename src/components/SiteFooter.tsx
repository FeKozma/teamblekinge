import Link from "next/link";
import Image from "next/image";
import { ResetDemoButton } from "@/components/ResetDemoButton";
import { IconInstagram, IconFacebook } from "@/components/icons";
import { getClub } from "@/lib/content/club";
import { getPageTexts } from "@/lib/content/pages";

export async function SiteFooter() {
  const [club, t] = await Promise.all([getClub(), getPageTexts("sidfot")]);
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
          <Image src="/img/logo-emblem.png" alt={club.name} width={96} height={104} />
          <span>
            {t("place")}, {club.address.street}, {club.address.area}, {club.address.city}
          </span>
          <Link href="/fragor#kontakt" className="text-orange">
            {t("contact")}
          </Link>
          <span className="mt-2 flex gap-2">
            <a href={club.instagram} aria-label={t("instagram")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-2 text-mist hover:border-orange hover:text-orange">
              <IconInstagram size={20} />
            </a>
            <a href={club.facebookGroup} aria-label={t("facebook")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-2 text-mist hover:border-orange hover:text-orange">
              <IconFacebook size={20} />
            </a>
          </span>
        </div>
        <nav aria-labelledby="sidfot-hitta" className="flex flex-col gap-1.5">
          <span id="sidfot-hitta" className="font-bold text-white">{t("find.heading")}</span>
          <Link href="/trana-med-oss#prova-pa" className="text-mist">{t("find.tryOut")}</Link>
          <Link href="/trana-med-oss" className="text-mist">{t("find.training")}</Link>
          <Link href="/kalender" className="text-mist">{t("find.calendar")}</Link>
          <Link href="/tavla#resultat" className="text-mist">{t("find.results")}</Link>
        </nav>
        <nav aria-labelledby="sidfot-foreningen" className="flex flex-col gap-1.5">
          <span id="sidfot-foreningen" className="font-bold text-white">{t("club.heading")}</span>
          <Link href="/foreningen#styrelsen" className="text-mist">{t("club.board")}</Link>
          <Link href="/trana-med-oss#torsdagsgruppen" className="text-mist">{t("club.thursday")}</Link>
          <Link href="/bli-medlem" className="text-mist">{t("club.join")}</Link>
          <Link href="/dokument" className="text-mist">{t("club.documents")}</Link>
          <Link href="/fragor" className="text-mist">{t("club.faq")}</Link>
        </nav>
      </div>
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap justify-between gap-2 border-t border-ink-2 px-4 pt-4 pb-8 text-[13px] text-[#CFC8C4] md:px-6">
        <span>{t("smallPrint")}</span>
        <span>
          Demo av nya teamblekinge.nu ·{" "}
          <Link href="/om-demon" className="text-[#CFC8C4] underline underline-offset-2 hover:text-orange">
            Så fungerar demon
          </Link>{" "}
          · <ResetDemoButton />
        </span>
      </div>
    </footer>
  );
}
