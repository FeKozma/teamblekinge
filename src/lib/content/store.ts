import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, utimes, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { connection } from "next/server";

// The site's editable content. Each collection (news, events, FAQs, page
// texts …) is one JSON file; until a collection is edited, its seed from
// src/lib/data is used. Swap this module for a database later; callers only
// see read/write.
//
// DEMO: every visitor gets a private sandbox. The first save creates a
// session cookie naming it, and that visitor's edits and uploads live in
// .data/sandboxes/<id>/ — nobody else sees them, and they are gone when the
// browser is closed (sandboxes idle for SANDBOX_TTL are deleted). On the real
// site the board's edits are of course seen by everyone.

const ROOT = process.env.CONTENT_DIR ?? path.join(process.cwd(), ".data");
const SANDBOXES = path.join(ROOT, "sandboxes");
const SANDBOX_COOKIE = "tb_demo_sandbox";
const SANDBOX_TTL = 12 * 60 * 60 * 1000;
/** Uploads allowed per visitor, so the demo can't fill the disk. */
const SANDBOX_UPLOAD_LIMIT = 50 * 1024 * 1024;

type Sandbox = { dir: string; content: string; files: string };

const sandboxAt = (id: string): Sandbox => {
  const dir = path.join(SANDBOXES, id);
  return { dir, content: path.join(dir, "content"), files: path.join(dir, "files") };
};

/** This visitor's sandbox, or null when they haven't saved anything yet. */
async function currentSandbox(): Promise<Sandbox | null> {
  const id = (await cookies()).get(SANDBOX_COOKIE)?.value;
  return id && /^[a-f0-9]{24}$/.test(id) ? sandboxAt(id) : null;
}

/**
 * This visitor's sandbox, created on first write. Only callable where cookies
 * can be set (server actions, route handlers).
 */
async function writableSandbox(): Promise<Sandbox> {
  const existing = await currentSandbox();
  if (existing) {
    await mkdir(existing.dir, { recursive: true });
    const now = new Date();
    await utimes(existing.dir, now, now);
    return existing;
  }
  const id = randomBytes(12).toString("hex");
  // No maxAge: a session cookie, so the sandbox ends with the browser session.
  (await cookies()).set(SANDBOX_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
  await sweepSandboxes();
  const sb = sandboxAt(id);
  await mkdir(sb.dir, { recursive: true });
  return sb;
}

/** Delete sandboxes nobody has written to for SANDBOX_TTL. */
async function sweepSandboxes() {
  let ids: string[];
  try {
    ids = await readdir(SANDBOXES);
  } catch {
    return;
  }
  const cutoff = Date.now() - SANDBOX_TTL;
  await Promise.all(
    ids.map(async (id) => {
      const dir = path.join(SANDBOXES, id);
      try {
        if ((await stat(dir)).mtimeMs < cutoff) await rm(dir, { recursive: true, force: true });
      } catch {
        // Gone already.
      }
    }),
  );
}

const memo = new Map<string, { mtimeMs: number; value: unknown }>();

const fileOf = (sb: Sandbox, key: string) => {
  if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Bad collection key: ${key}`);
  return path.join(sb.content, `${key}.json`);
};

/**
 * The stored value of a collection, or its seed. Always a fresh copy, so
 * callers may sort and modify it freely.
 */
export async function readCollection<T>(key: string, seed: () => T): Promise<T> {
  // Content can change at any time — never bake it into a prerendered page.
  await connection();
  const sb = await currentSandbox();
  if (!sb) return structuredClone(seed());
  const file = fileOf(sb, key);
  let mtimeMs: number;
  try {
    mtimeMs = (await stat(file)).mtimeMs;
  } catch {
    return structuredClone(seed());
  }
  const hit = memo.get(file);
  if (hit?.mtimeMs === mtimeMs) return structuredClone(hit.value as T);
  try {
    const value = JSON.parse(await readFile(file, "utf8")) as T;
    memo.set(file, { mtimeMs, value });
    return structuredClone(value);
  } catch {
    return structuredClone(seed());
  }
}

/** Replace a collection. Written atomically (temp file + rename). */
export async function writeCollection<T>(key: string, value: T) {
  const sb = await writableSandbox();
  const file = fileOf(sb, key);
  await mkdir(sb.content, { recursive: true });
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, file);
  memo.delete(file);
}

/** Whether a collection has been edited (false = still the seed). */
export async function isEdited(key: string) {
  const sb = await currentSandbox();
  if (!sb) return false;
  try {
    await stat(fileOf(sb, key));
    return true;
  } catch {
    return false;
  }
}

/** Forget this visitor's edits and uploads — the site goes back to its seed content. */
export async function resetContent() {
  const sb = await currentSandbox();
  if (!sb) return;
  await rm(sb.dir, { recursive: true, force: true });
  for (const k of memo.keys()) if (k.startsWith(sb.dir)) memo.delete(k);
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
  const sb = await writableSandbox();
  if ((await uploadedBytes(sb)) + buf.length > SANDBOX_UPLOAD_LIMIT) {
    throw new UploadError(
      `Demon tillåter högst ${SANDBOX_UPLOAD_LIMIT / 1024 / 1024} MB uppladdat per besök. Ta bort något först, eller återställ innehållet.`,
    );
  }
  const id = `${randomBytes(6).toString("hex")}.${sig.ext}`;
  await mkdir(sb.files, { recursive: true });
  await writeFile(path.join(sb.files, id), buf);
  return { id, name: file.name || id, bytes: buf.length, type: sig.type };
}

/** An uploaded file's bytes and type, or null. `id` comes from a URL — validated here. */
export async function readUpload(id: string) {
  const m = /^[a-f0-9]{12}\.([a-z]+)$/.exec(id);
  const type = m && typeByExt[m[1]];
  const sb = await currentSandbox();
  if (!type || !sb) return null;
  try {
    return { bytes: await readFile(path.join(sb.files, id)), type };
  } catch {
    return null;
  }
}

export async function deleteUpload(id: string) {
  const sb = await currentSandbox();
  if (!sb || !/^[a-f0-9]{12}\.[a-z]+$/.test(id)) return;
  await rm(path.join(sb.files, id), { force: true });
}

async function uploadedBytes(sb: Sandbox) {
  try {
    const names = await readdir(sb.files);
    const sizes = await Promise.all(names.map(async (n) => (await stat(path.join(sb.files, n))).size));
    return sizes.reduce((a, b) => a + b, 0);
  } catch {
    return 0;
  }
}

/**
 * URL of an uploaded image. PDFs are served with an access check instead (see
 * /dokument). Uploads live in the visitor's sandbox, which the image
 * optimizer can't see — render them with `unoptimized={isUploadUrl(src)}`
 * (lib/uploads.ts).
 */
export const uploadUrl = (id: string) => `/filer/${id}`;

/** "214 kB", "1,2 MB" */
export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}
