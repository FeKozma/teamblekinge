import "server-only";
import { byStart, oneOffEvents, recurringEvents, upcomingIn, type ClubEvent } from "@/lib/data/events";
import { readCollection, writeCollection } from "./store";

const KEY = "events";

/** One-off events (meetings, races, trips) as last saved in the admin. */
export function getOneOffEvents() {
  return readCollection<ClubEvent[]>(KEY, () => oneOffEvents);
}

export function saveOneOffEvents(items: ClubEvent[]) {
  return writeCollection(KEY, items);
}

/** The whole calendar — recurring sessions plus one-off events — in date order. */
export async function getEvents() {
  return [...recurringEvents(), ...(await getOneOffEvents())].sort(byStart);
}

/** Upcoming events from `today` (inclusive), optionally hiding members-only ones. */
export async function upcomingEvents(today: string, opts: { limit?: number; members?: boolean } = {}) {
  return upcomingIn(await getEvents(), today, opts);
}
