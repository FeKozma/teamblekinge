import "./news.css";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight, IconLock, IconPin, IconThumb } from "@/components/icons";
import { ArrowLink, Avatar, SpeedLines } from "@/components/ui";
import { commentCount, listNews, type NewsItem } from "@/lib/data/news";
import { people, type DemoUser } from "@/lib/data/users";
import { Discussion } from "./Discussion";
import { NotifySettingsButton } from "./NotifySettings";
import { PdfIcon } from "./PdfIcon";
import { Reactions } from "./Reactions";
import { RegistrationBox } from "./Registration";
import { ShareButton } from "./ShareButton";
import { isPinned, newsDate, plural } from "./util";

/** One news item (/nyheter/[slug]), per the "Nyhet med anmälan" drawup. */
export function Article({ n, user, today }: { n: NewsItem; user: DemoUser | null; today: string }) {
  const members = !!user;
  const gated = !!n.membersOnly && !members;
  const author = people[n.author];
  const loginHref = `/logga-in?next=/nyheter/${n.slug}`;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-x-10 gap-y-8 px-4 pt-3 pb-10 md:px-6 md:pt-8 md:pb-16">
      <div className="flex min-w-0 flex-[999_1_620px] flex-col md:max-w-[820px]">
        <div className="flex items-center justify-between pb-2 md:pb-4">
          <Link
            href="/nyheter"
            className="group -ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold text-ink no-underline hover:text-orange-dark"
          >
            <IconChevronLeft
              size={22}
              strokeWidth={2.2}
              className="transition-transform duration-300 ease-sprint group-hover:-translate-x-1"
            />
            Nyheter
          </Link>
          <ShareButton title={n.title} />
        </div>

        <article className="-mx-4 flex flex-col gap-3.5 border-y border-line bg-white px-4 py-5 md:mx-0 md:gap-4 md:rounded-2xl md:border md:p-8">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
            <span className="rounded-full bg-orange px-2.5 py-0.5 font-extrabold text-ink">{n.category}</span>
            {n.membersOnly && (
              <span className="inline-flex items-center gap-1 font-bold text-purple">
                <IconLock size={13} strokeWidth={2.4} />
                Endast medlemmar
              </span>
            )}
            {isPinned(n, today) && (
              <span className="inline-flex items-center gap-1 text-muted">
                <IconPin size={13} strokeWidth={2.4} className="text-orange-dark" />
                Fäst
              </span>
            )}
          </div>

          <h1 className="run-in m-0 text-[28px] leading-[1.15] font-extrabold tracking-[-0.4px] md:text-[40px] md:tracking-[-1px]">
            {n.title}
          </h1>

          <div className="run-in flex items-center gap-2.5" style={{ "--i": 1 } as CSSProperties}>
            <Avatar person={n.author} size={36} />
            <span className="flex flex-col leading-[1.3]">
              <span className="text-[14px] font-bold">
                {author?.name ?? "Team Blekinge"}
                {author?.title && `, ${author.title}`}
              </span>
              <time dateTime={n.date} className="text-[13px] text-muted">
                {n.dateLabel}
                {n.time && ` ${n.time}`}
              </time>
            </span>
          </div>

          {n.image && (
            <div className="relative -mx-4 h-[220px] overflow-hidden md:mx-0 md:h-[360px] md:rounded-xl">
              <Image
                src={n.image}
                alt={n.imageAlt ?? ""}
                fill
                priority
                sizes="(min-width: 768px) 760px, 100vw"
                className="object-cover"
                style={{
                  objectPosition: n.imagePosition ?? "50% 20%",
                  clipPath: "polygon(0 0, 100% 0, 100% 86%, 0 100%)",
                }}
              />
            </div>
          )}

          {gated ? (
            <MembersOnly n={n} loginHref={loginHref} />
          ) : (
            <>
              <div className="flex flex-col gap-3.5 text-[16px] leading-[1.6] md:text-[17px]">
                {n.body.map((p) => (
                  <p key={p.slice(0, 40)} className="m-0">
                    {p}
                  </p>
                ))}
              </div>

              {n.document && (
                <Link
                  href={n.document.href}
                  className="group flex min-h-11 items-center gap-3 rounded-[10px] bg-paper px-3 py-2.5 text-ink no-underline hover:text-ink"
                >
                  <PdfIcon size="sm" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[15px] font-bold group-hover:underline">{n.document.title}</span>
                    <span className="text-[13px] text-muted">{n.document.path}</span>
                  </span>
                  <IconChevronRight
                    size={18}
                    className="text-muted transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}

              {n.registration && (members || n.registration.kind === "extern") && (
                <RegistrationBox
                  slug={n.slug}
                  reg={n.registration}
                  today={today}
                  followedByMe={!!n.followedByMe}
                  me={user?.id}
                />
              )}

              {user ? (
                <Reactions slug={n.slug} likes={n.likes ?? 0} followedByMe={!!n.followedByMe} me={user.id} />
              ) : n.likes ? (
                <p className="m-0 inline-flex items-center gap-2 text-[14px] font-bold text-muted">
                  <IconThumb size={18} />
                  {n.likes} gillar
                </p>
              ) : null}
            </>
          )}
        </article>

        {members && user ? (
          <Discussion slug={n.slug} comments={n.comments} me={{ id: user.id, firstName: user.firstName }} />
        ) : (
          !gated && <GuestComments count={commentCount(n)} loginHref={loginHref} />
        )}
      </div>

      <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-5">
        <MoreNews current={n} members={members} today={today} />
        {user && (
          <section
            data-reveal="right"
            style={{ "--reveal-i": 1 } as CSSProperties}
            className="relative flex flex-col gap-2.5 overflow-hidden rounded-xl bg-ink p-5 text-white"
          >
            <SpeedLines
              viewBox="0 0 300 200"
              opacity={0.3}
              lines={[
                [190, 200, 300, 40],
                [225, 200, 300, 92],
                [260, 200, 300, 144],
              ]}
            />
            <h2 className="relative m-0 text-[18px] font-extrabold">Missa inget</h2>
            <p className="relative m-0 text-[14px] text-mist">
              Välj vilka kategorier du vill ha per mejl – direkt, som dagssammanfattning eller veckobrev.
            </p>
            <div className="relative flex">
              <NotifySettingsButton me={user.id} variant="primary" label="Ställ in aviseringar" />
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}

/** Guests on a members-only item: the teaser, then a way in. */
function MembersOnly({ n, loginHref }: { n: NewsItem; loginHref: string }) {
  return (
    <>
      <p className="m-0 text-[17px] leading-[1.6]">{n.excerpt}</p>
      {/* Suggests the rest of the text without revealing it. */}
      <div aria-hidden="true" className="flex flex-col gap-2.5 [mask-image:linear-gradient(#000,transparent)]">
        {["94%", "100%", "88%", "97%", "62%"].map((w) => (
          <span key={w} className="h-3.5 rounded bg-line" style={{ width: w }} />
        ))}
      </div>
      <div
        data-reveal="up"
        className="relative -mt-2 flex flex-col gap-3 overflow-hidden rounded-xl bg-ink p-5 text-white md:p-6"
      >
        <SpeedLines
          viewBox="0 0 600 220"
          opacity={0.3}
          lines={[
            [420, 220, 540, 0],
            [470, 220, 590, 0],
            [520, 220, 640, 0],
          ]}
        />
        <span className="relative flex items-center gap-3 text-[19px] font-extrabold">
          <span className="flex h-10 w-10 flex-none -rotate-6 items-center justify-center rounded-full bg-orange text-ink">
            <IconLock size={20} />
          </span>
          Den här nyheten är bara för medlemmar
        </span>
        <p className="relative m-0 text-[15px] text-mist">
          Logga in med din e-postadress – vi skickar en inloggningslänk, inget lösenord behövs.
        </p>
        <div className="relative flex flex-wrap gap-3">
          <Link href={loginHref} className="btn btn-primary font-extrabold">
            Logga in
          </Link>
          <Link href="/bli-medlem" className="btn btn-outline-light">
            Bli medlem
          </Link>
        </div>
      </div>
    </>
  );
}

function GuestComments({ count, loginHref }: { count: number; loginHref: string }) {
  return (
    <section
      id="kommentarer"
      data-reveal="up"
      className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-purple/40 bg-purple-soft px-5 py-4 md:mt-8"
    >
      <p className="m-0 flex-[1_1_240px]">
        <strong>{count ? plural(count, "kommentar", "kommentarer") : "Inga kommentarer än"}</strong>
        <span className="block text-[14px] text-muted">Logga in för att läsa, gilla och svara.</span>
      </p>
      <Link href={loginHref} className="btn btn-dark">
        Logga in
      </Link>
    </section>
  );
}

/** Same category first, then the newest. */
function MoreNews({ current, members, today }: { current: NewsItem; members: boolean; today: string }) {
  const items = listNews({ members })
    .filter((x) => x.slug !== current.slug)
    .sort((a, b) => Number(b.category === current.category) - Number(a.category === current.category))
    .slice(0, 4);
  return (
    <section className="card flex flex-col gap-1 p-5" data-reveal="right">
      <h2 className="m-0 mb-1 text-[18px] font-extrabold">Mer från Nyheter</h2>
      <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
        {items.map((x) => (
          <li key={x.slug}>
            <Link href={`/nyheter/${x.slug}`} className="group flex flex-col gap-0.5 py-3 text-ink no-underline hover:text-ink">
              <span className="text-[12px] text-muted">
                <span className="font-bold text-purple">{x.category}</span> · {newsDate(x, today)}
                {x.membersOnly && (
                  <IconLock size={12} strokeWidth={2.4} className="ml-1 inline align-[-1px] text-purple" />
                )}
              </span>
              <span className="leading-snug font-bold group-hover:underline">{x.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ArrowLink href="/nyheter" className="mt-1">
        Alla nyheter
      </ArrowLink>
    </section>
  );
}
