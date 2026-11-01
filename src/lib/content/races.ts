import "server-only";
import { races, type Race } from "@/lib/data/races";
import { readCollection, writeCollection } from "./store";

/** The club's own races, as edited by the board. */
export const getRaces = () => readCollection<Race[]>("races", () => races);
export const saveRaces = (v: Race[]) => writeCollection("races", v);

export async function getRace(slug: string) {
  return (await getRaces()).find((r) => r.slug === slug);
}
