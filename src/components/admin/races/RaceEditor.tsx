import type { ReactNode } from "react";
import {
  AdminForm,
  FormSection,
  ImageField,
  ListEditor,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/admin/form";
import type { FormState } from "@/components/admin/form-state";
import type { Race } from "@/lib/data/races";
import { FeeLadderEditor } from "./FeeLadderEditor";
import { ListError } from "./ListError";

// Every field of a race, for /admin/lopp/[slug] and /admin/lopp/nytt. The
// action is saveRaceAction bound to the race's slug (null for a new race).

type Distance = Race["distances"][number];
type RecordRow = NonNullable<Race["records"]>[number];
type Related = NonNullable<Race["related"]>[number];
type ResultRow = { label: string; text: string; current: "ja" | "nej" };

const toneOptions: { value: Race["tone"]; label: string }[] = [
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Lila" },
];
const fitOptions: { value: NonNullable<Race["imageFit"]>; label: string }[] = [
  { value: "cover", label: "Foto – beskärs för att fylla ytan" },
  { value: "poster", label: "Affisch (kvadratisk) – visas hel på loppets sida" },
  { value: "contain", label: "Logga – visas hel på vit botten" },
];

export function RaceEditor({
  race,
  others,
  action,
  secondary,
  submitLabel,
}: {
  race?: Race;
  /** The club's other races, for "Hänger ihop med". */
  others: { slug: string; name: string }[];
  action: (data: FormData) => Promise<FormState>;
  secondary?: ReactNode;
  submitLabel: string;
}) {
  const results: ResultRow[] = (race?.results ?? []).map((r) => ({
    label: r.label,
    text: r.text,
    current: r.current ? "ja" : "nej",
  }));
  return (
    <AdminForm action={action} submitLabel={submitLabel} secondary={secondary}>
      <FormSection title="Loppet" description="Det som syns på loppets kort under Tävla och på startsidan, och överst på loppets egen sida.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <TextInput label="Namn" name="name" defaultValue={race?.name} className="md:col-span-6" />
          <TextInput
            label="Datum"
            name="date"
            type="date"
            defaultValue={race?.start.slice(0, 10)}
            hint="Datumet skrivs ut som ”Lördag 7 november 2026”."
            className="md:col-span-2"
          />
          <TextInput
            label="Första start"
            name="time"
            type="time"
            defaultValue={race?.start.slice(11, 16)}
            hint="Nedräkningen räknar ner till den här tiden."
            className="md:col-span-2"
          />
          <TextInput
            label="Plats"
            name="place"
            defaultValue={race?.place}
            placeholder="Jämjö Kunskapscentrum"
            className="md:col-span-2"
          />
          <TextInput
            label="Etikett ovanför namnet"
            name="kicker"
            defaultValue={race?.kicker}
            placeholder="Lördag 7 november 2026 · Jämjö"
            hint="Kort rad i versaler på kortet och överst på loppets sida."
            className="md:col-span-4"
          />
          <SelectInput
            label="Färg på etiketten"
            name="tone"
            defaultValue={race?.tone ?? "orange"}
            options={toneOptions}
            className="md:col-span-2"
          />
          <TextArea
            label="Sammanfattning"
            name="summary"
            defaultValue={race?.summary}
            rows={3}
            hint="Två, tre meningar om loppet. Visas på kortet och under namnet på loppets sida."
            className="md:col-span-6"
          />
          <TextInput
            label="Knapptext på kortet"
            name="cta"
            defaultValue={race?.cta ?? "Till loppet"}
            className="md:col-span-3"
          />
        </div>
      </FormSection>

      <FormSection title="Bild">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ImageField
            label="Bild på loppet"
            name="image"
            current={race?.image}
            contain={race?.imageFit !== "cover"}
            hint="JPG, PNG eller WebP, högst 10 MB. Ett liggande foto, en kvadratisk affisch eller en logga."
          />
          <div className="flex flex-col gap-4">
            <SelectInput
              label="Hur bilden visas"
              name="imageFit"
              defaultValue={race?.imageFit ?? "cover"}
              options={fitOptions}
            />
            <TextArea
              label="Beskrivning av bilden"
              name="imageAlt"
              defaultValue={race?.imageAlt}
              rows={2}
              hint="För den som inte ser bilden, t.ex. ”Löpare i starten på Kustmaran i Kristianopel”."
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Distanser och starttider"
        description="Tabellen på loppets sida, i den här ordningen. Den översta distansens starttid står också överst på sidan."
      >
        <TextInput
          label="Text under rubriken (frivillig)"
          name="feeNote"
          defaultValue={race?.feeNote}
          placeholder="Avgift vid föranmälan 2/10–31/10."
          hint="T.ex. vilken anmälningsperiod avgifterna gäller."
        />
        <ListEditor<Distance>
          name="distances"
          initial={race?.distances ?? []}
          newItem={{ name: "", start: "", fee: "", note: "" }}
          titleField="name"
          untitled="Ny distans"
          addLabel="Lägg till en distans"
          emptyText="Inga distanser ännu."
          fields={[
            { name: "name", label: "Distans", span: 3, placeholder: "21,1 km (4 varv)" },
            { name: "start", label: "Start", type: "time", span: 1 },
            { name: "fee", label: "Avgift (frivillig)", span: 2, placeholder: "500 kr" },
            { name: "note", label: "Notering (frivillig)", span: 6, placeholder: "utan tidtagning" },
          ]}
        />
        <ListError name="distances" />
      </FormSection>

      <FormSection
        title="Avgiftstrappa (frivillig)"
        description="För lopp där avgiften stiger närmare loppdagen: en kolumn per anmälningsperiod. Visas under distanserna."
      >
        <FeeLadderEditor name="feeLadder" initial={race?.feeLadder} />
      </FormSection>

      <FormSection title="Anmälan" description="Det orange bandet på loppets sida. Efter loppdagen står det att anmälan är stängd.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Text på anmälningsknappen"
            name="registration.label"
            defaultValue={race?.registration.label}
            placeholder="Anmäl dig på mittlopp.se"
            hint="Utan länk visas texten utan knapp, t.ex. ”Anmälan öppnar i januari”."
          />
          <TextInput
            label="Länk till anmälan (frivillig)"
            name="registration.url"
            type="url"
            defaultValue={race?.registration.url}
            placeholder="https://"
            hint="Webbadressen till anmälningssidan, t.ex. på mittlopp.se."
          />
          <TextArea
            label="Text om anmälan"
            name="registration.note"
            defaultValue={race?.registration.note}
            rows={3}
            hint="När anmälan stänger, efteranmälan och liknande."
          />
          <TextArea
            label="Tips under texten (frivilligt)"
            name="registration.tip"
            defaultValue={race?.registration.tip}
            rows={3}
            hint="Visas bara fram till loppdagen."
          />
        </div>
      </FormSection>

      <FormSection title="Bra att veta">
        <TextArea
          label="Fakta om loppet, en sak per rad"
          name="facts"
          defaultValue={race?.facts.join("\n")}
          rows={4}
          hint="Varje rad blir ett eget kort på loppets sida."
        />
      </FormSection>

      <FormSection
        title="Banrekord (frivilliga)"
        description="Visas på loppets sida och samlat under Resultat på Tävla."
      >
        <ListEditor<RecordRow>
          name="records"
          initial={race?.records ?? []}
          newItem={{ distance: "", name: "", club: "", time: "", year: new Date().getFullYear() }}
          titleField="name"
          untitled="Nytt banrekord"
          addLabel="Lägg till ett banrekord"
          emptyText="Inga banrekord inlagda."
          fields={[
            { name: "distance", label: "Distans", span: 2, placeholder: "42,2 km" },
            { name: "time", label: "Tid", span: 2, placeholder: "2:35:37" },
            { name: "year", label: "År", type: "number", span: 2 },
            { name: "name", label: "Namn", span: 3 },
            { name: "club", label: "Klubb", span: 3 },
          ]}
        />
      </FormSection>

      <FormSection
        title="Hänger ihop med"
        description="Andra lopp som hör ihop med det här, t.ex. ett mästerskap som avgörs i loppet. De visas först under Fler lopp, med din förklaring."
      >
        {others.length ? (
          <ListEditor<Related>
            name="related"
            initial={race?.related ?? []}
            newItem={{ slug: others[0].slug, text: "" }}
            titleField="text"
            untitled="Nytt samband"
            addLabel="Lägg till ett lopp som hänger ihop"
            emptyText="Inga andra lopp hänger ihop med det här."
            fields={[
              {
                name: "slug",
                label: "Lopp",
                type: "select",
                options: others.map((o) => ({ value: o.slug, label: o.name })),
                span: 2,
              },
              { name: "text", label: "Hur hänger de ihop?", type: "text", span: 4 },
            ]}
          />
        ) : (
          <p className="m-0 text-muted">Det finns inga andra lopp att koppla ihop med ännu.</p>
        )}
      </FormSection>

      <FormSection
        title="Resultat på sidan Tävla"
        description="Loppets ruta under Resultat, en rad per år. Raden för årets lopp visar ”Kommer” och datumet fram till loppdagen – lägg sedan in länk eller text om resultatet."
      >
        <ListEditor<ResultRow>
          name="results"
          initial={results}
          newItem={{ label: "", text: "", current: "nej" }}
          titleField="label"
          untitled="Ny rad"
          addLabel="Lägg till en rad"
          emptyText="Inga rader – loppet visas inte under Resultat."
          fields={[
            { name: "label", label: "År eller rubrik", span: 2, placeholder: "2026" },
            {
              name: "current",
              label: "Gäller raden årets lopp?",
              type: "select",
              options: [
                { value: "nej", label: "Nej, ett annat år" },
                { value: "ja", label: "Ja, årets lopp" },
              ],
              span: 4,
            },
            { name: "text", label: "Text (frivillig)", type: "text" },
          ]}
        />
      </FormSection>
    </AdminForm>
  );
}
