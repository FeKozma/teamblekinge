// Swedish date helpers. Dates in data files are ISO strings (YYYY-MM-DD) and
// are interpreted as calendar days in Europe/Stockholm.

const TZ = "Europe/Stockholm";

export const monthsShort = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
export const monthsLong = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
export const weekdays = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];

/** Today's date in Stockholm as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(now);
}

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "29 okt" */
export function dayMonth(iso: string) {
  const { m, d } = parts(iso);
  return `${d} ${monthsShort[m - 1]}`;
}

/** "tisdag 3 november" */
export function longDate(iso: string) {
  const { m, d, dow } = parts(iso);
  return `${weekdays[dow]} ${d} ${monthsLong[m - 1]}`;
}

/** "18 januari 1992" */
export function fullDate(iso: string) {
  const { y, m, d } = parts(iso);
  return `${d} ${monthsLong[m - 1]} ${y}`;
}

/** "18 januari 1992" → "1992-01-18"; "" when it isn't such a date. */
export function parseFullDate(text: string) {
  const match = /^(\d{1,2})\s+([a-zåäö]+)\s+(\d{4})$/i.exec(text.trim());
  const m = match ? monthsLong.indexOf(match[2].toLowerCase()) + 1 : 0;
  if (!match || !m) return "";
  return `${match[3]}-${String(m).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

export function weekday(iso: string) {
  return weekdays[parts(iso).dow];
}

export function dayNum(iso: string) {
  return parts(iso).d;
}

export function monthShort(iso: string) {
  return monthsShort[parts(iso).m - 1];
}

export function addDays(iso: string, n: number) {
  const { y, m, d } = parts(iso);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both ISO dates). */
export function daysBetween(from: string, to: string) {
  const a = parts(from);
  const b = parts(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

/** "I DAG" / "I MORGON" for badges, otherwise null. */
export function relativeDay(iso: string, today: string) {
  const diff = daysBetween(today, iso);
  if (diff === 0) return "I dag";
  if (diff === 1) return "I morgon";
  return null;
}

/** The next Tuesday on or after `today` — the club's main training night. */
export function nextTuesday(today: string) {
  const diff = (2 - parts(today).dow + 7) % 7;
  return addDays(today, diff);
}
