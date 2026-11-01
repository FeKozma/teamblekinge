import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection } from "@/components/admin/form";
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
