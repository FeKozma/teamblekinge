import "./news.css";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconLock, IconPin, IconStar } from "@/components/icons";
import { ArrowLink, SpeedLines } from "@/components/ui";
import { commentCount, listNews, newsCategories, type NewsCategory, type NewsItem } from "@/lib/data/news";
import type { DemoUser } from "@/lib/data/users";
import { dayMonth } from "@/lib/format";
import { LocalNews, NewNewsButton } from "./BoardNews";
import { IconRss } from "./icons";
import { CommentCount, SignupCount } from "./LiveCounts";
import { NotifySettingsButton } from "./NotifySettings";
import { PdfIcon } from "./PdfIcon";
import { categorySlug, newsDate, openDeadlines, pinnedNews, plural } from "./util";

const PAGE_SIZE = 6;

type Filters = { category?: NewsCategory; year?: number; showAll?: boolean };

/** /nyheter with the given filters; links keep the other filters. */
function hrefWith(current: Filters, next: Partial<Filters>) {
  const f = { ...current, showAll: false, ...next };
  const q = new URLSearchParams();
  if (f.category) q.set("kategori", categorySlug(f.category));
  if (f.year) q.set("ar", String(f.year));
  if (f.showAll) q.set("visa", "alla");
  const s = q.toString();
  return s ? `/nyheter?${s}` : "/nyheter";
}

