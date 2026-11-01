import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/news/Article";
import { Page } from "@/components/ui";
import { getNews } from "@/lib/content/news";
import { todayISO } from "@/lib/format";
import { getSession } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/nyheter/[slug]">): Promise<Metadata> {
  const n = await getNews((await params).slug);
  if (!n) return {};
  return { title: n.title, description: n.excerpt };
}

export default async function NewsItemPage({ params }: PageProps<"/nyheter/[slug]">) {
  const n = await getNews((await params).slug);
  if (!n) notFound();
  const user = await getSession();
  return (
    <Page>
      <Article n={n} user={user} today={todayISO()} />
    </Page>
  );
}
