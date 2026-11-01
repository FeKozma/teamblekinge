import type { Metadata } from "next";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, ListEditor } from "@/components/admin/form";
import { getPartners } from "@/lib/content/club";
import type { Partner } from "@/lib/data/club";
import { savePartnersAction } from "./actions";

export const metadata: Metadata = { title: "Sponsorer" };

export default async function AdminPartnersPage() {
  if (!(await requireBoard())) return null;
  const partners = await getPartners();
  return (
    <AdminPage
      title="Sponsorer"
      intro="Föreningens samarbetspartners. Loggorna rullar förbi längst ner på startsidan."
      publicHref="/"
      publicLabel="Visa startsidan"
    >
      <AdminForm action={savePartnersAction} submitLabel="Spara sponsorerna">
        <FormSection
          title="Samarbetspartners"
          description="Flytta en sponsor med pilarna. Ordningen här är ordningen på startsidan."
        >
          <ListEditor<Partner>
            name="partners"
            initial={partners}
            numbered
            newItem={{ name: "", logo: "", url: "" }}
            titleField="name"
            untitled="Ny sponsor"
            addLabel="Lägg till en sponsor"
            emptyText="Inga sponsorer ännu."
            fields={[
              { name: "name", label: "Namn", hint: "Läses upp för den som inte kan se loggan." },
              {
                name: "url",
                label: "Länk (frivilligt)",
                type: "url",
                placeholder: "https://",
                hint: "Sponsorns webbplats. Loggan blir en länk dit.",
              },
              {
                name: "logo",
                label: "Logga",
                type: "image",
                hint: "Visas i gråskala tills man pekar på den. Helst med vit eller genomskinlig bakgrund – JPG, PNG eller WebP, högst 10 MB.",
              },
            ]}
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