export function NewsIndex({
  user,
  today,
  category,
  year,
  showAll = false,
}: {
  user: DemoUser | null;
  today: string;
} & Filters) {
  const members = !!user;
  const visible = listNews({ members });
  const hiddenForGuests = listNews({ members: true }).length - visible.length;

  const currentYear = Number(today.slice(0, 4));
  const viewYear = year ?? currentYear;
  const filters: Filters = { category, year: year === currentYear ? undefined : year };

  const inCategory = category ? visible.filter((n) => n.category === category) : visible;
  const pinned = viewYear === currentYear ? pinnedNews(inCategory, today).slice(0, 2) : [];
  const rest = inCategory.filter((n) => n.date.startsWith(String(viewYear)) && !pinned.includes(n));
  const shown = showAll ? rest : rest.slice(0, PAGE_SIZE);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-7 pb-14 md:px-6 md:pt-9">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="run-in m-0 flex items-center gap-3.5 text-[34px] leading-tight font-extrabold tracking-[-0.8px] md:text-[40px]">
            <span aria-hidden="true" className="skew-bar bg-orange" />
            Nyheter
          </h1>
          <p
            className="run-in m-0 mt-1 max-w-[640px] text-[16px] text-muted"
            style={{ "--i": 1 } as CSSProperties}
          >
            Meddelanden från styrelsen, tränarna och arrangörerna. Som inloggad ser du även nyheter som bara är för
            medlemmar.
          </p>
        </div>
        <div className="run-in flex flex-wrap gap-2.5" style={{ "--i": 2 } as CSSProperties}>
          {user ? (
            <NotifySettingsButton me={user.id} />
          ) : (
            <Link href="/logga-in?next=/nyheter" className="btn btn-outline rounded-[10px] border-[#cfc8c4]">
              <IconLock size={18} />
              Logga in för medlemsnyheter
            </Link>
          )}
          {user?.role === "board" && <NewNewsButton />}
        </div>
      </div>

      <CategoryChips filters={filters} />

      {pinned.length > 0 && (
        <section aria-labelledby="viktigt" className="flex flex-col gap-3">
          <h2
            id="viktigt"
            className="m-0 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[1px] text-muted uppercase"
          >
            <IconPin size={16} strokeWidth={2.2} className="text-orange-dark" />
            Viktigt nu
          </h2>
          <div className="flex flex-wrap gap-5">
            {pinned.map((n, i) => (
              <PinnedCard key={n.slug} n={n} today={today} wide={i === 0} i={i} me={user?.id} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-start gap-8">
        <section
          id="senaste"
          aria-labelledby="senaste-rubrik"
          className="flex min-w-0 flex-[999_1_560px] scroll-mt-6 flex-col gap-3.5"
        >
          <h2 id="senaste-rubrik" className="m-0 text-[24px] font-extrabold">
            {viewYear === currentYear ? "Senaste" : `Nyheter ${viewYear}`}
            {category && <span className="text-muted"> · {category}</span>}
          </h2>

          {viewYear === currentYear && <LocalNews members={members} category={category} />}

          {shown.map((n, i) => (
            <Fragment key={n.slug}>
              <NewsRow n={n} today={today} i={i} me={user?.id} />
              {/* Guests: the invite sits high up in the list, not below the fold. */}
              {i === Math.min(1, shown.length - 1) && !members && hiddenForGuests > 0 && (
                <GuestCard hidden={hiddenForGuests} />
              )}
            </Fragment>
          ))}

          {rest.length === 0 && (
            <div className="card flex flex-col items-start gap-2 p-6" data-reveal>
              <p className="m-0 text-[17px] font-bold">
                {viewYear !== currentYear
                  ? `Nyheterna från ${viewYear} flyttas över från gamla hemsidan.`
                  : `Inga ${pinned.length ? "fler " : ""}nyheter${category ? ` i ${category}` : ""} just nu.`}
              </p>
              <ArrowLink href="/nyheter">Alla nyheter</ArrowLink>
            </div>
          )}

          {!showAll && rest.length > PAGE_SIZE && (
            <Link
              href={hrefWith(filters, { showAll: true })}
              scroll={false}
              className="btn btn-outline mt-1 self-center rounded-[10px] border-[#cfc8c4]"
            >
              Visa fler nyheter
            </Link>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <Deadlines items={visible} today={today} />
          <YearPicker filters={filters} viewYear={viewYear} currentYear={currentYear} />
          <StayUpdated me={user?.id} />
        </aside>
      </div>
    </div>
  );
}

function CategoryChips({ filters }: { filters: Filters }) {
  const chips: (NewsCategory | undefined)[] = [undefined, ...newsCategories];
  return (
    <nav
      aria-label="Filtrera på kategori"
      className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0"
    >
      <ul className="m-0 flex w-max list-none gap-2 p-0 md:w-auto md:flex-wrap">
        {chips.map((c) => {
          const active = c === filters.category;
          return (
            <li key={c ?? "alla"}>
              <Link
                href={hrefWith(filters, { category: c })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full border-[1.5px] px-4 text-[14px] font-semibold whitespace-nowrap no-underline transition-[translate,background-color,border-color,color] duration-300 ease-sprint hover:-translate-y-0.5 ${
                  active
                    ? "border-ink bg-ink text-white hover:text-white"
                    : "border-[#cfc8c4] bg-white text-ink hover:border-ink hover:text-ink"
                }`}
              >
                {c ?? "Alla"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MembersFlag() {
  return (
    <span className="inline-flex items-center gap-1 align-[-2px] font-bold text-purple">
      <IconLock size={13} strokeWidth={2.4} />
      Medlemmar
    </span>
  );
}

/** "Stafett · i går · 🔒 Medlemmar" */
function Meta({ n, today, accent, children }: { n: NewsItem; today: string; accent: string; children?: ReactNode }) {
  return (
    <span className="text-[13px] text-muted">
      <span className={`font-bold ${accent}`}>{n.category}</span> · {newsDate(n, today)}
      {n.membersOnly && (
        <>
          {" "}
          · <MembersFlag />
        </>
      )}
      {children}
    </span>
  );
}

function PillTag({ dark, children }: { dark?: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] ${
        dark ? "bg-ink font-bold text-white" : "bg-paper font-semibold"
      }`}
    >
      {children}
    </span>
  );
}

function PinnedCard({ n, today, wide, i, me }: { n: NewsItem; today: string; wide: boolean; i: number; me?: string }) {
  const reg = n.registration;
  const lastDay = reg?.deadline === today;
  const visual = n.image ? (
    <Image
      src={n.image}
      alt={n.imageAlt ?? ""}
      fill
      sizes={wide ? "(min-width: 768px) 280px, 100vw" : "(min-width: 768px) 460px, 100vw"}
      className="object-cover transition-[scale] duration-700 ease-sprint group-hover:scale-105"
      style={{ objectPosition: n.imagePosition ?? "50% 15%" }}
    />
  ) : (
    <span className="absolute inset-0 flex items-center justify-center bg-ink">
      <SpeedLines
        viewBox="0 0 400 110"
        opacity={0.35}
        lines={[
          [250, 110, 330, 0],
          [285, 110, 365, 0],
          [320, 110, 400, 0],
          [-30, 110, 50, 0],
        ]}
      />
      <Image
        src="/img/logo-emblem.png"
        alt=""
        width={89}
        height={96}
        className="relative h-[84px] w-auto transition-transform duration-500 ease-sprint group-hover:-rotate-3 group-hover:scale-105"
      />
    </span>
  );

  const body = (
    <>
      <Meta n={n} today={today} accent="text-orange-dark">
        {wide && n.pinnedUntil && <> · fäst till {dayMonth(n.pinnedUntil)}</>}
      </Meta>
      <span
        className={`font-extrabold ${
          wide
            ? "text-[23px] leading-[1.15] tracking-[-0.4px] md:text-[26px]"
            : "text-[21px] leading-[1.2] md:text-[22px]"
        }`}
      >
        {n.title}
      </span>
      <span className={`${wide ? "text-[16px]" : "text-[15px]"} text-muted`}>{n.excerpt}</span>
      <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {reg?.capacity ? (
          <PillTag dark>
            <SignupCount slug={n.slug} reg={reg} format="of" me={me} />
          </PillTag>
        ) : reg ? (
          <PillTag dark>
            {lastDay && <span aria-hidden="true" className="live-dot h-2 w-2 rounded-full bg-orange" />}
            Sista anmälan {lastDay ? "i dag" : dayMonth(reg.deadline)}
          </PillTag>
        ) : null}
        {!n.membersOnly && <PillTag>Offentlig</PillTag>}
        <PillTag>
          <CommentCount slug={n.slug} base={commentCount(n)} />
        </PillTag>
      </span>
    </>
  );

  return (
    <Link
      href={`/nyheter/${n.slug}`}
      data-reveal="up"
      style={{ "--reveal-i": i } as CSSProperties}
      className={`group lean-hover flex min-w-0 overflow-hidden rounded-2xl border-2 border-orange bg-white text-ink no-underline hover:text-ink ${
        wide ? "flex-[3_1_520px] flex-wrap" : "flex-[2_1_320px] flex-col"
      }`}
    >
      {wide ? (
        <>
          <span className="relative min-h-[170px] flex-[1_1_240px] overflow-hidden sm:max-h-[320px] sm:min-h-[260px]">
            {visual}
          </span>
          <span className="flex min-w-0 flex-[999_1_280px] flex-col gap-2.5 px-5 py-5 md:px-6 md:py-[22px]">{body}</span>
        </>
      ) : (
        <>
          <span className="relative h-[110px] flex-none overflow-hidden">{visual}</span>
          <span className="flex flex-1 flex-col gap-2 px-5 py-5 md:px-[22px]">{body}</span>
        </>
      )}
    </Link>
  );
}

function NewsRow({ n, today, i, me }: { n: NewsItem; today: string; i: number; me?: string }) {
  const stagger = { "--reveal-i": Math.min(i, 4) } as CSSProperties;

  // Board protocols: a compact row that goes straight to the document.
  if (n.document) {
    return (
      <article
        data-reveal
        style={stagger}
        className="lean-hover relative flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-white px-5 py-4"
      >
        <PdfIcon />
        <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
          <Meta n={n} today={today} accent="text-purple" />
          <h3 className="m-0 text-[17px] leading-snug font-extrabold">
            <Link
              href={`/nyheter/${n.slug}`}
              className="text-ink no-underline after:absolute after:inset-0 after:rounded-xl hover:text-ink hover:underline"
            >
              {n.title}
            </Link>
          </h3>
        </div>
        <Link
          href={n.document.href}
          className="group/doc relative z-10 flex-none basis-full pl-[60px] text-[14px] font-bold no-underline hover:underline sm:basis-auto sm:pl-0"
        >
          {n.document.title}{" "}
          <span className="inline-block transition-transform duration-300 group-hover/doc:translate-x-1">→</span>
        </Link>
      </article>
    );
  }

  const reg = n.registration;
  const comments = commentCount(n);
  // Phones: a narrow thumbnail beside the text keeps the list scannable;
  // from sm up, the 180px tile from the drawup.
  const tile = "relative w-[88px] flex-none overflow-hidden sm:min-h-[150px] sm:w-[180px]";
  return (
    <Link
      href={`/nyheter/${n.slug}`}
      data-reveal
      style={stagger}
      className="group lean-hover flex overflow-hidden rounded-xl border border-line bg-white text-ink no-underline hover:text-ink"
    >
      {n.image ? (
        <span className={tile}>
          <Image
            src={n.image}
            alt={n.imageAlt ?? ""}
            fill
            sizes="(min-width: 640px) 220px, 100px"
            className="diag-img object-cover group-hover:scale-105"
            style={{ objectPosition: n.imagePosition }}
          />
        </span>
      ) : reg?.kind === "funktionar" ? (
        <span className={`${tile} flex items-center justify-center bg-orange-soft`}>
          <IconStar
            strokeWidth={1.6}
            className="h-9 w-9 text-orange-dark transition-[rotate,scale] duration-700 ease-sprint group-hover:scale-110 group-hover:rotate-[72deg] sm:h-14 sm:w-14"
          />
        </span>
      ) : (
        <span className={tile}>
          <span className="diag-img absolute inset-0 flex items-center justify-center bg-ink">
            <Image src="/img/logo-emblem.png" alt="" width={84} height={91} className="w-12 sm:w-[84px]" />
          </span>
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3.5 sm:gap-1.5 sm:px-5 sm:py-[18px]">
        <Meta n={n} today={today} accent="text-purple">
          {!reg && <> · {plural(comments, "kommentar", "kommentarer")}</>}
        </Meta>
        <span className="text-[17px] leading-[1.25] font-extrabold sm:text-[19px]">{n.title}</span>
        <span className="line-clamp-2 text-[14px] text-muted sm:line-clamp-none sm:text-[15px]">{n.excerpt}</span>
        {reg?.kind === "funktionar" && (
          <span className="text-[14px] font-bold text-orange-dark">
            {reg.cta}{" "}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span> ·{" "}
            <SignupCount slug={n.slug} reg={reg} format="left" me={me} />
          </span>
        )}
      </span>
    </Link>
  );
}

function GuestCard({ hidden }: { hidden: number }) {
  return (
    <div
      data-reveal="up"
      className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-xl border border-dashed border-purple/40 bg-purple-soft px-5 py-4"
    >
      <span className="flex h-11 w-11 flex-none -rotate-6 items-center justify-center rounded-full bg-purple text-white">
        <IconLock size={20} />
      </span>
      <div className="flex min-w-0 flex-[1_1_240px] flex-col">
        <p className="m-0 font-extrabold">{plural(hidden, "nyhet till är", "nyheter till är")} bara för medlemmar</p>
        <p className="m-0 text-[14px] text-muted">
          Anmälningar, funktionärspass och protokoll från styrelsen syns när du loggat in.
        </p>
      </div>
      <Link href="/logga-in?next=/nyheter" className="btn btn-dark">
        Logga in
      </Link>
    </div>
  );
}

function Deadlines({ items, today }: { items: NewsItem[]; today: string }) {
  const open = openDeadlines(items, today);
  if (!open.length) return null;
  return (
    <section className="card flex flex-col gap-3 p-5" data-reveal="right">
      <h2 className="m-0 text-[18px] font-extrabold">Kommande sista dagar</h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[15px]">
        {open.map((n) => {
          const reg = n.registration!;
          const lastDay = reg.deadline === today;
          return (
            <li key={n.slug}>
              <Link
                href={`/nyheter/${n.slug}#anmalan`}
                className="group flex min-h-9 items-center justify-between gap-3 text-ink no-underline hover:text-orange-dark"
              >
                <span className="group-hover:underline">{reg.deadlineTitle ?? n.title}</span>
                <strong className="inline-flex flex-none items-center gap-1.5">
                  {lastDay && <span aria-hidden="true" className="live-dot h-2 w-2 rounded-full bg-orange" />}
                  {lastDay ? "i dag" : dayMonth(reg.deadline)}
                </strong>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function YearPicker({ filters, viewYear, currentYear }: { filters: Filters; viewYear: number; currentYear: number }) {
  const years = [0, 1, 2, 3].map((d) => currentYear - d);
  return (
    <section
      className="card flex flex-col gap-2.5 p-5"
      data-reveal="right"
      style={{ "--reveal-i": 1 } as CSSProperties}
    >
      <h2 className="m-0 text-[18px] font-extrabold">Tidigare nyheter</h2>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {years.map((y) => {
          const active = y === viewYear;
          return (
            <li key={y}>
              <Link
                href={hrefWith(filters, { year: y === currentYear ? undefined : y })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-lg px-3.5 no-underline transition-[translate,background-color,border-color] duration-300 hover:-translate-y-0.5 ${
                  active
                    ? "bg-ink font-bold text-white hover:text-white"
                    : "border border-[#cfc8c4] font-semibold text-ink hover:border-ink hover:text-ink"
                }`}
              >
                {y}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StayUpdated({ me }: { me?: string }) {
  return (
    <section
      data-reveal="right"
      style={{ "--reveal-i": 2 } as CSSProperties}
      className="relative flex flex-col gap-2.5 overflow-hidden rounded-xl bg-ink p-5 text-white"
    >
      <SpeedLines
        viewBox="0 0 300 220"
        opacity={0.3}
        lines={[
          [190, 220, 300, 50],
          [225, 220, 300, 104],
          [260, 220, 300, 158],
        ]}
      />
      <h2 className="relative m-0 text-[18px] font-extrabold">Missa inget</h2>
      <p className="relative m-0 text-[14px] text-mist">
        Få nyheter per mejl direkt, som dagssammanfattning eller veckobrev – du väljer per kategori.
      </p>
      <div className="relative flex">
        {me ? (
          <NotifySettingsButton me={me} variant="primary" label="Ställ in aviseringar" />
        ) : (
          <Link href="/logga-in?next=/nyheter" className="btn btn-primary font-extrabold">
            Logga in och ställ in
          </Link>
        )}
      </div>
      <a
        href="/nyheter/rss.xml"
        className="relative inline-flex items-center gap-1.5 self-start text-[14px] text-orange underline underline-offset-2 hover:text-orange"
      >
        <IconRss size={16} />
        Nyheter via RSS
      </a>
    </section>
  );
}
