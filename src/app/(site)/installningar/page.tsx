import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/documents/Toaster";
import { SettingsForm } from "@/components/member/SettingsForm";
import { Page, PageHero } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Inställningar", robots: { index: false } };

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect("/logga-in?next=/installningar");
  return (
    <Page>
      <PageHero
        kicker="Ditt konto"
        title="Inställningar"
        intro="Dina kontaktuppgifter och vilka mejl du vill ha från föreningen."
      />
      <div className="mx-auto max-w-[880px] px-4 pt-4 pb-16 md:px-6">
        <SettingsForm user={{ id: user.id, firstName: user.firstName, email: user.email }} />
      </div>
      <Toaster aboveTabBar />
    </Page>
  );
}
