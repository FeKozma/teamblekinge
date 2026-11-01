"use server";

import { boardOnly, invalid, parseList, published, saved, tidy } from "@/components/admin/server";
import { saveBoard, saveOtherRoles } from "@/lib/content/club";
import type { BoardMember, RoleGroup } from "@/lib/data/club";

export async function saveBoardAction(data: FormData) {
  await boardOnly();
  const board = parseList<BoardMember>(data, "board").map(tidy);
  const roles = parseList<RoleGroup>(data, "roles").map(tidy);
  const errors: Record<string, string> = {};
  board.forEach((p, i) => {
    if (!p.name) errors[`board.${i}.name`] = "Skriv personens namn.";
    if (!p.role) errors[`board.${i}.role`] = "Skriv rollen, t.ex. Ledamot.";
  });
  roles.forEach((r, i) => {
    if (!r.title) errors[`roles.${i}.title`] = "Skriv vad kommittén eller uppdraget heter.";
    if (!r.names?.length) errors[`roles.${i}.names`] = "Skriv minst ett namn.";
  });
  if (Object.keys(errors).length) return invalid(errors);
  await Promise.all([
    saveBoard(board.map(({ name, role }) => ({ name, role }))),
    saveOtherRoles(roles.map(({ title, names }) => ({ title, names }))),
  ]);
  published();
  return saved("Styrelsen och de ansvariga är sparade.");
}
