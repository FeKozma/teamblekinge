// Editable page texts. Each fixed page lists its texts here — grouped as the
// page shows them, with a label a non-technical editor understands and the
// text it has until someone changes it. The admin (/admin/sidor) renders one
// form per page from this; the page reads the texts with getPageTexts(id).

export type TextField = {
  /** Stable id within the page, e.g. "hero.title". Never rename once edited. */
  key: string;
  /** What the editor sees, e.g. "Rubrik". */
  label: string;
  /** The text until the board changes it. */
  value: string;
  /** Multi-line: blank lines become paragraphs. */
  long?: boolean;
  /** Extra help under the field, e.g. "Visas på startsidan också". */
  hint?: string;
  /** May be left empty (the page then leaves the bit out). */
  optional?: boolean;
};

export type TextSection = {
  /** Where on the page, e.g. "Överst på sidan". */
  title: string;
  fields: TextField[];
};

export type PageTextsDef = {
  /** Also the admin URL: /admin/sidor/<id>. */
  id: string;
  label: string;
  /** The public page (and anchor) the texts appear on. */
  href: string;
  sections: TextSection[];
  /**
   * Other editors with content on this page, shown at the top of its text
   * editor, e.g. { href: "/admin/aktuellt", label: "Aktuellt-bandet", text: "Den orange raden överst" }.
   */
  related?: { href: string; label: string; text: string }[];
};

/** Split a long text into paragraphs on blank lines. */
export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
