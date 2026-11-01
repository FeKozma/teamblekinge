import { readUpload } from "@/lib/content/store";

// Uploaded images (news photos, sponsor logos), shown on public pages. In the
// demo they live in the visitor's own sandbox, so only that visitor gets them.
// PDFs are never served from here — documents go through /dokument, which
// checks who may open them.
export async function GET(_request: Request, { params }: RouteContext<"/filer/[id]">) {
  const file = await readUpload((await params).id);
  if (!file || !file.type.startsWith("image/")) return new Response("Hittades inte", { status: 404 });
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
