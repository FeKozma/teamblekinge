import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FeedApp } from "@/components/feed/FeedApp";
import { Page } from "@/components/ui";
import { events } from "@/lib/data/events";
import { feed } from "@/lib/data/feed";
import { news } from "@/lib/data/news";
import { todayISO } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Klubbflödet" };

// Klubbflödet — members only (docs/design/07-klubbflodet-dator.jpg, 08-…-mobil.jpg).
export default async function FlodetPage() {
  const user = await getSession();
  if (!user) redirect("/logga-in?next=/flodet");

  const today = todayISO();
  // "Viktigt i Nyheter": still-pinned news, soonest deadline first.
  const pinned = news
    .filter((n) => n.pinnedUntil && n.pinnedUntil >= today)
    .sort((a, b) => a.pinnedUntil!.localeCompare(b.pinnedUntil!))
    .map((n) => ({ slug: n.slug, title: n.title }));
  const runs = events.filter((e) => e.kind === "lopprunda" && e.date >= today);

  return (
    <Page>
      <FeedApp
        me={{ id: user.id, firstName: user.firstName }}
        today={today}
        posts={feed}
        pinned={pinned}
        runs={runs}
      />
    </Page>
  );
}
