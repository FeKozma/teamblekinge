"use client";

import { useState } from "react";
import { IconKey, IconMail } from "@/components/icons";
import { loginAs } from "./actions";

/**
 * DEMO of the passwordless login in the drawup: e-mail magic link or passkey.
 * Nothing is sent — "opening the link" just logs you in as a demo member.
 * An address starting with "stina" or containing "styrelse" logs in as a
 * board member, which unlocks the admin pages.
 */
export function LoginForm({ next }: { next: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) {
    const user = /^stina|styrelse/i.test(sentTo) ? "stina" : "ingrid";
    return (
      <div className="flex flex-col gap-4" aria-live="polite">
        <span className="mail-fly flex h-16 w-16 items-center justify-center rounded-2xl bg-orange text-ink">
          <IconMail size={30} />
        </span>
        <h2 className="m-0 text-[22px] font-extrabold">Kolla din mejl</h2>
        <p className="m-0 text-muted">
          Vi har skickat en inloggningslänk till <strong className="text-ink">{sentTo}</strong>. Länken gäller i 15
          minuter och kan bara användas en gång.
        </p>
        <form action={loginAs}>
          <input type="hidden" name="user" value={user} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="btn btn-primary btn-lg w-full">
            Öppna länken från mejlet (demo)
          </button>
        </form>
        <button type="button" onClick={() => setSentTo(null)} className="self-start text-[15px] font-semibold text-orange-dark underline">
          Fel adress? Skriv in en annan
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
          if (email) setSentTo(email);
        }}
      >
        <label className="flex flex-col gap-2 font-semibold">
          E-postadress
          <input
            name="email"
            type="email"
            required
            autoComplete="email webauthn"
            placeholder="namn@exempel.se"
            className="h-[52px] rounded-xl border border-line bg-white px-4 text-[17px] font-normal outline-none transition-shadow focus:border-orange focus:ring-4 focus:ring-orange/25"
          />
        </label>
        <button type="submit" className="btn btn-primary btn-lg w-full">
          Skicka inloggningslänk
        </button>
      </form>
      <div className="flex items-center gap-4 text-[14px] text-muted">
        <span className="h-px flex-1 bg-line" />
        eller
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={loginAs}>
        <input type="hidden" name="user" value="ingrid" />
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="btn btn-outline btn-lg w-full !border-ink">
          <IconKey size={20} /> Logga in med passkey
        </button>
      </form>
      <p className="m-0 text-center text-[14px] text-muted">
        Med en passkey loggar du in med Face ID, fingeravtryck eller telefonens kod.
      </p>
    </div>
  );
}
