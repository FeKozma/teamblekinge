"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/components/admin/form-state";
import { boardOnly, checked, invalid, isISODate, published, saved, text } from "@/components/admin/server";
import { getEventSeries, getOneOffEvents, saveEventSeries, saveOneOffEvents } from "@/lib/content/events";
import { seriesDates, weekdayNames, type ClubEvent, type EventSeries } from "@/lib/data/events";
import { dayMonth, todayISO } from "@/lib/format";
import { cleanReason, newEventId, newSeriesId, readEventFields } from "./fields";

const gone = () => invalid({}, "Den finns inte längre – den kan ha tagits bort i en annan flik.");

// ───────────────────────── One-off events ─────────────────────────

/** Create (`id` null) or update a one-off event. A new event opens in its editor. */
export async function saveEventAction(id: string | null, data: FormData): Promise<FormState> {
  await boardOnly();
  const { fields, errors } = readEventFields(data);
  const date = text(data, "date");
  if (!isISODate(date)) errors.date = "Välj ett datum.";
  const cancelled = checked(data, "cancelled");
  const cancelReason = cleanReason(text(data, "cancelReason"));
  if (Object.keys(errors).length) return invalid(errors);

  const [events, series] = await Promise.all([getOneOffEvents(), getEventSeries()]);
  const event: ClubEvent = {
    id: id ?? newEventId(fields.title, date, events, series),
    date,
    ...fields,
    ...(cancelled && { cancelled: true, ...(cancelReason && { cancelReason }) }),
  };
  if (id) {
    const i = events.findIndex((e) => e.id === id && e.source !== "flode");
    if (i < 0) return gone();
    events[i] = event;
  } else {
    events.push(event);
  }
  await saveOneOffEvents(events);
  published();
  if (!id) redirect(`/admin/kalender/${event.id}?ny=1`);
  return saved(cancelled ? `Sparat. ${event.title} visas som inställt i kalendern.` : `Sparat. ${event.title} är uppdaterat i kalendern.`);
}

export async function deleteEventAction(id: string): Promise<FormState> {
  await boardOnly();
  const events = await getOneOffEvents();
  const event = events.find((e) => e.id === id && e.source !== "flode");
  if (!event) return gone();
  await saveOneOffEvents(events.filter((e) => e !== event));
  published();
  return saved(`${event.title} är borttaget från kalendern.`);
}

// ───────────────────────── Weekly sessions ─────────────────────────

/** Create (`id` null) or update a weekly series. A new series opens in its editor. */
export async function saveSeriesAction(id: string | null, data: FormData): Promise<FormState> {
  await boardOnly();
  const { fields, errors } = readEventFields(data);
  const weekday = Number(text(data, "weekday"));
  const from = text(data, "from");
  const until = text(data, "until");
  if (!(weekday >= 1 && weekday <= 7)) errors.weekday = "Välj vilken veckodag.";
  if (!isISODate(from)) errors.from = "Välj datum för första gången.";
  if (until && !isISODate(until)) errors.until = "Välj ett datum, eller lämna tomt.";
  else if (until && isISODate(from) && until < from) errors.until = "Sista gången kan inte vara före första gången.";
  if (Object.keys(errors).length) return invalid(errors);

  const today = todayISO();
  const [events, all] = await Promise.all([getOneOffEvents(), getEventSeries()]);
  const old = id ? all.find((s) => s.id === id) : undefined;
  if (id && !old) return gone();
  const next: EventSeries = {
    id: id ?? newSeriesId(fields.title, events, all),
    weekday,
    from,
    ...(until && { until }),
    ...fields,
  };
  if (seriesDates(next, today).length === 0) {
    return invalid({ until: `Det blir inget pass – det finns ingen ${weekdayNames[weekday - 1]} mellan datumen.` });
  }
  // Keep the cancellations that still fall on a session.
  const dates = new Set(seriesDates(next, today));
  const cancelled = old?.cancelled?.filter((c) => dates.has(c.date));
  if (cancelled?.length) next.cancelled = cancelled;

  await saveEventSeries(old ? all.map((s) => (s === old ? next : s)) : [...all, next]);
  published();
  if (!id) redirect(`/admin/kalender/aterkommande/${next.id}?ny=1`);
  return saved(`Sparat. Alla kommande ${next.title}-pass är uppdaterade i kalendern.`);
}

export async function deleteSeriesAction(id: string): Promise<FormState> {
  await boardOnly();
  const all = await getEventSeries();
  const series = all.find((s) => s.id === id);
  if (!series) return gone();
  await saveEventSeries(all.filter((s) => s !== series));
  published();
  return saved(`${series.title} och alla dess pass är borttagna från kalendern.`);
}

/** Call off one session of a series, with an optional reason. */
export async function cancelSessionAction(id: string, date: string, reason: string): Promise<FormState> {
  await boardOnly();
  const all = await getEventSeries();
  const series = all.find((s) => s.id === id);
  if (!series) return gone();
  if (!seriesDates(series, todayISO()).includes(date)) return invalid({ reason: "Det är inget pass det datumet." });
  const why = cleanReason(reason.slice(0, 200));
  series.cancelled = [
    ...(series.cancelled ?? []).filter((c) => c.date !== date),
    { date, ...(why && { reason: why }) },
  ].sort((a, b) => a.date.localeCompare(b.date));
  await saveEventSeries(all);
  published();
  return saved(`${series.title} ${dayMonth(date)} är inställt.`);
}

/** Undo a cancellation: the session is on again. */
export async function reinstateSessionAction(id: string, date: string): Promise<FormState> {
  await boardOnly();
  const all = await getEventSeries();
  const series = all.find((s) => s.id === id);
  if (!series) return gone();
  series.cancelled = series.cancelled?.filter((c) => c.date !== date);
  if (!series.cancelled?.length) delete series.cancelled;
  await saveEventSeries(all);
  published();
  return saved(`${series.title} ${dayMonth(date)} blir av som vanligt.`);
}
