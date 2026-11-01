import { redirect } from "next/navigation";
import { getArchive } from "@/lib/content/documents";
import { readUpload } from "@/lib/content/store";
import {
  canSee,
  docHref,
  folderLabel,
  kindLabels,
  longDateWithYear,
  resolveDocumentPath,
  viewerOf,
} from "@/lib/data/documents";
import { placeholderPdf } from "@/lib/pdf";
import { getSession } from "@/lib/session";

// The PDF behind a document page, e.g. /filer/dokument/protokoll/arsmote/2026-02-26.pdf.
// Opens in the browser's own PDF viewer; add ?ladda-ner to download it instead.
// Same rules as the page: a guest asking for a members-only document logs in
// first and lands on the document; board-only files don't exist for anyone
// else. Documents without an uploaded file (the seed) get a generated example.

const notFound = () =>
  new Response("Hittades inte", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

/** `inline; filename="Arsmote.pdf"; filename*=UTF-8''%C3%85rsm%C3%B6te.pdf` */
function disposition(kind: "inline" | "attachment", name: string) {
  const ascii = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(request: Request, { params }: RouteContext<"/filer/dokument/[...path]">) {
  const { path } = await params;
  const last = path.at(-1);
  if (!last?.endsWith(".pdf")) return notFound();

  const archive = await getArchive();
  const r = resolveDocumentPath(archive, [...path.slice(0, -1), last.slice(0, -".pdf".length)]);
  if (r?.kind !== "document") return notFound();

  const viewer = viewerOf(await getSession());
  if (!canSee(r.visibility, viewer)) {
    if (viewer === "guest" && r.visibility === "medlemmar") redirect(`/logga-in?next=${docHref(r.doc)}`);
    return notFound();
  }

  const d = r.doc;
  let bytes: Uint8Array;
  if (d.file) {
    const upload = await readUpload(d.file);
    if (!upload) return notFound();
    bytes = new Uint8Array(upload.bytes);
  } else {
    bytes = placeholderPdf({
      title: d.title,
      kind: kindLabels[d.kind],
      folder: folderLabel(archive.root, d.folder),
      uploaded: longDateWithYear(d.uploaded),
    });
  }

  const download = new URL(request.url).searchParams.has("ladda-ner");
  return new Response(bytes as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": disposition(download ? "attachment" : "inline", d.fileName),
      // Access depends on who asks, and in the demo the file lives in the
      // visitor's own sandbox — never cache it anywhere shared.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...(r.visibility === "alla" ? {} : { "X-Robots-Tag": "noindex" }),
    },
  });
}
