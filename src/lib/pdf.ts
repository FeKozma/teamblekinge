// Tiny PDF helpers with no dependencies (usable on the server and in the
// browser): a generated one-page example PDF for documents that have no real
// file in the demo, and a rough page counter for uploads.

// Glyph widths (per 1000 em) of the built-in Helvetica fonts, ASCII 32–126.
// prettier-ignore
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
// prettier-ignore
const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

// Windows-1252 has a few typographic characters where Latin-1 has controls.
const WIN_ANSI_EXTRA: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "„": 0x84, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93,
  "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "™": 0x99, "‹": 0x8b, "›": 0x9b,
};
const EXTRA_WIDTH: Record<number, number> = {
  0x80: 556, 0x82: 222, 0x84: 333, 0x85: 1000, 0x91: 222, 0x92: 222, 0x93: 333,
  0x94: 333, 0x95: 350, 0x96: 556, 0x97: 1000, 0x99: 1000, 0x8b: 333, 0x9b: 333,
};

type Font = "regular" | "bold";

/** A string as WinAnsi bytes, one char per byte ("?" for what it can't encode). */
function winAnsi(s: string) {
  let out = "";
  for (const ch of s.normalize("NFC")) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x20 && c < 0x7f) || (c >= 0xa0 && c <= 0xff)) out += ch;
    else if (WIN_ANSI_EXTRA[ch]) out += String.fromCharCode(WIN_ANSI_EXTRA[ch]);
    else out += "?";
  }
  return out;
}

function charWidth(code: number, font: Font) {
  const table = font === "bold" ? HELVETICA_BOLD : HELVETICA;
  if (code >= 32 && code <= 126) return table[code - 32];
  if (EXTRA_WIDTH[code]) return EXTRA_WIDTH[code];
  // Accented Latin-1 letters are as wide as their base letter.
  const base = String.fromCharCode(code).normalize("NFD").charCodeAt(0);
  if (base >= 32 && base <= 126) return table[base - 32];
  return 556;
}

/** Width in points of WinAnsi text. */
function textWidth(s: string, size: number, font: Font, tracking = 0) {
  let w = 0;
  for (let i = 0; i < s.length; i++) w += charWidth(s.charCodeAt(i), font);
  return (w * size) / 1000 + tracking * s.length;
}

/** Break WinAnsi text into lines no wider than `max` points. */
function wrap(s: string, size: number, font: Font, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of s.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size, font) <= max) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    // A single word wider than the line is cut where it must.
    let rest = word;
    while (textWidth(rest, size, font) > max) {
      let n = rest.length - 1;
      while (n > 1 && textWidth(rest.slice(0, n), size, font) > max) n--;
      lines.push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    line = rest;
  }
  if (line) lines.push(line);
  return lines;
}

const esc = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
const n = (v: number) => (Math.round(v * 100) / 100).toString();

const INK = "0.133 0.118 0.122";
const ORANGE = "0.933 0.537 0.082";
const ORANGE_DARK = "0.659 0.329 0";
const MUTED = "0.373 0.341 0.329";
const PAPER = "0.957 0.949 0.941";
const LINE = "0.894 0.878 0.863";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT = 56;
const RIGHT = PAGE_W - 56;

/**
 * A one-page A4 PDF standing in for a document that has no file in the demo:
 * the club's letterhead, the document's title and type, and a clear note that
 * this is an example. Nothing about the document's contents is made up.
 */
