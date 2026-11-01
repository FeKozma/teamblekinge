import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { IconChevronRight, IconPlus } from "@/components/icons";
import { isPinned } from "@/components/news/util";
import { getAllNews } from "@/lib/content/news";
import { newsCategories, visibleNews } from "@/lib/data/news";
import { people } from "@/lib/data/users";
import { todayISO } from "@/lib/format";
import { FlashToast } from "./FlashToast";
import { NewsTable, type AdminNewsRow } from "./NewsTable";

export const metadata: Metadata = { title: "Nyheter" };

export default async function AdminNewsPage({ searchParams }: PageProps<"/admin/nyheter">) {
  if (!(await requireBoard())) return null;
  const [all, { borttagen }] = await Promise.all([getAllNews(), searchParams]);
  const today = todayISO();
  const rows: AdminNewsRow[] = visibleNews(all, { members: true }).map((n) => ({
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    category: n.category,
    date: n.date,
    author: people[n.author]?.name,
    membersOnly: !!n.membersOnly,
    pinnedUntil: isPinned(n, today) ? n.pinnedUntil : undefined,
    registration: n.registration && { kind: n.registration.kind, deadline: n.registration.deadline },
    protocol: !!n.document,
  }));

  return (
    <AdminPage
      title="Nyheter"
      intro="Allt som står under Nyheter, det senaste först. Tryck på en nyhet för att ändra eller ta bort den."
      publicHref="/nyheter"
      publicLabel="Visa Nyheter"
      actions={
        <Link href="/admin/nyheter/ny" className="btn btn-primary font-extrabold">
          <IconPlus size={18} strokeWidth={2.4} /> Skriv en nyhet
        </Link>
      }
    >
      {borttagen && <FlashToast message="Nyheten är borttagen." />}
      <NewsTable rows={rows} today={today} categories={newsCategories} />
      <Link
        href="/admin/sidor/nyheter"
        className="group mb-10 flex items-center gap-3 rounded-[10px] border border-line bg-white px-4 py-3 text-ink no-underline hover:border-ink hover:text-ink"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold">Texterna runt nyheterna</span>
          <span className="text-[13px] text-muted">
            Rubriken och ingressen på Nyheter, rutan för den som inte är inloggad och ”Missa inget”.
          </span>
        </span>
        <IconChevronRight
          size={18}
          className="flex-none text-orange-dark transition-transform group-hover:translate-x-1"
        />
      </Link>
    </AdminPage>
  );
}
