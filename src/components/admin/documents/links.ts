import type { DocRef } from "@/lib/data/documents";

// Admin URLs for the archive. /admin/dokument/<folders…>[/<document>] mirrors
// the public /dokument/…, so "Ändra den här sidan" lands in the right place;
// the root has an alias since /admin/dokument opens the board's working folder.

export const adminFolderHref = (path: string[]) =>
  path.length ? `/admin/dokument/${path.join("/")}` : "/admin/dokument/mappar";

/** The document's edit page. */
export const adminDocHref = (d: DocRef) => `/admin/dokument/${[...d.folder, d.slug].join("/")}`;

export const adminUploadHref = (path: string[]) =>
  path.length ? `/admin/dokument/ladda-upp/${path.join("/")}` : "/admin/dokument/ladda-upp";

export const adminNewFolderHref = (parent: string[]) =>
  parent.length ? `/admin/dokument/ny-mapp/${parent.join("/")}` : "/admin/dokument/ny-mapp";

export const adminEditFolderHref = (path: string[]) => `/admin/dokument/mapp/${path.join("/")}`;

/** Paths under /admin/dokument that aren't folders — no top-level folder may take these. */
export const reservedSlugs = ["mappar", "ladda-upp", "ny-mapp", "mapp"];
