import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { IconChevronRight } from "@/components/icons";
import { getStoredPageTexts } from "@/lib/content/pages";
import { pageTextDefs } from "@/lib/data/pages";

export const metadata: Metadata = { title: "Sidtexter" };

export default async function AdminPagesIndex() {
  if (!(await requireBoard())) return null;
  const stored = await getStoredPageTexts();
  const pages = pageTextDefs.filter((p) => p.sections.length > 0);
  return (
    <AdminPage
      title="Sidtexter"
      intro="Välj en sida för att ändra dess rubriker och texter. Nyheter, kalendern och dokumenten ändrar du under sina egna rubriker."
    >
      <ul className="card m-0 list-none divide-y divide-line overflow-hidden p-0">
        {pages.map((p) => {
          const fields = p.sections.reduce((n, s) => n + s.fields.length, 0);
          const changed = Object.keys(stored[p.id] ?? {}).length;
          return (
            <li key={p.id}>
              <Link
                href={`/admin/sidor/${p.id}`}
                className="group flex items-center gap-4 px-5 py-4 text-ink no-underline transition-colors hover:bg-paper/70 hover:text-ink"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[17px] font-bold">{p.label}</span>
                  <span className="text-[14px] text-muted">
                    {fields} texter
                    {changed > 0 && (
                      <span className="font-semibold text-orange-dark">
                        {" "}
                        · {changed === 1 ? "1 ändrad" : `${changed} ändrade`}
                      </span>
                    )}
                  </span>
                </span>
                <IconChevronRight
                  size={18}
                  className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminPage>
  );
}
