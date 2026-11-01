import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { EventForm } from "@/components/admin/calendar/EventForm";
import { saveEventAction } from "../actions";
import { linkGroups } from "../fields";

export const metadata: Metadata = { title: "Lägg in i kalendern" };

export default async function NewEventPage() {
  if (!(await requireBoard())) return null;
  return (
    <AdminPage
      title="Lägg in i kalendern"
      intro="Ett möte, ett lopp, en resa eller en extra träning. Fyll i vad, var och när – det syns i kalendern så fort du sparar."
      crumbs={[{ title: "Kalender", href: "/admin/kalender" }]}
    >
      <p className="m-0 -mt-2 flex flex-wrap items-center gap-x-2 rounded-[10px] border border-dashed border-[#cfc8c4] bg-white px-4 py-3 text-[15px]">
        <span>Händer det varje vecka, som tisdagsträningen?</span>
        <Link href="/admin/kalender/aterkommande/ny" className="font-semibold">
          Lägg in ett återkommande pass i stället →
        </Link>
      </p>
      <EventForm action={saveEventAction.bind(null, null)} links={await linkGroups()} />
    </AdminPage>
  );
}
