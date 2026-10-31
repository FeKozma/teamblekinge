"use client";

import { useSyncExternalStore } from "react";
import { useDemoState } from "@/lib/demo-store";
import { samePath, type UploadedDoc } from "@/lib/data/documents";

// Protocols "uploaded" in the admin demo. They live in this browser only
// (localStorage via useDemoState) and show up in the admin table and on the
// public document pages, marked as demo uploads.

const KEY = "dokument-uppladdningar";
const NONE: UploadedDoc[] = [];

export function useUploadedDocs() {
  return useDemoState<UploadedDoc[]>(KEY, NONE);
}

export function uploadsIn(uploads: UploadedDoc[], path: string[]) {
  return uploads.filter((u) => samePath(u.folder, path));
}

/** Folders (beyond `path`) that only exist because of demo uploads. */
export function uploadedSubfolders(uploads: UploadedDoc[], path: string[], known: string[]) {
  const seen = new Map<string, { slug: string; title: string; count: number }>();
  for (const u of uploads) {
    if (u.folder.length <= path.length || !path.every((s, i) => u.folder[i] === s)) continue;
    const slug = u.folder[path.length];
    if (known.includes(slug)) continue;
    const hit = seen.get(slug);
    if (hit) hit.count++;
    else seen.set(slug, { slug, title: u.folderTitles[path.length] ?? slug, count: 1 });
  }
  return [...seen.values()];
}

const noop = () => () => {};

/** False during SSR and hydration, true afterwards — localStorage is readable. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
