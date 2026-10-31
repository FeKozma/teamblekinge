"use client";

import type { Registration } from "@/lib/data/news";
import { plural } from "./util";
import { signupCount, useMyComments, useSignup } from "./store";

// Counts rendered inside server-rendered cards that must include what the
// visitor did in the demo (their own sign-up, their own comments).

export function SignupCount({
  slug,
  reg,
  format,
  me,
}: {
  slug: string;
  reg: Registration;
  /** Member id; guests have no sign-up of their own. */
  me?: string;
  /** "of": "10 av 24 anmälda" · "joined": "10 är med" · "left": "13 pass kvar" */
  format: "of" | "joined" | "left";
}) {
  const [signup] = useSignup<unknown>(slug, me);
  const count = signupCount(reg, !!signup);
  if (format === "joined") return <>{count} är med</>;
  if (format === "left") return <>{Math.max(0, (reg.capacity ?? 0) - count)} pass kvar</>;
  return (
    <>
      {count} av {reg.capacity} anmälda
    </>
  );
}

export function CommentCount({ slug, base }: { slug: string; base: number }) {
  const [mine] = useMyComments(slug);
  return <>{plural(base + mine.length, "kommentar", "kommentarer")}</>;
}
