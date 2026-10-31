// DEMO DATA: fictional members used to fill the logged-in drawups, which
// deliberately show placeholders like [Namn]. Replace with real accounts once
// there is a database.

export type Tone = "ink" | "orange" | "purple";

export type Person = {
  id: string;
  firstName: string;
  name: string;
  initial: string;
  tone: Tone;
  /** Shown after the name, e.g. "styrelsen", "stafettansvarig". */
  title?: string;
};

export type DemoUser = Person & {
  email: string;
  role: "member" | "board";
};

export const people: Record<string, Person> = {
  ingrid: { id: "ingrid", firstName: "Ingrid", name: "Ingrid Holm", initial: "I", tone: "purple" },
  tomas: { id: "tomas", firstName: "Tomas", name: "Tomas Berg", initial: "T", tone: "ink" },
  sara: { id: "sara", firstName: "Sara", name: "Sara Lind", initial: "S", tone: "purple" },
  lars: { id: "lars", firstName: "Lars", name: "Lars Ek", initial: "L", tone: "ink" },
  johanna: { id: "johanna", firstName: "Johanna", name: "Johanna Nyberg", initial: "J", tone: "orange" },
  fredrik: { id: "fredrik", firstName: "Fredrik", name: "Fredrik Sjö", initial: "F", tone: "orange" },
  anna: {
    id: "anna",
    firstName: "Anna",
    name: "Anna Wik",
    initial: "A",
    tone: "ink",
    title: "stafettansvarig",
  },
  bjorn: { id: "bjorn", firstName: "Björn", name: "Björn Dahl", initial: "B", tone: "purple" },
  cecilia: { id: "cecilia", firstName: "Cecilia", name: "Cecilia Ström", initial: "C", tone: "orange" },
  stina: {
    id: "stina",
    firstName: "Stina",
    name: "Stina Ahl",
    initial: "S",
    tone: "purple",
    title: "styrelsen",
  },
};

export const demoUsers: Record<string, DemoUser> = {
  ingrid: { ...people.ingrid, email: "ingrid@exempel.se", role: "member" },
  stina: { ...people.stina, email: "stina@exempel.se", role: "board" },
};
