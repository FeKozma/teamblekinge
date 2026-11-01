import type { Metadata } from "next";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, ListEditor } from "@/components/admin/form";
import { getHistory } from "@/lib/content/club";
import type { Milestone } from "@/lib/data/club";
import { saveHistoryAction } from "./actions";

export const metadata: Metadata = { title: "Historia" };

export default async function AdminHistoryPage() {
  if (!(await requireBoard())) return null;
  const history = await getHistory();
  return (
    <AdminPage
      title="Historia"
      intro="Händelserna på tidslinjen under Vår historia på sidan Föreningen. Lägg till en ny när något stort händer."
      publicHref="/foreningen#historia"
      publicLabel="Visa Föreningen"
    >
      <AdminForm action={saveHistoryAction} submitLabel="Spara historien">
        <FormSection
          title="Tidslinjen"
          description="Händelserna visas i den här ordningen, uppifrån och ner – den äldsta först. Flytta en händelse med pilarna."
        >
          <ListEditor<Milestone>
            name="history"
            initial={history}
            numbered
            newItem={{ when: "", mark: "", title: "", text: "" }}
            titleField="title"
            untitled="Ny händelse"
            addLabel="Lägg till en händelse"
            emptyText="Inga händelser ännu."
            fields={[
              { name: "when", label: "När", placeholder: "T.ex. Hösten 1989", span: 3 },
              { name: "mark", label: "Årtal på banan", placeholder: "1989", hint: "Står på banan i mitten.", span: 1 },
              {
                name: "planned",
                label: "Har det hänt?",
                type: "select",
                options: [
                  { value: "", label: "Ja" },
                  { value: "true", label: "Nej, det planeras" },
                ],
                hint: "Planerade händelser får en streckad ram.",
                span: 2,
              },
              { name: "title", label: "Rubrik", span: 6 },
              { name: "text", label: "Text", type: "text" },
            ]}
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
