import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/documents/bits";
import { IconEye } from "@/components/icons";
import { Page } from "@/components/ui";

/**
 * The frame of every admin page: breadcrumbs, a heading that says what the
 * page is for, a link to where the content shows on the site, then the page.
 */
export function AdminPage({
  title,
  intro,
  crumbs,
  publicHref,
  publicLabel = "Visa på webbplatsen",
  actions,
  children,
}: {
  title: string;
  intro?: ReactNode;
  /** Ancestors only, e.g. [{ title: "Nyheter", href: "/admin/nyheter" }]. */
  crumbs?: { title: string; href: string }[];
  publicHref?: string;
  publicLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Page className="min-w-0 flex-1 pb-0!">
      <div className="flex max-w-[960px] flex-col gap-6 px-4 pt-5 md:px-6 md:pt-6">
        {crumbs && crumbs.length > 0 && (
          <Breadcrumbs crumbs={[{ title: "Administration", href: "/admin" }, ...crumbs]} current={title} />
        )}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3" data-reveal>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="m-0 flex items-center gap-3.5 text-[28px] leading-tight font-extrabold tracking-[-0.5px] md:text-[30px]">
              <span aria-hidden="true" className="skew-bar bg-orange" />
              {title}
            </h1>
            {intro && <p className="m-0 max-w-[640px] text-[16px] text-muted">{intro}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {publicHref && (
              <Link href={publicHref} className="btn btn-outline bg-white" target="_blank">
                <IconEye size={18} /> {publicLabel}
                <span className="sr-only">(öppnas i ny flik)</span>
              </Link>
            )}
          </div>
        </div>
        {children}
      </div>
    </Page>
  );
}
