import "server-only";
import {
  board2026,
  club,
  faqs,
  history,
  otherRoles,
  partners,
  type BoardMember,
  type Club,
  type Faq,
  type Milestone,
  type Partner,
  type RoleGroup,
} from "@/lib/data/club";
import { readCollection, writeCollection } from "./store";

// The association's facts, people, FAQs, history and sponsors, as edited by the board.

export const getClub = () => readCollection<Club>("club", () => club);
export const saveClub = (v: Club) => writeCollection("club", v);

export const getBoard = () => readCollection<BoardMember[]>("board", () => board2026);
export const saveBoard = (v: BoardMember[]) => writeCollection("board", v);

export const getOtherRoles = () => readCollection<RoleGroup[]>("roles", () => otherRoles);
export const saveOtherRoles = (v: RoleGroup[]) => writeCollection("roles", v);

export const getFaqs = () => readCollection<Faq[]>("faqs", () => faqs);
export const saveFaqs = (v: Faq[]) => writeCollection("faqs", v);

export const getPartners = () => readCollection<Partner[]>("partners", () => partners);
export const savePartners = (v: Partner[]) => writeCollection("partners", v);

export const getHistory = () => readCollection<Milestone[]>("history", () => history);
export const saveHistory = (v: Milestone[]) => writeCollection("history", v);
