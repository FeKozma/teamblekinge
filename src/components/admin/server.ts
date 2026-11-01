import "server-only";
import { revalidatePath } from "next/cache";
import { saveUpload, UploadError, uploadUrl } from "@/lib/content/store";
import { getSession } from "@/lib/session";
import type { FormState } from "./form-state";

// Helpers for admin server actions. Every action is a public endpoint, so each
// one starts with `await boardOnly()`.

export class NotBoardError extends Error {}

/** The logged-in board member, or throw. */
export async function boardOnly() {
  const user = await getSession();
  if (user?.role !== "board") throw new NotBoardError("Bara styrelsen kan ändra innehållet.");
  return user;
}

/** After a save: every page may show the changed content, so refresh them all. */
export function published() {
  revalidatePath("/", "layout");
}

export const saved = (message: string): FormState => ({ ok: true, message });

export const invalid = (errors: Record<string, string>, message?: string): FormState => ({
  ok: false,
  errors,
  message,
});

/** A trimmed text field ("" when missing). */
export function text(data: FormData, name: string) {
  const v = data.get(name);
  return typeof v === "string" ? v.trim() : "";
}

/** A checkbox field. */
export const checked = (data: FormData, name: string) => data.get(name) === "on";

/** The JSON list posted by <ListEditor name=…>. */
export function parseList<T>(data: FormData, name: string): T[] {
  try {
    const v = JSON.parse(String(data.get(name) ?? "[]"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Trim every string in a list row; drop empty lines in string arrays. */
export function tidy<T extends object>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string") out[k] = v.trim();
    else if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v.map((x) => x.trim()).filter(Boolean);
    else out[k] = v;
  }
  return out as T;
}

export const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const isUrl = (s: string) => /^https?:\/\/[^\s]+$/.test(s);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/** "Kyrkstafetten 2026!" → "kyrkstafetten-2026" */
export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[åä]/g, "a")
      .replace(/ö/g, "o")
      .replace(/é/g, "e")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "sida"
  );
}

/**
 * The image from an <ImageField name=…>: a newly chosen file is stored and its
 * URL returned; otherwise the current URL ("" when removed).
 */
export async function imageFrom(data: FormData, name: string): Promise<{ url: string } | { error: string }> {
  const file = data.get(`${name}__file`);
  if (file instanceof File && file.size > 0) {
    try {
      return { url: uploadUrl((await saveUpload(file, { kinds: ["image"] })).id) };
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      throw e;
    }
  }
  return { url: text(data, name) };
}

/**
 * Store images chosen in a <ListEditor> "image" field and put their URLs in
 * the rows. Returns errors keyed like other list errors.
 */
export async function resolveListImages<T extends object>(data: FormData, list: string, rows: T[], field: keyof T & string) {
  const errors: Record<string, string> = {};
  for (const [i, row] of rows.entries()) {
    const r = row as Record<string, unknown>;
    const inputName = r[`${field}__upload`];
    delete r[`${field}__upload`];
    if (typeof inputName !== "string") continue;
    const file = data.get(inputName);
    if (!(file instanceof File) || !file.size) continue;
    try {
      r[field] = uploadUrl((await saveUpload(file, { kinds: ["image"] })).id);
    } catch (e) {
      if (e instanceof UploadError) errors[`${list}.${i}.${field}`] = e.message;
      else throw e;
    }
  }
  return errors;
}
