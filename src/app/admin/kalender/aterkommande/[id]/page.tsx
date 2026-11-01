import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { Created } from "@/components/admin/calendar/Created";
import { DeleteButton } from "@/components/admin/calendar/DeleteButton";
import { SeriesForm } from "@/components/admin/calendar/EventForm";
import { Sessions } from "@/components/admin/calendar/Sessions";
import { FormSection } from "@/components/admin/form";
import { getEventSeries } from "@/lib/content/events";
import { seriesEvents, weekdayPlural } from "@/lib/data/events";
import { dayMonth, todayISO } from "@/lib/format";
import { deleteSeriesAction, saveSeriesAction } from "../../actions";
import { linkGroups } from "../../fields";

type Props = PageProps<"/admin/kalender/aterkommande/[id]">;

const findSeries = async (id: string) => (await getEventSeries()).find((s) => s.id === id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await findSeries(id))?.title ?? "Kalender" };
}

export default async function EditSeriesPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ny, datum } = await searchParams;
  if (!(await requireBoard())) return null;
  const series = await findSeries(id);
  if (!series) notFound();

  const today = todayISO();
  const coming = seriesEvents(series, today).filter((e) => e.date >= today);
  const when = `${weekdayPlural(series.weekday)} kl. ${series.time}`;
  const viewHref = coming[0] ? `/kalender#dag-${coming[0].date}` : "/kalender";

  return (
    <AdminPage
      title={series.title}
      intro={`${when.charAt(0).toUpperCase() + when.slice(1)} · ${series.place}`}
      crumbs={[{ title: "Kalender", href: "/admin/kalender" }]}
      publicHref={viewHref}
      publicLabel="Visa i kalendern"
    >
      {ny && (
        <Created title={series.title} viewHref={viewHref} againHref="/admin/kalender/aterkommande/ny">
          Varje vecka, {when}
          {coming[0] && <>, första gången {dayMonth(coming[0].date)}</>}. Det syns direkt i kalendern på webbplatsen – i
          demon bara för dig. Behöver ett pass ställas in gör du det längre ner.
        </Created>
      )}

      <FormSection
        title="Ställ in ett pass"
        description={
          <>
            Blir ett pass inte av? Välj datumet. Passet ligger kvar i kalendern, överstruket och märkt ”Inställt”, med
            orsaken du skriver. De som prenumererar på kalendern får ändringen automatiskt i sin kalenderapp.
          </>
        }
      >
        <Sessions
          seriesId={series.id}
          time={series.time}
          today={today}
          focus={typeof datum === "string" ? datum : undefined}
          sessions={coming.map((e) => ({
            date: e.date,
            ...(e.cancelled && { cancelled: true, reason: e.cancelReason }),
          }))}
        />
      </FormSection>

      <h2 className="m-0 mt-4 flex items-center gap-3 text-[22px] font-extrabold" data-reveal>
        <span aria-hidden="true" className="skew-bar h-3.5 w-6 bg-orange" />
        Ändra passet
      </h2>
      <SeriesForm
        key={series.id}
        action={saveSeriesAction.bind(null, series.id)}
        series={series}
        links={await linkGroups()}
        viewHref={viewHref}
        del={
          <DeleteButton
            action={deleteSeriesAction.bind(null, series.id)}
            question={`Ta bort ${series.title} från kalendern?`}
            backTo="/admin/kalender"
          >
            <p className="m-0">
              Alla {series.title}-pass försvinner ur kalendern, även de som redan varit. Det går inte att ångra.
            </p>
            <p className="m-0">
              Ska passet bara ta uppehåll? Sätt hellre <strong className="text-ink">Sista gången</strong>, eller ställ in
              enstaka pass.
            </p>
          </DeleteButton>
        }
      />
    </AdminPage>
  );
}
