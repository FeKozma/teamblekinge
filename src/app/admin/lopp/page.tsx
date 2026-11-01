import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { IconArrowDown, IconArrowUp, IconPencil, IconPlus } from "@/components/icons";
import { Pill } from "@/components/ui";
import { getRaces } from "@/lib/content/races";
import { todayISO } from "@/lib/format";
import { isUploadUrl } from "@/lib/uploads";
import { moveRaceAction } from "./actions";

export const metadata: Metadata = { title: "Våra lopp" };

const iconButton =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

export default async function AdminRacesPage({ searchParams }: PageProps<"/admin/lopp">) {
  if (!(await requireBoard())) return null;
  const [races, { borttaget }] = await Promise.all([getRaces(), searchParams]);
  const today = todayISO();

  return (
    <AdminPage
      title="Våra lopp"
      intro="Loppen som klubben arrangerar. De visas under Tävla och i det mörka bandet på startsidan, i den här ordningen. Nedräkningen överst visar alltid nästa lopp."
      publicHref="/tavla"
      publicLabel="Visa Tävla"
      actions={
        <Link href="/admin/lopp/nytt" className="btn btn-primary">
          <IconPlus size={18} /> Lägg till ett lopp
        </Link>
      }
    >
      {borttaget && (
        <p role="status" className="m-0 rounded-[10px] border border-line bg-white px-4 py-3 font-semibold">
          Loppet är borttaget.
        </p>
      )}
      <p className="m-0 -mt-2 text-[14px] text-muted">
        Rubriker och texter som är gemensamma för alla lopp ändrar du under{" "}
        <Link href="/admin/sidor/tavla" className="font-semibold">
          Sidtexter › Tävla
        </Link>
        .
      </p>
      {races.length === 0 ? (
        <p className="card m-0 p-6 text-center text-muted">Inga lopp ännu.</p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-3 p-0 pb-12">
          {races.map((r, i) => {
            const upcoming = r.start.slice(0, 10) >= today;
            return (
              <li
                key={r.slug}
                data-reveal="up"
                style={{ "--reveal-i": i } as CSSProperties}
                className="card flex flex-wrap items-center gap-4 p-3 pr-4"
              >
                <span className="relative h-[72px] w-[108px] flex-none overflow-hidden rounded-lg border border-line bg-white">
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    sizes="108px"
                    unoptimized={isUploadUrl(r.image)}
                    className={r.imageFit === "contain" ? "object-contain p-1.5" : "object-cover"}
                  />
                </span>
                <span className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
                  <Link href={`/admin/lopp/${r.slug}`} className="text-[18px] font-extrabold text-ink no-underline hover:underline">
                    {r.name}
                  </Link>
                  <span className="text-[14px] text-muted">
                    {r.dateLabel} · {r.place}
                  </span>
                  <Pill tone={upcoming ? "orange" : "soft"}>{upcoming ? "Kommande" : "Har varit"}</Pill>
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <form action={moveRaceAction.bind(null, r.slug, -1)}>
                    <button type="submit" disabled={i === 0} aria-label={`Flytta upp: ${r.name}`} title="Flytta upp" className={iconButton}>
                      <IconArrowUp size={18} />
                    </button>
                  </form>
                  <form action={moveRaceAction.bind(null, r.slug, 1)}>
                    <button
                      type="submit"
                      disabled={i === races.length - 1}
                      aria-label={`Flytta ner: ${r.name}`}
                      title="Flytta ner"
                      className={iconButton}
                    >
                      <IconArrowDown size={18} />
                    </button>
                  </form>
                  <Link href={`/admin/lopp/${r.slug}`} className="btn btn-dark ml-2 min-h-10 px-3 text-[14px]">
                    <IconPencil size={16} /> Ändra
                  </Link>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </AdminPage>
  );
}
