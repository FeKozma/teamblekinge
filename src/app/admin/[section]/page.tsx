import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { getAdminSection } from "@/components/admin/sections";
import { Page } from "@/components/ui";

type Props = PageProps<"/admin/[section]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return { title: getAdminSection(section)?.label ?? "Administration" };
}

/** Placeholder for the admin sections that aren't built yet (`planned` in sections.ts). */
export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  const s = getAdminSection(section);
  if (!s?.planned) notFound();
  if (!(await requireBoard())) return null;

  return (
    <Page className="min-w-0 flex-1 pb-12!">
      <div className="flex max-w-[880px] flex-col gap-6 px-4 pt-6 md:px-6 md:pt-8">
        <div data-reveal className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="m-0 flex items-center gap-3.5 text-[28px] leading-tight font-extrabold tracking-[-0.5px] md:text-[30px]">
            <span aria-hidden="true" className="skew-bar bg-orange" />
            {s.label}
          </h1>
          <span className="bg-purple px-2.5 py-1 text-[12px] font-extrabold tracking-[1px] text-white uppercase [rotate:-2deg]">
            Kommer snart
          </span>
        </div>

        <section
          className="card relative overflow-hidden p-6 md:p-8"
          data-reveal="up"
          style={{ "--reveal-i": 1 } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className="stripes-drift absolute -top-4 -right-6 h-20 w-44 bg-orange/90"
            style={{ clipPath: "polygon(28% 0, 100% 0, 72% 100%, 0 100%)" }}
          />
          <h2 className="relative m-0 max-w-[70%] text-[13px] font-bold tracking-[1px] text-muted uppercase">
            Det här ska du kunna göra här
          </h2>
          <p className="relative m-0 mt-3 max-w-[640px] text-[18px] leading-relaxed">{s.about}</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="btn btn-dark">
              Till översikten
            </Link>
            {s.publicHref && (
              <Link href={s.publicHref} className="btn btn-outline">
                {s.publicLabel} på webbplatsen <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </Page>
  );
}