export function placeholderPdf({
  title,
  kind,
  folder,
  uploaded,
}: {
  title: string;
  /** "Protokoll" */
  kind: string;
  /** "Protokoll › Styrelsemöte 2026" */
  folder: string;
  /** "24 oktober 2026" */
  uploaded: string;
}): Uint8Array {
  const ops: string[] = [];
  // Character spacing (Tc) outlives BT…ET, so every run sets it.
  const text = (s: string, x: number, y: number, size: number, font: Font, color: string, tracking = 0) =>
    ops.push(
      `BT /${font === "bold" ? "F2" : "F1"} ${size} Tf ${color} rg ${tracking} Tc ${n(x)} ${n(y)} Td (${esc(s)}) Tj ET`,
    );
  /** A parallelogram leaning right, like the site's skewed accent bars. */
  const skewBar = (x: number, y: number, w: number, h: number, lean: number, color: string) =>
    ops.push(`${color} rg ${n(x + lean)} ${n(y + h)} m ${n(x + w + lean)} ${n(y + h)} l ${n(x + w)} ${n(y)} l ${n(x)} ${n(y)} l h f`);

  // Letterhead
  skewBar(LEFT, 792, 22, 10, 6, ORANGE);
  text(winAnsi("TEAM BLEKINGE LÖPARFÖRENING"), LEFT + 36, 793, 9, "bold", INK, 1.2);
  const stamp = winAnsi("EXEMPELDOKUMENT");
  text(stamp, RIGHT - textWidth(stamp, 8, "bold", 1), 793.5, 8, "bold", ORANGE_DARK, 1);
  ops.push(`${LINE} RG 0.75 w ${LEFT} 776 m ${n(RIGHT)} 776 l S`);

  // Type and title
  let y = 728;
  text(winAnsi(kind.toUpperCase()), LEFT, y, 10, "bold", MUTED, 1);
  y -= 34;
  for (const line of wrap(winAnsi(title), 26, "bold", RIGHT - LEFT)) {
    text(line, LEFT, y, 26, "bold", INK);
    y -= 31;
  }
  skewBar(LEFT, y + 8, 46, 6, 4, ORANGE);
  y -= 30;

  // Where it lives
  for (const [label, value] of [
    ["Mapp", folder],
    ["Uppladdat", uploaded],
  ]) {
    const l = winAnsi(`${label}: `);
    text(l, LEFT, y, 11, "bold", INK);
    text(winAnsi(value), LEFT + textWidth(l, 11, "bold"), y, 11, "regular", MUTED);
    y -= 18;
  }

  // The note
  const pad = 18;
  const heading = winAnsi("Det här är ett exempeldokument");
  const body = wrap(
    winAnsi(
      "Webbplatsen är en demo. Dokumenten som fanns från början har ingen riktig fil, så den här sidan visas i stället. När styrelsen laddar upp en PDF under Administration › Dokument är det den filen som öppnas här.",
    ),
    11,
    "regular",
    RIGHT - LEFT - 2 * pad - 6,
  );
  const boxH = pad + 14 + 10 + body.length * 16 + pad - 6;
  const top = y - 24;
  ops.push(`${PAPER} rg ${LEFT} ${n(top - boxH)} ${n(RIGHT - LEFT)} ${n(boxH)} re f`);
  ops.push(`${ORANGE} rg ${LEFT} ${n(top - boxH)} 4 ${n(boxH)} re f`);
  let by = top - pad - 11;
  text(heading, LEFT + pad + 6, by, 13, "bold", INK);
  by -= 24;
  for (const line of body) {
    text(line, LEFT + pad + 6, by, 11, "regular", INK);
    by -= 16;
  }

  // Footer: a strip of diagonal speed stripes, as on the site.
  text(winAnsi("Team Blekinge Löparförening · exempeldokument i demon av den nya webbplatsen"), LEFT, 40, 8, "regular", MUTED);
  const stripes: string[] = [];
  for (let x = -8; x < PAGE_W; x += 12) stripes.push(`${n(x)} 0 m ${n(x + 6)} 0 l ${n(x + 10)} 8 l ${n(x + 4)} 8 l h`);
  ops.push(`0.953 0.675 0.357 rg ${stripes.join(" ")} f`);

  const content = ops.join("\n");
  // Document title for the viewer's tab, as UTF-16BE with a byte-order mark.
  let titleHex = "FEFF";
  for (let i = 0; i < title.length; i++) titleHex += title.charCodeAt(i).toString(16).padStart(4, "0").toUpperCase();

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Title <${titleHex}> /Producer (Team Blekinge LF) >>`,
  ];

  // Every char below is one byte, so string lengths are byte offsets.
  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i);
  return bytes;
}

/**
 * The number of pages in a PDF, read from its page tree — or undefined when
 * that is compressed away (common in newer PDFs). Good enough for "3 sidor".
 */
export function countPdfPages(bytes: Uint8Array): number | undefined {
  const s = new TextDecoder("latin1").decode(bytes);
  let max = 0;
  for (const m of s.matchAll(/\/Type\s*\/Pages\b/g)) {
    const near = s.slice(Math.max(0, m.index - 400), m.index + 400);
    for (const c of near.matchAll(/\/Count\s+(\d+)/g)) max = Math.max(max, Number(c[1]));
  }
  if (max) return max;
  const pages = s.match(/\/Type\s*\/Page\b(?!s)/g)?.length ?? 0;
  return pages || undefined;
}
