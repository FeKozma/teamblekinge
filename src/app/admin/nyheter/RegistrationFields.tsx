"use client";

import { useState } from "react";
import { Field, fieldClass, ListEditor, TextInput, useFieldError } from "@/components/admin/form";
import { IconInfo } from "@/components/icons";
import type { Registration } from "@/lib/data/news";
import { ChoiceCards } from "./ChoiceCards";
import { defaultCta, regKinds, type RegKind } from "./options";

type Slot = NonNullable<Registration["slots"]>[number];
type Extra = NonNullable<Registration["extra"]>[number];

/**
 * The "Anmälan" part of the news editor: none, a link to another site, a
 * relay sign-up here, or volunteer passes. Every kind's fields stay in the
 * page while another kind is chosen, so switching back loses nothing; the
 * action only reads the chosen kind's fields.
 */
export function RegistrationFields({ initial }: { initial?: Registration }) {
  const [kind, setKind] = useState<RegKind | "">(initial?.kind ?? "");
  const [cta, setCta] = useState(initial?.cta ?? "");
  const slotsError = useFieldError("regSlots");
  const signedUp = initial?.registered ?? 0;

  function choose(next: RegKind | "") {
    // The button text follows the kind, unless the editor wrote their own.
    if (!cta || Object.values(defaultCta).includes(cta)) setCta(next ? defaultCta[next] : "");
    setKind(next);
  }

  return (
    <div className="flex flex-col gap-5">
      <ChoiceCards
        legend="Kan man anmäla sig?"
        name="regKind"
        options={regKinds}
        value={kind}
        onChange={choose}
        hint="Anmälan här och funktionärspass görs av inloggade medlemmar – gäster ser inte de rutorna."
      />

      {initial && signedUp > 0 && kind !== initial.kind && (
        <p className="m-0 flex items-start gap-2.5 rounded-[10px] border border-orange bg-orange-soft px-3.5 py-3 text-[14px]">
          <IconInfo size={18} className="mt-0.5 flex-none text-orange-dark" />
          <span>
            <strong>{signedUp} har redan anmält sig.</strong> Sparar du med ett annat val försvinner deras anmälningar
            från nyheten.
          </span>
        </p>
      )}

      <div hidden={!kind} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            type="date"
            label="Vilken dag gäller det?"
            name="regDate"
            defaultValue={initial?.date}
            hint="Visas i rutan, t.ex. ”Lördag 7 november”."
          />
          <TextInput
            type="date"
            label="Sista anmälningsdag"
            name="regDeadline"
            defaultValue={initial?.deadline}
            hint="Dagen efter stängs anmälan. Dagen syns under ”Kommande sista dagar” på Nyheter."
          />
        </div>

        <div hidden={kind !== "extern"}>
          <TextInput
            type="url"
            label="Länk till anmälan"
            name="regUrl"
            defaultValue={initial?.url}
            placeholder="https://"
            hint="Kopiera adressen till anmälningssidan, t.ex. på mittlopp.se."
          />
        </div>

        <div hidden={kind !== "stafett"} className="flex flex-col gap-1">
          <TextInput
            type="number"
            label="Antal platser"
            name="regCapacity"
            defaultValue={initial?.kind === "stafett" ? initial.capacity : undefined}
            hint={
              initial?.kind === "stafett" && signedUp
                ? `Hur många som kan anmäla sig. Hittills har ${signedUp} anmält sig.`
                : "Hur många som kan anmäla sig. Medlemmarna ser hur många platser som är tagna."
            }
            className="max-w-[260px]"
          />
        </div>

        <div hidden={kind !== "funktionar"} data-field="regSlots" className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold">Pass att välja mellan</span>
          <span className="-mt-1 text-[13px] text-muted">
            Ett kort per pass, t.ex. Vägvakt – 16 personer. Varje medlem väljer ett pass.
          </span>
          {slotsError && <span className="text-[13px] font-semibold text-[#b3261e]">{slotsError}</span>}
          <ListEditor<Slot>
            name="regSlots"
            initial={initial?.kind === "funktionar" ? (initial.slots ?? []) : []}
            newItem={{ id: "", label: "", capacity: 4, taken: 0 }}
            titleField="label"
            untitled="Nytt pass"
            addLabel="Lägg till ett pass"
            emptyText="Inga pass ännu."
            fields={[
              { name: "label", label: "Pass", placeholder: "t.ex. Vägvakt", span: 4 },
              { name: "capacity", label: "Antal personer", type: "number", span: 2 },
            ]}
          />
        </div>

        <Field
          label="Text på knappen"
          name="regCta"
          hint={
            kind === "extern"
              ? "Webbplatsens namn läggs till efter, t.ex. ”Till anmälan på mittlopp.se”."
              : "Det medlemmarna trycker på för att anmäla sig."
          }
        >
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              name="regCta"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder={kind ? defaultCta[kind] : undefined}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={`${fieldClass} max-w-[420px]`}
            />
          )}
        </Field>

        <div hidden={kind === "funktionar"} className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold">Mer information i rutan</span>
          <span className="-mt-1 text-[13px] text-muted">
            Frivilligt. T.ex. Start – 11:00, Jämjö. Datum och sista anmälningsdag visas alltid.
          </span>
          <ListEditor<Extra>
            name="regExtra"
            initial={initial?.kind !== "funktionar" ? (initial?.extra ?? []) : []}
            newItem={{ label: "", value: "" }}
            titleField="label"
            untitled="Ny rad"
            addLabel="Lägg till en rad"
            emptyText="Inga extra rader."
            fields={[
              { name: "label", label: "Rubrik", placeholder: "t.ex. Start", span: 2 },
              { name: "value", label: "Text", placeholder: "t.ex. 11:00, Jämjö", span: 4 },
            ]}
          />
        </div>

        <TextInput
          label="Tips under knappen"
          name="regHint"
          defaultValue={initial?.hint}
          hint="Frivilligt. T.ex. ”Kryssa i Delta i VSM när du anmäler dig.”"
        />
        <TextInput
          label="Kort namn under ”Kommande sista dagar”"
          name="regDeadlineTitle"
          defaultValue={initial?.deadlineTitle}
          hint="Frivilligt. T.ex. ”Kyrkstafetten, anmälan”. Lämnar du det tomt visas rubriken."
        />
      </div>
    </div>
  );
}
