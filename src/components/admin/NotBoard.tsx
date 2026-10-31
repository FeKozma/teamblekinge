import Link from "next/link";
import { loginAs } from "@/app/(site)/logga-in/actions";
import { IconShield } from "@/components/documents/bits";
import type { DemoUser } from "@/lib/data/users";

/** A logged-in member who isn't on the board ends up here instead of the admin. */
export function NotBoard({ user }: { user: DemoUser }) {
  return (
    <main id="main" className="mx-auto flex max-w-[720px] flex-col items-start gap-5 px-4 pt-12 pb-20 md:px-6 md:pt-16">
      <span className="tilt-pop flex h-14 w-14 -rotate-3 items-center justify-center rounded-xl bg-purple text-white shadow-[0_10px_22px_rgba(91,42,134,0.3)]">
        <IconShield size={28} />
      </span>
      <h1 className="run-in m-0 flex items-center gap-3.5 text-[32px] leading-tight font-extrabold tracking-[-0.8px] md:text-[40px]">
        <span aria-hidden="true" className="skew-bar bg-orange" />
        Bara för styrelsen
      </h1>
      <p className="run-in m-0 text-[17px]" style={{ "--i": 1 } as React.CSSProperties}>
        Hej {user.firstName}! Administrationen är till för styrelsen och de som styrelsen har gett behörighet. Här
        laddas protokoll upp, nyheter skrivs och kalendern hålls i ordning.
      </p>
      <p className="run-in m-0 text-[17px] text-muted" style={{ "--i": 2 } as React.CSSProperties}>
        Vill du få ut något på webbplatsen – en nyhet, ett resultat eller en bild från långpasset? Skriv i
        Klubbflödet eller hör av dig till styrelsen.
      </p>
      <div className="run-in flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
        <Link href="/" className="btn btn-primary">
          Till startsidan
        </Link>
        <Link href="/dokument" className="btn btn-outline">
          Dokument
        </Link>
        <Link href="/flodet" className="btn btn-outline">
          Klubbflödet
        </Link>
      </div>
      <form
        action={loginAs}
        className="mt-4 rounded-xl border border-dashed border-purple/40 bg-purple-soft p-4 text-[14px]"
      >
        <input type="hidden" name="user" value="stina" />
        <input type="hidden" name="next" value="/admin/dokument" />
        <p className="m-0">
          <strong>Demo:</strong> vill du se administrationen?{" "}
          <button type="submit" className="cursor-pointer font-semibold text-purple underline">
            Byt till styrelseledamoten Stina
          </button>
        </p>
      </form>
    </main>
  );
}
