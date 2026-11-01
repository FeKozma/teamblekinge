import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { DeleteRaceButton } from "@/components/admin/races/DeleteRaceButton";
import { RaceEditor } from "@/components/admin/races/RaceEditor";
import { getRaces } from "@/lib/content/races";
import { deleteRaceAction, saveRaceAction } from "../actions";

type Props = PageProps<"/admin/lopp/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const race = (await getRaces()).find((r) => r.slug === slug);
  return { title: race ? `${race.name} – Våra lopp` : "Våra lopp" };
}

export default async function AdminRacePage({ params, searchParams }: Props) {
  const [{ slug }, { skapat }] = await Promise.all([params, searchParams]);
  if (!(await requireBoard())) return null;
  const races = await getRaces();
  const race = races.find((r) => r.slug === slug);
  if (!race) notFound();

  return (
    <AdminPage
      title={race.name}
      intro="Allt om loppet: det som syns på korten under Tävla och på startsidan, och på loppets egen sida."
      crumbs={[{ title: "Våra lopp", href: "/admin/lopp" }]}
      publicHref={`/tavla/${race.slug}`}
      publicLabel="Visa loppets sida"
    >
      {skapat && (
        <p role="status" className="m-0 rounded-[10px] border border-line bg-white px-4 py-3 font-semibold">
          Loppet är skapat och syns nu under Tävla – i demon bara för dig.
        </p>
      )}
      <RaceEditor
        // A new image remounts the form, so the chosen file isn't uploaded again on the next save.
        key={`${race.slug}:${race.image}`}
        race={race}
        others={races.filter((r) => r.slug !== race.slug).map(({ slug, name }) => ({ slug, name }))}
        action={saveRaceAction.bind(null, race.slug)}
        submitLabel="Spara loppet"
        secondary={<DeleteRaceButton name={race.name} action={deleteRaceAction.bind(null, race.slug)} />}
      />
    </AdminPage>
  );
}
