import type { ReactNode } from "react";
import Link from "next/link";

// Helpers for editable page texts that meet facts and links from the store.
// The board edits plain words — no placeholders to learn: a fact (an address,
// a fee) sits between a "text before" and a "text after", and a link is
// "these words in the text".

/**
 * `before fact after`, spaced like a sentence: no space before an `after`
 * that starts with punctuation (", tar en promenad …"). Empty parts drop out.
 */
export function around(before: string, fact: ReactNode, after = ""): ReactNode {
  const tight = /^[,.;:!?)”]/.test(after);
  return (
    <>
      {before}
      {before && " "}
      {fact}
      {after && !tight && " "}
      {after}
    </>
  );
}

/**
 * The text with each link's words turned into a link (first occurrence). If
 * the words aren't in the text — the editor changed one but not the other —
 * the text simply shows without that link.
 */
export function withLinks(
  text: string,
  links: { words: string; href: string; className?: string }[],
): ReactNode {
  const hits = links
    .map((l) => ({ ...l, at: l.words ? text.indexOf(l.words) : -1 }))
    .filter((l) => l.at >= 0)
    .sort((a, b) => a.at - b.at);
  const out: ReactNode[] = [];
  let pos = 0;
  for (const l of hits) {
    if (l.at < pos) continue; // overlaps the previous link
    out.push(text.slice(pos, l.at));
    out.push(
      <Link key={l.at} href={l.href} className={l.className}>
        {l.words}
      </Link>,
    );
    pos = l.at + l.words.length;
  }
  out.push(text.slice(pos));
  return <>{out}</>;
}
