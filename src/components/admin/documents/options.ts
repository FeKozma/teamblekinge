import { allFolders, folderVisibility, kindLabels, type DocFolder, type DocKind } from "@/lib/data/documents";
import type { FolderOption } from "./fields";

/** Every folder for the folder picker: "Protokoll › Styrelsemöte 2026", with what it allows. */
export function folderOptions(root: DocFolder): FolderOption[] {
  return allFolders(root).map((f) => ({
    path: f.path.join("/"),
    label: f.titles.join(" › "),
    title: f.folder.title,
    limit: folderVisibility(root, f.path),
  }));
}

export const kindOptions = (Object.entries(kindLabels) as [DocKind, string][]).map(([value, label]) => ({
  value,
  label,
}));

/** A toast for what the previous page did, from the query it redirected with. */
export function flashFrom(
  q: Record<string, string | string[] | undefined>,
  /** The message for ?ny=<document id>. */
  uploaded?: (id: string) => string | undefined,
) {
  if (typeof q.ny === "string") return uploaded?.(q.ny);
  if (q.borttaget === "dokument") return "Dokumentet är borttaget.";
  if (q.borttaget === "mapp") return "Mappen är borttagen.";
  if (q.sparat === "mapp") return "Mappen är skapad.";
  if (q.sparat === "flyttat") return "Dokumentet är sparat och flyttat.";
  return undefined;
}
