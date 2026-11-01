"use server";

import { boardOnly, invalid, isISODate, isTime, parseList, published, saved, text, tidy } from "@/components/admin/server";
import { saveLongRuns, saveTermPlan, saveTrainingGroups } from "@/lib/content/training";
import { trainingGroupIds, type LongRun, type TermPlan, type TrainingGroup } from "@/lib/data/training";
import { weekday } from "@/lib/format";

const tones: TrainingGroup["tone"][] = ["ink", "orange", "purple"];

/** Groups, term plan and long runs are saved together: the page has one Spara. */
export async function saveTrainingAction(data: FormData) {
  await boardOnly();
  const errors: Record<string, string> = {};

  // Groups: fixed ids, every field edited in place.
  const groups: TrainingGroup[] = trainingGroupIds.map((id) => {
    const f = (field: string) => text(data, `${id}.${field}`);
    const g: TrainingGroup = {
      id,
      name: f("name"),
      short: f("short"),
      tone: f("tone") as TrainingGroup["tone"],
      time: f("time"),
      distance: f("distance"),
      suits: f("suits"),
      needs: f("needs")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      description: f("description"),
      requirement: f("requirement"),
    };
    if (!g.name) errors[`${id}.name`] = "Skriv gruppens namn.";
    if (!g.short) errors[`${id}.short`] = "Skriv ett kort namn, t.ex. ”Långa”.";
    if (!isTime(g.time)) errors[`${id}.time`] = "Skriv tiden som 18:00.";
    if (!tones.includes(g.tone)) errors[`${id}.tone`] = "Välj en färg.";
    if (!g.suits) errors[`${id}.suits`] = "Skriv vem gruppen passar.";
    if (!g.description) errors[`${id}.description`] = "Skriv en kort beskrivning.";
    return g;
  });

  // Term plan: one row per Tuesday.
  const rows = parseList<Record<string, string>>(data, "plan").map(tidy);
  const plan: TermPlan = {};
  rows.forEach((row, i) => {
    const date = row.date ?? "";
    if (!isISODate(date)) errors[`plan.${i}.date`] = "Välj ett datum.";
    else if (weekday(date) !== "tisdag") errors[`plan.${i}.date`] = `Det är en ${weekday(date)} – välj en tisdag.`;
    else if (plan[date]) errors[`plan.${i}.date`] = "Den här tisdagen finns redan i planen.";
    else
      plan[date] = Object.fromEntries(trainingGroupIds.map((id) => [id, row[id] ?? ""])) as TermPlan[string];
  });

  // Long runs, in date order.
  const runs = parseList<LongRun>(data, "longRuns").map(tidy);
  const seen = new Set<string>();
  runs.forEach((r, i) => {
    if (!isISODate(r.date ?? "")) errors[`longRuns.${i}.date`] = "Välj ett datum.";
    else if (seen.has(r.date)) errors[`longRuns.${i}.date`] = "Det finns redan ett långpass den dagen.";
    seen.add(r.date);
    if (!r.place) errors[`longRuns.${i}.place`] = "Skriv var ni samlas.";
  });

  if (Object.keys(errors).length) return invalid(errors);

  // One after the other: a visitor's first save creates their demo sandbox.
  await saveTrainingGroups(groups);
  await saveTermPlan(Object.fromEntries(Object.entries(plan).sort(([a], [b]) => a.localeCompare(b))));
  await saveLongRuns(
    runs
      .map(({ date, place, note }) => (note ? { date, place, note } : { date, place }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  );
  published();
  return saved("Träningen är sparad.");
}
