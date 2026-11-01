import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, ListEditor, SelectInput, TextArea, TextInput } from "@/components/admin/form";
import { TermPlanEditor } from "@/components/admin/training/TermPlanEditor";
import { Pill } from "@/components/ui";
import { getLongRuns, getTermPlan, getTrainingGroups } from "@/lib/content/training";
import type { LongRun, TrainingGroup } from "@/lib/data/training";
import { todayISO } from "@/lib/format";
import { saveTrainingAction } from "./actions";

export const metadata: Metadata = { title: "Träning" };

const toneOptions: { value: TrainingGroup["tone"]; label: string }[] = [
  { value: "ink", label: "Mörk" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Lila" },
];
const toneBar = { ink: "bg-ink", orange: "bg-orange", purple: "bg-purple" } as const;

export default async function AdminTrainingPage() {
  if (!(await requireBoard())) return null;
  const [groups, plan, runs] = await Promise.all([getTrainingGroups(), getTermPlan(), getLongRuns()]);
  const today = todayISO();
  const rows = Object.entries(plan)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, texts]) => ({ date, texts }));

  return (
    <AdminPage
      title="Träning"
      intro="Träningsgrupperna, terminsplanen för tisdagarna och årets långpass. De visas under Träna med oss och under Veckans träning på startsidan."
      publicHref="/trana-med-oss"
      publicLabel="Visa Träna med oss"
    >
      <p className="m-0 -mt-2 text-[14px] text-muted">
        Rubriker och övriga texter på sidan ändrar du under{" "}
        <Link href="/admin/sidor/trana-med-oss" className="font-semibold">
          Sidtexter › Träna med oss
        </Link>
        .
      </p>
      <AdminForm action={saveTrainingAction} submitLabel="Spara träningen">
        <FormSection
          title="Träningsgrupperna"
          description="Du kan ändra allt om de tre grupperna, men inte lägga till eller ta bort en grupp. Sidan är byggd kring just tre: Hälsagruppen har en egen del på Träna med oss, och terminsplanen har en kolumn per grupp. Behöver ni en grupp till – hör av er till webbansvarig."
        >
          <div className="flex flex-col gap-5">
            {groups.map((g) => (
              <GroupFields key={g.id} group={g} />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Terminsplan"
          description="Kvällens pass för varje grupp, en rad per tisdag. Tisdagar som har varit visas inte på webbplatsen. Lämnar du en grupps ruta tom syns gruppen inte den kvällen."
        >
          <TermPlanEditor
            name="plan"
            initial={rows}
            today={today}
            groups={groups.map(({ id, name, short, tone }) => ({ id, name, short, tone }))}
          />
        </FormSection>

        <FormSection
          title="Långpass"
          description="Ett långpass i månaden, från olika samlingsplatser. Listan sorteras efter datum när du sparar, och året i rubriken på sidan följer det första datumet."
        >
          <ListEditor<LongRun>
            name="longRuns"
            initial={runs}
            newItem={{ date: "", place: "", note: "" }}
            titleField="place"
            untitled="Nytt långpass"
            addLabel="Lägg till ett långpass"
            emptyText="Inga långpass inlagda."
            fields={[
              { name: "date", label: "Datum", type: "date", span: 2 },
              { name: "place", label: "Samlingsplats", span: 2, placeholder: "Klubblokalen" },
              { name: "note", label: "Notering (frivillig)", span: 2, placeholder: "kvällspass" },
            ]}
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}

function GroupFields({ group: g }: { group: TrainingGroup }) {
  const n = (field: string) => `${g.id}.${field}`;
  return (
    <fieldset className="relative m-0 flex min-w-0 flex-col gap-4 overflow-hidden rounded-[10px] border border-line bg-paper/60 p-4 pt-6">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${toneBar[g.tone]}`} />
      <legend className="sr-only">{g.name}</legend>
      <div aria-hidden="true">
        <Pill tone={g.tone}>{g.name}</Pill>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <TextInput label="Namn" name={n("name")} defaultValue={g.name} className="md:col-span-3" />
        <TextInput
          label="Kort namn"
          name={n("short")}
          defaultValue={g.short}
          hint="I de små etiketterna, t.ex. i terminsplanen."
          className="md:col-span-3"
        />
        <TextInput
          label="Samlingstid på tisdagar"
          name={n("time")}
          type="time"
          defaultValue={g.time}
          hint="Visas på korten och i terminsplanen."
          className="md:col-span-2"
        />
        <SelectInput
          label="Färg"
          name={n("tone")}
          defaultValue={g.tone}
          options={toneOptions}
          hint="Etiketten och kanten på kortet."
          className="md:col-span-2"
        />
        <TextInput
          label="Distans"
          name={n("distance")}
          defaultValue={g.distance}
          hint="T.ex. ”ca 10 km”, uppe till höger på kortet."
          className="md:col-span-2"
        />
      </div>
      <p className="m-0 text-[13px] font-bold tracking-[0.5px] text-muted uppercase">Under Träna med oss</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextArea label="Vem gruppen passar" name={n("suits")} defaultValue={g.suits} rows={3} />
        <TextArea
          label="Krav, en punkt per rad"
          name={n("needs")}
          defaultValue={g.needs.join("\n")}
          rows={3}
          hint="Visas som en lista med bockar."
        />
      </div>
      <p className="m-0 text-[13px] font-bold tracking-[0.5px] text-muted uppercase">På startsidan</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextArea label="Kort beskrivning" name={n("description")} defaultValue={g.description} rows={2} />
        <TextArea
          label="Krav i en mening"
          name={n("requirement")}
          defaultValue={g.requirement}
          rows={2}
          hint="Står direkt efter beskrivningen."
        />
      </div>
    </fieldset>
  );
}
