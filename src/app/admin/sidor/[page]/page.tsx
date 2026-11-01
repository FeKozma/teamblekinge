import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection } from "@/components/admin/form";
import { IconChevronRight } from "@/components/icons";
import { PageTextField } from "@/components/admin/PageTextField";
import { getStoredPageTexts } from "@/lib/content/pages";
import { getPageTextsDef } from "@/lib/data/pages";
import { savePageTextsAction } from "../actions";

type Props = PageProps<"/admin/sidor/[page]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const def = getPageTextsDef((await params).page);
  return { title: def ? `${def.label} – Sidtexter` : "Sidtexter" };
}

export default async function AdminPageTexts({ params }: Props) {
  const def = getPageTextsDef((await params).page);
  if (!def?.sections.length) notFound();
  if (!(await requireBoard())) return null;
  const edited = (await getStoredPageTexts())[def.id] ?? {};

  return (
    <AdminPage
      title={def.label}
      intro="Ändra texterna och tryck Spara. Rubrikerna nedan följer sidan uppifrån och ner."
      crumbs={[{ title: "Sidtexter", href: "/admin/sidor" }]}
      publicHref={def.href}
      publicLabel="Visa sidan"
    >
      {def.related && def.related.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[14px] font-semibold text-muted">Annat på sidan ändrar du här:</p>
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {def.related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group flex items-center gap-3 rounded-[10px] border border-line bg-white px-4 py-3 text-ink no-underline hover:border-ink hover:text-ink"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-bold">{r.label}</span>
                    <span className="text-[13px] text-muted">{r.text}</span>
                  </span>
                  <IconChevronRight size={18} className="flex-none text-orange-dark transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <AdminForm action={savePageTextsAction.bind(null, def.id)} submitLabel="Spara texterna">
        {def.sections.map((s) => (
          <FormSection key={s.title} title={s.title}>
            <div className="flex flex-col gap-5">
              {s.fields.map((f) => (
                <PageTextField
                  key={f.key}
                  name={f.key}
                  label={f.label}
                  value={edited[f.key] ?? f.value}
                  original={f.value}
                  long={f.long}
                  optional={f.optional}
                  hint={f.hint}
                />
              ))}
            </div>
          </FormSection>
        ))}
      </AdminForm>
    </AdminPage>
  );
}
