@AGENTS.md

# Team Blekinge LF – ny hemsida (demo)

New website for Team Blekinge Löparförening (running club, Karlskrona), replacing the
SvenskaLag site at teamblekinge.nu. This is a **clickable demo**: Next.js 16 App Router +
React 19 + Tailwind 4, no database yet. Content is seeded from `src/lib/data/*.ts` and edited
by the board in `/admin` (stored as JSON on the server in a per-visitor sandbox, see "Content
store"); login and member interactions are faked (see "Demo plumbing").

## Commands

```bash
npm run dev      # next dev (Turbopack)
npm run build    # production build (output: standalone)
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Where the design comes from

- `docs/design/*.jpg` — screenshots of the 9 drawups (the source of truth for layout).
- `docs/design/markup-p*.html` — the drawups' original markup (inline styles; exact
  colours, sizes, spacing). Image `src`s there are bundle ids, not files.
- `docs/content-from-old-site.md` — facts scraped from the current site. Use these for copy;
  do not invent facts about the club (fees, times, places, people).
- `TeamBlekingeLF–nyhemsida.html` — the original bundled export (open in a browser).

## Design language

The club wants a **living page that conveys movement** — "we're a running club, we love
movement". Things lean, slant and run in; few things are perfectly static or square.

- Colours (Tailwind tokens in `globals.css`): `ink` #221E1F, `orange` #EE8915,
  `orange-dark` #A85400 (links/kickers on light bg), `purple` #5B2A86, `paper` #F4F2F0 (page bg),
  `line` #E4E0DC (borders), `muted` #5F5754 (secondary text), `mist` #E7E2DF (text on ink).
- Type: Inter, headings 800 weight with slight negative tracking.
- Signature shapes: dark bands with **slanted clip-path edges**, **diagonal orange speed lines**
  (`<SpeedLines>`), **skewed accent bars** before headings (`<SectionHeading>`), slightly
  **rotated** cards/pills (−3°…+2°), images with a **diagonal edge** (`.diag-img`).
- Cards: white, `border-line`, 12px radius. Pills: `<Pill tone>`. Dates: `<DateBadge>`.
- Buttons: `.btn` + `.btn-primary` (orange) / `.btn-dark` / `.btn-outline` / `.btn-outline-light`, `.btn-lg`.
- Swedish UI copy; code, comments and identifiers in English.

## Motion toolkit (use it, don't reinvent it)

All motion is gated on `html.motion` (set before paint only when the visitor has not asked for
reduced motion), so without JS / with reduced motion everything renders in its final state.

- `data-reveal` (`""` = from left, `"up"`, `"right"`, `"lean"`) — entrance on scroll; stagger
  with `style={{ "--reveal-i": i }}`. Handled by `RevealObserver` (also picks up client-rendered nodes).
- `data-settle` + `--rest-rotate` — cards that drop in tilted and settle into a resting tilt.
- `.run-in` + `--i` — headline words/lines leaning in on load. `.tilt-pop` — the hero accent.
- `.lean-hover` (lift), `.straighten-hover` (tilted card straightens), `.diag-img` (diagonal edge
  slides on `group` hover), `.stripes-drift` (moving stripes on orange), `.live-dot` (pulse).
- `<Page>` (in `components/ui.tsx`) wraps every page's content in a React `<ViewTransition>`:
  pages run out left / run in right. **Every page.tsx must render `<Page>`.**
- The active nav underline morphs between tabs via `view-transition-name: nav-indicator`.

## Structure

- `src/app/(site)/` — everything with the public header/footer/mobile tab bar.
  `page.tsx` = landing for guests, member home (`components/member/MemberHome.tsx`) when logged in.
- `src/app/admin/` — administration (own chrome, board members only). `/admin` = overview;
  one folder per section (`nyheter`, `kalender`, `dokument`, `sidor`, `vanliga-fragor`, …).
  Sections not built yet are `planned` in `components/admin/sections.ts` and fall through to
  `admin/[section]` (a "Kommer snart" page).
- `src/components/ui.tsx` — Page, SectionHeading, ArrowLink, Pill, DateBadge, Avatar, SpeedLines, PageHero.
- `src/components/icons.tsx` — line icons. `Logo.tsx` — wordmark with animated runners.
- `src/lib/data/` — SEED content: club, users, events, races, news, feed, documents, and
  `pages/` (editable page texts). Pure helpers and types only; never read seed values in a
  page — read through `lib/content`. `lib/format.ts` — Swedish dates.
- `src/lib/content/` — server-only getters/savers over the content store (see below).

## Content store (everything the board can edit)

The site's text and data must be editable by non-technical board members, so nothing a
visitor reads should be hard-coded in a page.

- `lib/content/store.ts`: `readCollection(key, seed)` / `writeCollection(key, value)` — one JSON
  file per collection. Unedited collections fall back to their seed in `lib/data`. Uploads:
  `saveUpload(file, {kinds})` checks magic bytes; images are served by `/filer/[id]`, PDFs only
  through routes that check access. `resetContent()` backs "Återställ allt innehåll".
- **Demo sandbox**: each visitor's edits and uploads are private to them. The first save sets a
  session cookie (`tb_demo_sandbox`) and data lives in `.data/sandboxes/<id>/` (`CONTENT_DIR`
  overrides `.data`; git-ignored); idle sandboxes are swept after 12 h, uploads capped at 50 MB
  per visitor. So: the board's edits are visible only to the editing visitor in the demo, and
  admin copy says so ("i demon bara för dig"). Uploaded images aren't visible to next/image's
  optimizer — use `unoptimized={isUploadUrl(src)}` (`lib/uploads.ts`).
- Demo-only limits are fine: an action that can't work in a demo (sending e-mail, inviting
  people …) may just show `toast("Demoläget …", "info")` — but the UI must show how the real
  flow would work.
- One module per area: `lib/content/news.ts`, `events.ts`, `club.ts` (club facts, board, roles,
  FAQs, partners), `training.ts`, `races.ts`, `pages.ts`. Getters are async; server components
  `await` them and pass data down as props. Client components never import seed values.
- **Page texts**: each fixed page lists its texts in `lib/data/pages/<page>.ts` (key, label a
  layperson understands, default text, `long` for paragraphs) grouped as the page shows them.
  The page reads them with `const t = await getPageTexts("<page>")` → `t("hero.title")`
  (unknown key throws). Long texts: render `paragraphs(t("…"))`. `/admin/sidor/<page>` builds
  the editor from the definition automatically. Reference: `fragor.ts` + `(site)/fragor/page.tsx`.
- **Admin pages**: `<AdminPage title intro crumbs publicHref>` frame; forms use the kit in
  `components/admin/form.tsx` — `<AdminForm action>` (saves without reload, toast, sticky save
  bar, unsaved-changes warning), `<FormSection>`, `TextInput`/`TextArea`/`SelectInput`/
  `CheckboxField`, and `<ListEditor name initial fields newItem titleField>` for lists (posted as
  JSON; parse with `parseList`). Props crossing to client components must be serializable (no
  functions). Server actions live next to the page (`actions.ts`, `"use server"`), start with
  `await boardOnly()`, validate, write, call `published()` (revalidates everything) and return
  `saved("…")` or `invalid({ field: "message" })` — see `components/admin/server.ts`.
  Reference section: `app/admin/vanliga-fragor/`.
- Board members browsing the site get an "Ändra den här sidan" button (`EditThisPage`), mapped
  in `lib/admin-links.ts` — add a line when a page gets an editor.
- Admin copy: plain Swedish, say what happens ("Syns direkt på webbplatsen"), help text under
  fields, errors next to the field. No jargon (slug, JSON, markdown).

## Demo plumbing

- **Login**: `lib/session.ts` reads cookie `tb_demo_user` (`ingrid` = member, `stina` = board).
  `app/(site)/logga-in/actions.ts` has `loginAs` / `logout`. Pages that need a member call
  `getSession()` and `redirect("/logga-in?next=…")` when null. Real auth later: Auth.js magic
  links + passkeys, as drawn.
- **Member interactions** (likes, "jag hänger med", comments, sign-ups, the member's own
  settings at `/installningar`): client components using `useDemoState(key, initial)` from
  `lib/demo-store.ts` (localStorage, survives reloads; reset from the footer). The demo login is
  shared by every visitor, so personal state stays per browser. Never pretend data reached a
  server. **Admin edits** really reach the server (content store), but in the visitor's own
  sandbox — nobody else sees them.
- "Today" is the real date (`todayISO()`); content is dated around Oct–Nov 2026.
- Demo people in `lib/data/users.ts` are fictional. Real names only where the old site publishes
  them (board, contacts).
