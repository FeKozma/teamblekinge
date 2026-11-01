import type { Metadata } from "next";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { todayISO } from "@/lib/format";
import { createNewsAction } from "../actions";
import { NewsEditor } from "../NewsEditor";

export const metadata: Metadata = { title: "Skriv en nyhet" };

export default async function NewNewsPage() {
  if (!(await requireBoard())) return null;
  return (
    <AdminPage
      title="Skriv en nyhet"
      intro="Fyll i rubrik, ingress och text, välj vem som får läsa och tryck Publicera. Bild och anmälan är frivilliga."
      crumbs={[{ title: "Nyheter", href: "/admin/nyheter" }]}
    >
      <NewsEditor action={createNewsAction} today={todayISO()} />
    </AdminPage>
  );
}
