import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, ListEditor } from "@/components/admin/form";
import { getBoard, getClub, getOtherRoles } from "@/lib/content/club";
import type { BoardMember, RoleGroup } from "@/lib/data/club";
import { saveBoardAction } from "./actions";

export const metadata: Metadata = { title: "Styrelse och ansvariga" };

export default async function AdminBoardPage() {
  if (!(await requireBoard())) return null;
  const [board, roles, club] = await Promise.all([getBoard(), getOtherRoles(), getClub()]);
  return (
    <AdminPage
      title="Styrelse och ansvariga"
      intro="Vilka som sitter i styrelsen och vem som ansvarar för vad. Visas under Styrelsen och ansvariga på sidan Föreningen."
      publicHref="/foreningen#styrelsen"
      publicLabel="Visa Föreningen"
    >
      <AdminForm action={saveBoardAction} submitLabel="Spara personerna">
        <FormSection
          title="Styrelsen"
          description={
            <>
              Flytta en person med pilarna – ordningen här är ordningen på webbplatsen. Den första i listan får en
              orange ram, så sätt ordföranden först. Året i texten ”Styrelsen {club.feeYear}” är avgiftsåret under{" "}
              <Link href="/admin/foreningsuppgifter" className="font-semibold">
                Föreningsuppgifter
              </Link>
              .
            </>
          }
        >
          <ListEditor<BoardMember>
            name="board"
            initial={board}
            numbered
            newItem={{ name: "", role: "Ledamot" }}
            titleField="name"
            untitled="Ny person"
            addLabel="Lägg till en person"
            emptyText="Ingen i styrelsen ännu."
            fields={[
              { name: "name", label: "Namn" },
              { name: "role", label: "Roll", placeholder: "T.ex. Kassör eller Ledamot" },
            ]}
          />
        </FormSection>

        <FormSection
          title="Kommittéer och ansvariga"
          description="Visas under styrelsen. Ett par av uppdragen används också på andra sidor: behåll ordet ”Antidoping” i den antidopingansvariges rubrik (visas under Policys) och ”Torsdagsgruppen” i Torsdagsgruppens (visas under Träna med oss)."
        >
          <ListEditor<RoleGroup>
            name="roles"
            initial={roles}
            newItem={{ title: "", names: [] }}
            titleField="title"
            untitled="Nytt uppdrag"
            addLabel="Lägg till en kommitté eller ett uppdrag"
            emptyText="Inga kommittéer eller ansvariga ännu."
            fields={[
              { name: "title", label: "Kommitté eller uppdrag", placeholder: "T.ex. Valberedning 2027", span: 6 },
              { name: "names", label: "Namn", type: "lines", hint: "Ett namn per rad." },
            ]}
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
