import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";

// The site's editable content. Each collection (news, events, FAQs, page
// texts …) is one JSON file under .data/content; until the board edits a
// collection, its seed from src/lib/data is used. Uploaded files live in
// .data/files. Edits made in the admin reach this server and are seen by every
// visitor — that is the point: the board changes the site, not their browser.
// Swap this module for a database later; callers only see read/write.

const ROOT = process.env.CONTENT_DIR ?? path.join(process.cwd(), ".data");
const CONTENT = path.join(ROOT, "content");
const FILES = path.join(ROOT, "files");

const memo = new Map<string, { mtimeMs: number; value: unknown }>();

const fileOf = (key: string) => {
  if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Bad collection key: ${key}`);
  return path.join(CONTENT, `${key}.json`);
};

/**
 * The stored value of a collection, or its seed. Always a fresh copy, so
 * callers may sort and modify it freely.
 */
export async function readCollection<T>(key: string, seed: () => T): Promise<T> {
  // Content can change at any time — never bake it into a prerendered page.
  await connection();
  const file = fileOf(key);
  let mtimeMs: number;
  try {
    mtimeMs = (await stat(file)).mtimeMs;
  } catch {
    return structuredClone(seed());
  }
  const hit = memo.get(key);
  if (hit?.mtimeMs === mtimeMs) return structuredClone(hit.value as T);
  try {
    const value = JSON.parse(await readFile(file, "utf8")) as T;
    memo.set(key, { mtimeMs, value });
    return structuredClone(value);
  } catch {
    return structuredClone(seed());
  }
}

/** Replace a collection. Written atomically (temp file + rename). */
export async function writeCollection<T>(key: string, value: T) {
  const file = fileOf(key);
  await mkdir(CONTENT, { recursive: true });
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, file);
  memo.delete(key);
}

/** Whether the board has edited a collection (false = still the seed). */
export async function isEdited(key: string) {
  try {
    await stat(fileOf(key));
    return true;
  } catch {
    return false;
  }
}

/** Forget every edit and upload — the site goes back to its seed content. */
export async function resetContent() {
  await rm(CONTENT, { recursive: true, force: true });
  await rm(FILES, { recursive: true, force: true });
  memo.clear();
}

// ───────────────────────── Uploaded files ─────────────────────────

export type FileKind = "pdf" | "image";

export type StoredFile = {
  /** File name on disk, e.g. "k3f9a1c2e0.pdf" — also the id used in URLs. */
  id: string;
  /** The name it had on the uploader's computer. */
  name: string;
  bytes: number;
  type: string;
};

const signatures: { kind: FileKind; type: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { kind: "pdf", type: "application/pdf", ext: "pdf", test: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  { kind: "image", type: "image/png", ext: "png", test: (b) => b.readUInt32BE(0) === 0x89504e47 },
  { kind: "image", type: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    kind: "image",
    type: "image/webp",
    ext: "webp",
    test: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
];

const typeByExt: Record<string, string> = Object.fromEntries(signatures.map((s) => [s.ext, s.type]));

export class UploadError extends Error {}

/**
 * Store an uploaded file after checking what it really is (by its first
 * bytes, not its name). Throws UploadError with a message fit for the form.
 */
export async function saveUpload(
  file: File,
  { kinds, maxBytes = 10 * 1024 * 1024 }: { kinds: FileKind[]; maxBytes?: number },
): Promise<StoredFile> {
  if (!file.size) throw new UploadError("Filen är tom.");
  if (file.size > maxBytes) {
    throw new UploadError(`Filen är för stor – högst ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const sig = signatures.find((s) => kinds.includes(s.kind) && buf.length >= 12 && s.test(buf));
  if (!sig) {
    throw new UploadError(
      kinds.includes("pdf") && kinds.length === 1
        ? "Filen är ingen PDF. Spara dokumentet som PDF och försök igen."
        : "Filtypen stöds inte. Använd en bild i JPG, PNG eller WebP.",
    );
  }
  const id = `${randomBytes(6).toString("hex")}.${sig.ext}`;
  await mkdir(FILES, { recursive: true });
  await writeFile(path.join(FILES, id), buf);
  return { id, name: file.name || id, bytes: buf.length, type: sig.type };
}

/** An uploaded file's bytes and type, or null. `id` comes from a URL — validated here. */
export async function readUpload(id: string) {
  const m = /^[a-f0-9]{12}\.([a-z]+)$/.exec(id);
  const type = m && typeByExt[m[1]];
  if (!type) return null;
  try {
    return { bytes: await readFile(path.join(FILES, id)), type };
  } catch {
    return null;
  }
}

export async function deleteUpload(id: string) {
  if (!/^[a-f0-9]{12}\.[a-z]+$/.test(id)) return;
  await rm(path.join(FILES, id), { force: true });
}

/** Number of stored uploads (for the admin's reset dialog). */
export async function uploadCount() {
  try {
    return (await readdir(FILES)).length;
  } catch {
    return 0;
  }
}

/** Public URL of an uploaded image. PDFs are served with an access check instead (see /dokument). */
export const uploadUrl = (id: string) => `/filer/${id}`;

/** "214 kB", "1,2 MB" */
export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}
