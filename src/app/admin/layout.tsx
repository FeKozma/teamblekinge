import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { NotBoard } from "@/components/admin/NotBoard";
import { Toaster } from "@/components/documents/Toaster";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration – Team Blekinge LF" },
  robots: { index: false },
};

// The admin has its own chrome (drawup 09) — not the public header, footer or
// tab bar. Guests are sent to log in; members who aren't on the board get a
// friendly "Bara för styrelsen" instead. Pages with data check again
// (requireBoard), since layouts don't re-render on every navigation.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getSession();
  if (!user) redirect("/logga-in?next=/admin/dokument");
  return (
    <div className="min-h-dvh bg-paper text-[15px]">
      <AdminTopBar user={user} />
      {user.role === "board" ? (
        <div className="mx-auto flex w-full max-w-[1440px] flex-col lg:flex-row lg:items-start">
          <AdminSidebar />
          {children}
        </div>
      ) : (
        <NotBoard user={user} />
      )}
      <Toaster />
    </div>
  );
}
