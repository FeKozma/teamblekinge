export type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const trana: NavItem = {
  href: "/trana-med-oss",
  label: "Träna med oss",
  children: [
    { href: "/trana-med-oss", label: "Träningsgrupper" },
    { href: "/trana-med-oss#prova-pa", label: "Prova på" },
    { href: "/trana-med-oss#langpass", label: "Långpass" },
    { href: "/trana-med-oss#torsdagsgruppen", label: "Torsdagsgruppen" },
    { href: "/trana-med-oss#parkering", label: "Hitta hit & parkering" },
  ],
};
const tavla: NavItem = {
  href: "/tavla",
  label: "Tävla",
  children: [
    { href: "/tavla/jamjohalvan", label: "Jämjöhalvan" },
    { href: "/tavla/kustmaran", label: "Kustmaran & Kristianopel Runt" },
    { href: "/tavla/veteran-sm", label: "Veteran-SM" },
    { href: "/tavla#aka-och-tavla", label: "Åka och tävla" },
    { href: "/tavla#resultat", label: "Resultat" },
  ],
};
const foreningen: NavItem = {
  href: "/foreningen",
  label: "Föreningen",
  children: [
    { href: "/foreningen", label: "Om föreningen" },
    { href: "/bli-medlem", label: "Bli medlem" },
    { href: "/foreningen#styrelsen", label: "Styrelsen och ansvariga" },
    { href: "/foreningen#klubbklader", label: "Klubbkläder" },
  ],
};

export const guestNav: NavItem[] = [
  { href: "/", label: "Hem" },
  trana,
  tavla,
  foreningen,
  { href: "/nyheter", label: "Nyheter" },
  { href: "/kalender", label: "Kalender" },
  { href: "/fragor", label: "Frågor & kontakt" },
];

export const memberNav: NavItem[] = [
  { href: "/", label: "Hem" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/flodet", label: "Klubbflödet" },
  { href: "/kalender", label: "Kalender" },
  { href: "/dokument", label: "Dokument" },
  trana,
  tavla,
  foreningen,
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
