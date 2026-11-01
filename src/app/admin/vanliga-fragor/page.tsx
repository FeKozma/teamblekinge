import type { Metadata } from "next";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, ListEditor } from "@/components/admin/form";
import { getFaqs } from "@/lib/content/club";
import type { Faq } from "@/lib/data/club";
import { saveFaqsAction } from "./actions";

export const metadata: Metadata = { title: "Vanliga frågor" };

const topicOptions: { value: Faq["topic"]; label: string }[] = [
  { value: "medlem", label: "Medlemskap" },
  { value: "traning", label: "Träning" },
  { value: "lopp", label: "Våra lopp" },
];

export default async function AdminFaqsPage() {
  if (!(await requireBoard())) return null;
  const faqs = await getFaqs();
  return (
    <AdminPage
      title="Vanliga frågor"
      intro="Frågorna visas under Frågor & kontakt, sorterade efter ämne. De fyra översta visas också på startsidan."
      publicHref="/fragor"
      publicLabel="Visa Frågor & kontakt"
    >
      <AdminForm action={saveFaqsAction} submitLabel="Spara frågorna">
        <FormSection
          title="Frågor och svar"
          description="Flytta en fråga med pilarna. Ordningen här är ordningen på webbplatsen."
        >
          <ListEditor<Faq>
            name="faqs"
            initial={faqs}
            numbered
            newItem={{ q: "", a: "", topic: "medlem" }}
            titleField="q"
            untitled="Ny fråga"
            addLabel="Lägg till en fråga"
            emptyText="Inga frågor ännu."
            fields={[
              { name: "q", label: "Fråga", span: 4 },
              { name: "topic", label: "Ämne", type: "select", options: topicOptions, span: 2 },
              { name: "a", label: "Svar", type: "text" },
            ]}
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
