import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Race } from "@/lib/data/races";
import { daysBetween } from "@/lib/format";

/** Days until the race, as a short label ("I dag", "Om 7 dagar"), or null once it's run. */
export function raceCountdownLabel(race: Race, today: string) {
  const days = daysBetween(today, race.start.slice(0, 10));
  if (days < 0) return null;
  if (days === 0) return "I dag";
  if (days === 1) return "I morgon";
  return `Om ${days} dagar`;
}

/**
 * A race as a card dropped on the table: it settles into its tilt on scroll
 * and straightens up on hover — the same card as "Våra lopp" on the landing.
 */
export function RaceCard({
  race,
  today,
  index,
  rest,
}: {
  race: Race;
  today: string;
  index: number;
  rest: string;
}) {
  const soon = raceCountdownLabel(race, today);
  return (
    <article
      data-settle
      className="straighten-hover group relative flex h-full flex-col overflow-hidden rounded-md bg-white text-ink shadow-[0_14px_30px_rgba(34,30,31,0.22)] hover:shadow-[0_24px_40px_rgba(34,30,31,0.3)]"
      style={{ "--rest-rotate": rest, "--reveal-i": index } as CSSProperties}
    >
      {race.imageFit === "contain" ? (
        <div className="flex h-[220px] items-center justify-center border-b border-line bg-white">
          <Image src={race.image} alt={race.imageAlt} width={600} height={580} className="h-[190px] w-auto" />
        </div>
      ) : (
        <div className="relative h-[220px] overflow-hidden">
          <Image
            src={race.image}
            alt={race.imageAlt}
            fill
            sizes="(min-width: 768px) 380px, 100vw"
            className="object-cover transition-[scale] duration-700 ease-[var(--ease-sprint)] group-hover:scale-105"
            style={{
              objectPosition: race.slug === "jamjohalvan" ? "50% 20%" : undefined,
              clipPath:
                index % 2 ? "polygon(0 0, 100% 0, 100% 100%, 0 82%)" : "polygon(0 0, 100% 0, 100% 82%, 0 100%)",
            }}
          />
        </div>
      )}
      {soon && (
        <span className="absolute top-[202px] left-4 -rotate-3 rounded-full bg-ink px-2.5 py-[3px] text-[12px] font-extrabold tracking-[0.5px] text-orange uppercase shadow-md">
          {soon}
        </span>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span
          className={`text-[13px] font-bold tracking-[0.5px] uppercase ${
            race.tone === "purple" ? "text-purple" : "text-orange-dark"
          }`}
        >
          {race.kicker}
        </span>
        <h3 className="m-0 text-[21px] font-extrabold">{race.name}</h3>
        <p className="m-0 text-[15px] text-muted">{race.summary}</p>
        <Link href={`/tavla/${race.slug}`} className="btn btn-dark mt-auto self-start">
          {race.cta}
          <span className="sr-only">: {race.name}</span>
        </Link>
      </div>
    </article>
  );
}
