import { bliMedlemTexts } from "./bli-medlem";
import { foreningenTexts } from "./foreningen";
import { fragorTexts } from "./fragor";
import { sidfotTexts } from "./sidfot";
import { startsidaTexts } from "./startsida";
import { tavlaTexts } from "./tavla";
import { tranaTexts } from "./trana-med-oss";
import type { PageTextsDef } from "./types";

export type { PageTextsDef, TextField, TextSection } from "./types";
export { paragraphs } from "./types";

/** Every page with editable texts, in the order the admin lists them. */
export const pageTextDefs: PageTextsDef[] = [
  startsidaTexts,
  tranaTexts,
  tavlaTexts,
  foreningenTexts,
  bliMedlemTexts,
  fragorTexts,
  sidfotTexts,
];

export function getPageTextsDef(id: string) {
  return pageTextDefs.find((p) => p.id === id);
}
