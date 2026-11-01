import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { SeriesForm } from "@/components/admin/calendar/EventForm";
import { todayISO } from "@/lib/format";
import { saveSeriesAction } from "../../actions";
import { linkGroups } from "../../fields";

export const metadata: Metadata = { title: "Nytt återkommande pass" };

export default async function NewSeriesPage() {
  if (!(await requireBoard())) return null;
  return (
    <AdminPage
      title="Nytt återkommande pass"
      intro="Ett pass som går samma veckodag och tid varje vecka. Det läggs in i kalendern för varje vecka på en gång – enstaka gånger kan du ställa in efteråt."
      crumbs={[{ title: "Kalender", href: "/admin/kalender" }]}
    >
      <p className="m-0 -mt-2 flex flex-wrap items-center gap-x-2 rounded-[10px] border border-dashed border-[#cfc8c4] bg-white px-4 py-3 text-[15px]">
        <span>Händer det bara en gång?</span>
        <Link href="/admin/kalender/ny" className="font-semibold">
          Lägg in en enstaka händelse i stället →
        </Link>
      </p>
      <SeriesForm
        action={saveSeriesAction.bind(null, null)}
        series={{ kind: "traning", from: todayISO() }}
        links={await linkGroups()}
      />
    </AdminPage>
  );
}
