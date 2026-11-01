import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IconInfo } from "@/components/icons";
import { Page } from "@/components/ui";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import { loginAs } from "./actions";

export const metadata: Metadata = { title: "Logga in" };

export default async function LoginPage({ searchParams }: PageProps<"/logga-in">) {
  const { next } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (await getSession()) redirect(target);

  return (
    <Page className="flex justify-center px-4 pt-10 pb-28 md:pt-16">
      <div className="flex w-full max-w-[440px] flex-col gap-6">
        <div data-reveal className="flex flex-col gap-2">
          <h1 className="m-0 flex items-center gap-3.5 text-[34px] font-extrabold tracking-[-0.5px]">
            <span aria-hidden="true" className="skew-bar bg-orange" />
            Logga in
          </h1>
          <p className="m-0 text-[17px] text-muted">
            Skriv din e-postadress så skickar vi en inloggningslänk. Inget lösenord behövs.
          </p>
        </div>

        <div data-reveal="up" style={{ "--reveal-i": 1 } as React.CSSProperties}>
          <LoginForm next={target} />
        </div>

        <div className="card flex gap-3 p-4 text-[15px]" data-reveal="up" style={{ "--reveal-i": 2 } as React.CSSProperties}>
          <IconInfo size={20} className="mt-0.5 flex-none text-purple" />
          <p className="m-0">
            <strong>Första gången på nya hemsidan?</strong> Alla medlemmar får en inbjudan via mejl. Ditt gamla
            SvenskaLag-konto behövs inte längre.
          </p>
        </div>

        <form action={loginAs} className="rounded-xl border border-dashed border-purple/40 bg-purple-soft p-4 text-[14px]">
          <input type="hidden" name="user" value="stina" />
          <input type="hidden" name="next" value="/admin" />
          <p className="m-0">
            <strong>Demo:</strong> vill du se administrationen?{" "}
            <button type="submit" className="font-semibold text-purple underline">
              Logga in som styrelseledamot
            </button>
          </p>
        </form>

        <p className="m-0 text-center text-[15px]">
          Inte medlem än?{" "}
          <Link href="/trana-med-oss#prova-pa" className="font-bold">
            Prova på gratis
          </Link>{" "}
          eller{" "}
          <Link href="/bli-medlem" className="font-bold">
            bli medlem
          </Link>
          .
        </p>
      </div>
    </Page>
  );
}
