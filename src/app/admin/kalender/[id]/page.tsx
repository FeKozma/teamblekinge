import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { Created } from "@/components/admin/calendar/Created";
import { DeleteButton } from "@/components/admin/calendar/DeleteButton";
import { EventForm } from "@/components/admin/calendar/EventForm";
import { IconPeople } from "@/components/icons";
import { getEventSeries, getOneOffEvents } from "@/lib/content/events";
import { longDate, todayISO } from "@/lib/format";
import { deleteEventAction, saveEventAction } from "../actions";
import { linkGroups } from "../fields";

type Props = PageProps<"/admin/kalender/[id]">;

const findEvent = async (id: string) => (await getOneOffEvents()).find((e) => e.id === id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await findEvent(id))?.title ?? "Kalender" };
}

const crumbs = [{ title: "Kalender", href: "/admin/kalender" }];

export default async function EditEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ny } = await searchParams;
  if (!(await requireBoard())) return null;
  const event = await findEvent(id);
  if (!event) {
    // A weekly session (from the calendar's edit link): open its series at that date.
    const m = /^(.+)-(\d{4}-\d{2}-\d{2})$/.exec(id);
    if (m && (await getEventSeries()).some((s) => s.id === m[1])) {
      redirect(`/admin/kalender/aterkommande/${m[1]}?datum=${m[2]}`);
    }
    notFound();
  }

  const when = `${longDate(event.date)} kl. ${event.time}`;
  if (event.source === "flode") {
    return (
      <AdminPage title={event.title} crumbs={crumbs} publicHref={event.href ?? "/flodet"} publicLabel="Visa i Klubbflödet">
        <section className="card flex flex-col gap-3 p-5 md:p-6" data-reveal="up">
          <h2 className="m-0 flex items-center gap-2.5 text-[19px] font-extrabold">
            <IconPeople size={20} className="text-purple" />
            En löprunda från Klubbflödet
          </h2>
          <p className="m-0 text-muted">
            {when.charAt(0).toUpperCase() + when.slice(1)} · {event.place}
          </p>
          <p className="m-0">
            Den här rundan har en medlem lagt upp i Klubbflödet, och den syns i kalendern för inloggade medlemmar. Den
            som lagt upp den ändrar eller tar bort den i flödet, så den kan inte ändras här.
          </p>
          <Link href="/admin/kalender" className="btn btn-outline self-start">
            Tillbaka till kalendern
          </Link>
        </section>
      </AdminPage>
    );
  }

  const upcoming = event.date >= todayISO();
  const viewHref = upcoming ? `/kalender#dag-${event.date}` : "/kalender";
  return (
    <AdminPage
      title={event.title}
      intro={upcoming ? undefined : "Det här har redan varit, så det syns inte längre i kalendern på webbplatsen."}
      crumbs={crumbs}
      publicHref={viewHref}
      publicLabel="Visa i kalendern"
    >
      {ny && (
        <Created title={event.title} viewHref={viewHref} againHref="/admin/kalender/ny">
          {when.charAt(0).toUpperCase() + when.slice(1)}, {event.place}. Det syns direkt i kalendern på webbplatsen
          {event.membersOnly ? " för inloggade medlemmar" : ", på startsidan och i kalenderprenumerationen"} – i demon
          bara för dig. Du kan fortsätta ändra här nedanför.
        </Created>
      )}
      <EventForm
        key={event.id}
        action={saveEventAction.bind(null, event.id)}
        event={event}
        links={await linkGroups()}
        viewHref={viewHref}
        del={
          <DeleteButton
            action={deleteEventAction.bind(null, event.id)}
            question={`Ta bort ”${event.title}” från kalendern?`}
            backTo="/admin/kalender"
          >
            <p className="m-0">
              Det försvinner från kalendern, startsidan och kalenderprenumerationen. Det går inte att ångra.
            </p>
            {upcoming && !event.cancelled && (
              <p className="m-0">
                Blir det inte av? Kryssa hellre i <strong className="text-ink">Det här är inställt</strong> – då står
                det ”Inställt” i kalendern i stället för att det bara försvinner.
              </p>
            )}
          </DeleteButton>
        }
      />
    </AdminPage>
  );
}
