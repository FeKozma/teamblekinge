import type { Metadata } from "next";
import { NewsIndex } from "@/components/news/NewsIndex";
import { categoryFromSlug } from "@/components/news/util";
import { Page } from "@/components/ui";
import { getPageTexts } from "@/lib/content/pages";
import { todayISO } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Nyheter",
  description: "Meddelanden från styrelsen, tränarna och arrangörerna i Team Blekinge Löparförening.",
};

function one(v: string | string[] | undefined) {
  return typeof v === "string" ? v : undefined;
}

// Filters are plain links (?kategori=stafett&ar=2025&visa=alla), so the list is
// server-rendered and every filtered view has its own URL.
export default async function NewsPage({ searchParams }: PageProps<"/nyheter">) {
  const [{ kategori, ar, visa }, user, t] = await Promise.all([searchParams, getSession(), getPageTexts("nyheter")]);
  const today = todayISO();
  const year = Number(one(ar));
  const currentYear = Number(today.slice(0, 4));
  return (
    <Page>
      <NewsIndex
        user={user}
        today={today}
        t={t}
        category={categoryFromSlug(one(kategori))}
        year={year >= currentYear - 3 && year <= currentYear ? year : undefined}
        showAll={one(visa) === "alla"}
      />
    </Page>
  );
}
