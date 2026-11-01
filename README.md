# Team Blekinge LF – ny hemsida

Klickbar demo av den nya hemsidan för Team Blekinge Löparförening, byggd efter
skisserna i `TeamBlekingeLF–nyhemsida.html` (skärmdumpar i `docs/design/`).

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript. Ingen databas än –
grundinnehållet ligger i `src/lib/data/`, inloggningen är låtsas och klick sparas i webbläsaren.
Det styrelsen ändrar i administrationen sparas på servern i en egen sandlåda per besökare
(`.data/sandboxes/`): ingen annan ser ändringarna, och de försvinner när webbläsaren stängs.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Prova demon

- **Som besökare:** startsidan, Träna med oss, Tävla (+ loppsidor), Föreningen, Bli medlem,
  Nyheter, Kalender, Frågor & kontakt.
- **Som medlem:** *Logga in* → skriv valfri e-post → *Öppna länken från mejlet (demo)*, eller
  *Logga in med passkey*. Du blir då ”Ingrid” och ser medlemshemmet, Klubbflödet,
  medlemsnyheter med anmälan och Dokument.
- **Som styrelse:** *Logga in som styrelseledamot* på inloggningssidan (eller en e-post som
  börjar på `stina`) → *Administration* i kontomenyn. Där ändras nyheter, kalendern, dokument
  (riktiga PDF:er), Aktuellt-bandet, alla sidtexter, föreningsuppgifter, styrelse, historia,
  vanliga frågor, sponsorer, träning och loppen. På webbplatsen finns knappen *Ändra den här
  sidan*.
- *Så fungerar demon* (`/om-demon`) beskriver vad som händer på riktigt och vad demon gör i
  stället.
- *Återställ demons klick* i sidfoten nollställer gillningar, anmälningar och kommentarer;
  *Återställ allt innehåll* i administrationen nollställer dina ändringar.

## Rörelse

Föreningen vill ha en levande sida som förmedlar rörelse. Det som rör sig:
logotypens tre löpare ”tar start” när sidan laddas, rubriker springer in och rätar upp sig,
diagonala fartlinjer med ljusstrimmor i de mörka banden, hero-bilden sveper in längs sin
diagonal, kort lutar sig framåt vid hover och landar snett på plats när man scrollar,
sidbyten springer ut åt vänster och in från höger (View Transitions), menymarkeringen glider
till nästa flik, en löpare springer längs sidans överkant i takt med scrollningen och en
nedräkning till nästa lopp tickar. Allt stängs av för den som valt minskad rörelse.

## Innehåll

Fakta (tider, platser, avgifter, lopp, styrelse) kommer från nuvarande teamblekinge.nu –
se `docs/content-from-old-site.md`. Medlemmar, kommentarer, inlägg och terminsplanens pass
är påhittad demodata. Platshållare i hakparentes (t.ex. `[Maxtid per lopp och distans]`)
är sådant föreningen behöver fylla i.

## Vägen till skarp drift

1. Databas (Postgres + Prisma, som Startskottet) i stället för `src/lib/content/store.ts`
   (samma läs/skriv-gränssnitt, ingen sandlåda per besökare) och fillagring för uppladdningar.
2. Inloggning med Auth.js: e-postlänk + passkeys, inbjudan av befintliga medlemmar.
3. Det som återstår i administrationen: resultat, anmälningslistor och moderering av flödet.
4. Mejlutskick (nyheter per kategori, inställda pass, påminnelser).
5. Driftsätt: `docker compose up -d --build`, sedan `../tunnel/add-subdomain.sh teamblekinge 3016`.

## Licens

Källkoden är MIT-licensierad – se [LICENSE](LICENSE). Föreningens namn, logotyper och bilder
samt partnerlogotyperna i `public/img/` tillhör respektive ägare och omfattas inte av licensen.
