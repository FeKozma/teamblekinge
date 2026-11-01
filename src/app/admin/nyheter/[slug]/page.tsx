import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { IconBell, IconCheck } from "@/components/icons";
import { SpeedLines } from "@/components/ui";
import { getNews } from "@/lib/content/news";
import type { NewsItem } from "@/lib/data/news";
import { people } from "@/lib/data/users";
import { todayISO } from "@/lib/format";
import { updateNewsAction } from "../actions";
import { NewsEditor } from "../NewsEditor";

type Props = PageProps<"/admin/nyheter/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getNews((await params).slug);
  return { title: n ? `${n.title} – Nyheter` : "Nyheter" };
}

export default async function EditNewsPage({ params, searchParams }: Props) {
  if (!(await requireBoard())) return null;
  const [{ slug }, { publicerad }] = await Promise.all([params, searchParams]);
  const n = await getNews(slug);
  if (!n) notFound();
  const author = people[n.author]?.name;

  return (
    <AdminPage
      title="Ändra nyheten"
      intro={
        <>
          Skriven {n.dateLabel}
          {n.time && ` ${n.time}`}
          {author && ` av ${author}`}. Adressen <span className="font-semibold text-ink">/nyheter/{n.slug}</span>{" "}
          ändras inte, så länkar som redan har delats fortsätter att fungera.
        </>
      }
      crumbs={[{ title: "Nyheter", href: "/admin/nyheter" }]}
      publicHref={`/nyheter/${n.slug}`}
      publicLabel="Visa nyheten"
    >
      {publicerad && <Published n={n} />}
      <NewsEditor key={n.slug} item={n} action={updateNewsAction.bind(null, n.slug)} today={todayISO()} />
    </AdminPage>
  );
}

/** Right after "Publicera": where the item is now, and who would have heard about it. */
function Published({ n }: { n: NewsItem }) {
  return (
    <section
      role="status"
      data-reveal="up"
      className="relative flex flex-col gap-3 overflow-hidden rounded-xl bg-ink p-5 text-white md:p-6"
    >
      <SpeedLines
        viewBox="0 0 600 200"
        opacity={0.3}
        lines={[
          [420, 200, 520, 0],
          [470, 200, 570, 0],
          [520, 200, 620, 0],
        ]}
      />
      <p className="relative m-0 flex items-center gap-3 text-[20px] font-extrabold">
        <span className="tilt-pop flex-none">
          <span className="flex h-10 w-10 -skew-x-[12deg] items-center justify-center rounded-[6px] bg-orange text-ink">
            <IconCheck size={22} strokeWidth={3} />
          </span>
        </span>
        Nyheten är publicerad!
      </p>
      <p className="relative m-0 max-w-[620px] text-[15px] text-mist">
        Den syns nu under Nyheter{n.membersOnly ? " för inloggade medlemmar" : ""} – i demon bara för dig.
      </p>
      <p className="relative m-0 flex max-w-[620px] items-start gap-2 text-[15px] text-mist">
        <IconBell size={18} className="mt-0.5 flex-none text-orange" />
        <span>
          På riktigt får de som följer <strong className="text-white">{n.category}</strong> ett mejl om nyheten
          {n.membersOnly ? "" : ", och den kommer med i RSS-flödet"}. I demon skickas inga mejl.
        </span>
      </p>
      <div className="relative flex flex-wrap gap-2.5 pt-1">
        <Link href={`/nyheter/${n.slug}`} className="btn btn-primary font-extrabold">
          Visa nyheten <span aria-hidden="true">→</span>
        </Link>
        <Link href="/admin/nyheter/ny" className="btn btn-outline-light">
          Skriv en till
        </Link>
        <Link href="/admin/nyheter" className="btn btn-outline-light">
          Alla nyheter
        </Link>
      </div>
    </section>
  );
}
