import Link from "next/link";
import type { ReactNode } from "react";
import type { FormState } from "@/components/admin/form-state";
import { AdminForm, CheckboxField, FormSection, SelectInput, TextInput } from "@/components/admin/form";
import { IconEye } from "@/components/icons";
import { eventKindLabel, weekdayNames, type ClubEvent, type EventSeries } from "@/lib/data/events";
import { LinkPicker, type LinkGroup } from "./LinkPicker";

// The calendar's two editors: a one-off event, and a session that happens
// every week. Both read their fields with readEventFields() in the action.

const kindOptions = [
  { value: "", label: "Välj typ …" },
  ...Object.entries(eventKindLabel).map(([value, label]) => ({ value, label })),
];

const weekdayOptions = [
  { value: "", label: "Välj veckodag …" },
  ...weekdayNames.map((d, i) => ({ value: String(i + 1), label: d.charAt(0).toUpperCase() + d.slice(1) })),
];

type Action = (data: FormData) => Promise<FormState>;

/** The save bar's extras: a peek at the calendar, and "Ta bort". */
function SaveBarExtras({ viewHref, del }: { viewHref?: string; del?: ReactNode }) {
  return (
    <>
      {viewHref && (
        <Link
          href={viewHref}
          target="_blank"
          className="inline-flex min-h-12 items-center gap-1.5 px-2 text-[14px] font-semibold text-orange-dark"
        >
          <IconEye size={17} /> Visa i kalendern
          <span className="sr-only">(öppnas i ny flik)</span>
        </Link>
      )}
      {del}
    </>
  );
}

function Basics({ e }: { e: Partial<ClubEvent | EventSeries> }) {
  return (
    <>
      <TextInput
        label="Vad?"
        name="title"
        defaultValue={e.title}
        placeholder="Till exempel: Styrelsemöte"
        hint="Rubriken i kalendern. Kort och tydligt."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label="Typ"
          name="kind"
          defaultValue={e.kind ?? ""}
          options={kindOptions}
          hint="Styr färgen i kalendern och vilket filter den hamnar under."
        />
        <TextInput
          label="Plats"
          name="place"
          defaultValue={e.place}
          placeholder="Till exempel: Klubblokalen"
          hint="Skriv gärna adressen om det inte är i klubblokalen."
        />
      </div>
    </>
  );
}

function More({ e, links }: { e: Partial<ClubEvent | EventSeries>; links: LinkGroup[] }) {
  return (
    <FormSection title="Mer information" description="Allt här är valfritt.">
      <TextInput
        label="Kort beskrivning"
        name="note"
        defaultValue={e.note}
        placeholder="Till exempel: 8–10 km, ca 6 min/km"
        hint="En rad under rubriken i kalendern."
      />
      <LinkPicker groups={links} current={e.href} />
      <CheckboxField
        label="Bara för medlemmar"
        name="membersOnly"
        defaultChecked={e.membersOnly}
        hint="Syns bara för inloggade medlemmar – inte för besökare och inte i kalenderprenumerationen."
      />
    </FormSection>
  );
}

/** A one-off event: meeting, race, trip or extra training. */
export function EventForm({
  action,
  event = {},
  links,
  viewHref,
  del,
}: {
  action: Action;
  /** Empty for a new event. */
  event?: Partial<ClubEvent>;
  links: LinkGroup[];
  viewHref?: string;
  del?: ReactNode;
}) {
  const isNew = !event.id;
  return (
    <AdminForm
      action={action}
      submitLabel={isNew ? "Lägg in i kalendern" : "Spara ändringarna"}
      secondary={<SaveBarExtras viewHref={viewHref} del={del} />}
    >
      <FormSection title="Vad, var och när">
        <Basics e={event} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Datum" name="date" type="date" defaultValue={event.date} />
          <TextInput label="Tid" name="time" type="time" defaultValue={event.time} hint="När det börjar." />
        </div>
      </FormSection>
      <More e={event} links={links} />
      {!isNew && (
        <FormSection
          title="Inställt?"
          description="Hellre inställt än borttaget: händelsen ligger kvar i kalendern, överstruken och märkt ”Inställt”, så att ingen kommer i onödan. De som prenumererar på kalendern får ändringen automatiskt."
        >
          <CheckboxField label="Det här är inställt" name="cancelled" defaultChecked={event.cancelled} />
          <TextInput
            label="Orsak"
            name="cancelReason"
            defaultValue={event.cancelReason}
            placeholder="Till exempel: För få anmälda"
            hint="Valfritt. Visas i kalendern bredvid ”Inställt”."
          />
        </FormSection>
      )}
    </AdminForm>
  );
}

/** A session that happens every week, e.g. Tuesday intervals. */
export function SeriesForm({
  action,
  series = {},
  links,
  viewHref,
  del,
}: {
  action: Action;
  /** Empty for a new series. */
  series?: Partial<EventSeries>;
  links: LinkGroup[];
  viewHref?: string;
  del?: ReactNode;
}) {
  const isNew = !series.id;
  return (
    <AdminForm
      action={action}
      submitLabel={isNew ? "Lägg in i kalendern" : "Spara ändringarna"}
      savedHint={
        isNew
          ? "Passet läggs in varje vecka från första gången."
          : "Ändringar gäller alla pass – även de som redan ligger i kalendern."
      }
      secondary={<SaveBarExtras viewHref={viewHref} del={del} />}
    >
      <FormSection title="Vad och var">
        <Basics e={series} />
      </FormSection>
      <FormSection title="När" description="Passet läggs in i kalendern samma veckodag och tid varje vecka.">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Veckodag"
            name="weekday"
            defaultValue={series.weekday ? String(series.weekday) : ""}
            options={weekdayOptions}
          />
          <TextInput label="Tid" name="time" type="time" defaultValue={series.time} hint="När passet börjar." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Första gången"
            name="from"
            type="date"
            defaultValue={series.from}
            hint="Från och med det här datumet."
          />
          <TextInput
            label="Sista gången"
            name="until"
            type="date"
            defaultValue={series.until}
            hint="Till exempel terminens sista vecka. Lämna tomt om passet fortsätter tills vidare – då visas det ett halvår framåt."
          />
        </div>
      </FormSection>
      <More e={series} links={links} />
    </AdminForm>
  );
}
