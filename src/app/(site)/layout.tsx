import { EditThisPage } from "@/components/admin/EditThisPage";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileTabBar } from "@/components/MobileTabBar";
import { getSession } from "@/lib/session";
import { guestNav, memberNav } from "@/lib/nav";
import { feed } from "@/lib/data/feed";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  return (
    <>
      <SiteHeader user={user} />
      {children}
      <SiteFooter />
      {user?.role === "board" && <EditThisPage />}
      <MobileTabBar
        nav={user ? memberNav : guestNav}
        user={user ? { firstName: user.firstName, role: user.role } : null}
        feedBadge={feed.filter((p) => p.unread).length}
      />
    </>
  );
}
