// Where in the admin a public page's content is edited — for the "Ändra den
// här sidan" button board members see on the site. Add a line when a new
// public page gets an editor.

const exact: Record<string, string> = {
  "/": "/admin/sidor/startsida",
  "/nyheter": "/admin/nyheter",
  "/kalender": "/admin/kalender",
  "/dokument": "/admin/dokument/mappar",
  "/trana-med-oss": "/admin/sidor/trana-med-oss",
  "/tavla": "/admin/sidor/tavla",
  "/foreningen": "/admin/sidor/foreningen",
  "/bli-medlem": "/admin/sidor/bli-medlem",
  "/fragor": "/admin/vanliga-fragor",
};

const prefixes: [string, (rest: string) => string][] = [
  ["/nyheter/", (rest) => `/admin/nyheter/${rest}`],
  ["/dokument/", (rest) => `/admin/dokument/${rest}`],
  ["/tavla/", (rest) => `/admin/lopp/${rest}`],
];

export function adminHrefFor(pathname: string): string | null {
  if (exact[pathname]) return exact[pathname];
  for (const [prefix, to] of prefixes) if (pathname.startsWith(prefix)) return to(pathname.slice(prefix.length));
  return null;
}
