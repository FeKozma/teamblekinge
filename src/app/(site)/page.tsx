import { Landing } from "@/components/landing/Landing";
import { MemberHome } from "@/components/member/MemberHome";
import { Page } from "@/components/ui";
import { todayISO } from "@/lib/format";
import { getSession } from "@/lib/session";

// Guests get the public landing page; logged-in members get their own home
// ("Medlemshem") on the same URL, as in the mobile drawups.
export default async function HomePage() {
  const user = await getSession();
  const today = todayISO();
  return <Page>{user ? <MemberHome user={user} today={today} /> : <Landing today={today} />}</Page>;
}
