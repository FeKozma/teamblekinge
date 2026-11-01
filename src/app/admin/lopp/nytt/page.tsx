import type { Metadata } from "next";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { RaceEditor } from "@/components/admin/races/RaceEditor";
import { getRaces } from "@/lib/content/races";
import { saveRaceAction } from "../actions";

export const metadata: Metadata = { title: "Nytt lopp – Våra lopp" };

export default async function AdminNewRacePage() {
  if (!(await requireBoard())) return null;
  const races = await getRaces();
  return (
    <AdminPage
      title="Nytt lopp"
      intro="Fyll i uppgifterna och tryck Skapa loppet. Loppet får en egen sida under Tävla och hamnar sist i listan."
      crumbs={[{ title: "Våra lopp", href: "/admin/lopp" }]}
    >
      <RaceEditor
        others={races.map(({ slug, name }) => ({ slug, name }))}
        action={saveRaceAction.bind(null, null)}
        submitLabel="Skapa loppet"
      />
    </AdminPage>
  );
}
