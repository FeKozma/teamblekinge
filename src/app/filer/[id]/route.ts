import { readUpload } from "@/lib/content/store";

// Uploaded images (news photos, sponsor logos). Public: they are shown on
// public pages. PDFs are never served from here — documents go through
// /dokument, which checks who may open them.
export async function GET(_request: Request, { params }: RouteContext<"/filer/[id]">) {
  const file = await readUpload((await params).id);
  if (!file || !file.type.startsWith("image/")) return new Response("Hittades inte", { status: 404 });
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
