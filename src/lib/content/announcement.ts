import "server-only";
import { announcement, type Announcement } from "@/lib/data/announcement";
import { readCollection, writeCollection } from "./store";

/** The "Aktuellt" band on the start page, as last saved by the board. */
export const getAnnouncement = () => readCollection<Announcement>("announcement", () => announcement);
export const saveAnnouncement = (v: Announcement) => writeCollection("announcement", v);
