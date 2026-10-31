import { listNews } from "@/lib/data/news";

// Public news as RSS ("Nyheter via RSS" in the drawup). Members-only items are
// never included — a feed reader has no session.

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const items = listNews()
    .map((n) => {
      const url = `${origin}/nyheter/${n.slug}`;
      return [
        "<item>",
        `<title>${esc(n.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(`${n.date}T12:00:00Z`).toUTCString()}</pubDate>`,
        `<category>${esc(n.category)}</category>`,
        `<description>${esc(n.excerpt)}</description>`,
        "</item>",
      ].join("");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Team Blekinge Löparförening – Nyheter</title>
<link>${origin}/nyheter</link>
<description>Meddelanden från styrelsen, tränarna och arrangörerna.</description>
<language>sv</language>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
