// The orange "Aktuellt" band at the top of the start page. This is the SEED:
// the board changes it often in /admin/aktuellt; pages read it via
// lib/content/announcement.

export type Announcement = {
  show: boolean;
  /** Last day it shows (ISO date), "" = until it's hidden by hand. */
  until: string;
  /** The small dark pill, "Aktuellt". */
  label: string;
  /** In bold. */
  title: string;
  /** After the title; left out on phones. */
  text: string;
  /** At the far right, with an arrow. */
  linkText: string;
  /** Where the whole band leads: a page on the site ("/tavla/jamjohalvan") or a web address. */
  href: string;
};

export const announcement: Announcement = {
  show: true,
  until: "2026-11-07",
  label: "Aktuellt",
  title: "Jämjöhalvan och Veteran-SM i halvmaraton – lördag 7 november",
  text: "Sista anmälan till VSM 31 oktober",
  linkText: "Anmäl dig",
  href: "/tavla/jamjohalvan",
};

/** Whether the band is on today. */
export const isAnnouncementOn = (a: Announcement, today: string) => a.show && (!a.until || today <= a.until);
