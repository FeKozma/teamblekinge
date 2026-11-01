import "server-only";
import {
  byStart,
  eventSeries,
  oneOffEvents,
  seriesEvents,
  upcomingIn,
  type ClubEvent,
  type EventSeries,
} from "@/lib/data/events";
import { todayISO } from "@/lib/format";
import { readCollection, writeCollection } from "./store";

const KEY = "events";
const SERIES_KEY = "event-series";

/** One-off events (meetings, races, trips) as last saved in the admin. */
export function getOneOffEvents() {
  return readCollection<ClubEvent[]>(KEY, () => oneOffEvents);
}

export function saveOneOffEvents(items: ClubEvent[]) {
  return writeCollection(KEY, items);
}

/** Weekly sessions (Tuesday intervals, the Thursday group …) as last saved in the admin. */
export function getEventSeries() {
  return readCollection<EventSeries[]>(SERIES_KEY, () => eventSeries);
}

export function saveEventSeries(items: EventSeries[]) {
  return writeCollection(SERIES_KEY, items);
}

/**
 * The whole calendar — weekly sessions plus one-off events — in date order.
 * Cancelled ones are left out unless `cancelled` is set (the calendar page
 * and its feed show them as "Inställt").
 */
export async function getEvents(opts: { cancelled?: boolean } = {}) {
  const today = todayISO();
  const [series, oneOff] = await Promise.all([getEventSeries(), getOneOffEvents()]);
  const all = [...series.flatMap((s) => seriesEvents(s, today)), ...oneOff].sort(byStart);
  return opts.cancelled ? all : all.filter((e) => !e.cancelled);
}

/** Upcoming events from `today` (inclusive), optionally hiding members-only ones. */
export async function upcomingEvents(
  today: string,
  opts: { limit?: number; members?: boolean; cancelled?: boolean } = {},
) {
  return upcomingIn(await getEvents({ cancelled: opts.cancelled }), today, opts);
}
