import Link from "next/link";
import { MobileTabBar } from "@/components/MobileTabBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Page, SpeedLines } from "@/components/ui";
import { guestNav, memberNav } from "@/lib/nav";
import { getSession } from "@/lib/session";

export default async function NotFound() {
  const user = await getSession();
  return (
    <>
      <SiteHeader user={user} />
      <Page>
        <section
          className="relative overflow-hidden bg-ink text-white"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 56px), 0 100%)" }}
        >
          <SpeedLines
            lines={[
              [500, 640, 920, 0],
              [600, 640, 1020, 0],
              [700, 640, 1120, 0],
              [800, 640, 1220, 0],
            ]}
          />
          <div className="relative mx-auto flex max-w-[1200px] flex-col items-start gap-5 px-4 pt-16 pb-32 md:px-6">
            <span className="run-in bg-orange px-3 py-1 text-[13px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
              404 · fel väg
            </span>
            <h1 className="run-in m-0 max-w-[700px] text-[40px] leading-[1.05] font-extrabold tracking-[-1px] md:text-[56px]">
              Den här sidan har <span className="tilt-pop inline-block -rotate-3 text-orange">sprungit vilse</span>
            </h1>
            <p className="run-in m-0 max-w-[560px] text-[18px] text-mist">
              Kanske låg den på gamla hemsidan, eller så har banan lagts om. Vänd tillbaka mot start.
            </p>
            <div className="run-in flex flex-wrap gap-3">
              <Link href="/" className="btn btn-primary btn-lg">
                Till startsidan
              </Link>
              <Link href="/kalender" className="btn btn-outline-light btn-lg">
                Se kalendern
              </Link>
            </div>
          </div>
        </section>
        <div className="h-24" />
      </Page>
      <SiteFooter />
      <MobileTabBar
        nav={user ? memberNav : guestNav}
        user={user ? { firstName: user.firstName, role: user.role } : null}
      />
    </>
  );
}
