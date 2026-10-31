@AGENTS.md

# Team Blekinge LF – ny hemsida (demo)

New website for Team Blekinge Löparförening (running club, Karlskrona), replacing the
SvenskaLag site at teamblekinge.nu. This is a **clickable demo**: Next.js 16 App Router +
React 19 + Tailwind 4, no database yet. Content lives in `src/lib/data/*.ts`; login and
interactions are faked (see "Demo plumbing").

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
- `src/app/admin/` — administration (own chrome, board members only).
- `src/components/ui.tsx` — Page, SectionHeading, ArrowLink, Pill, DateBadge, Avatar, SpeedLines, PageHero.
- `src/components/icons.tsx` — line icons. `Logo.tsx` — wordmark with animated runners.
- `src/lib/data/` — club, users, events, races, news, feed (+ documents). `lib/format.ts` — Swedish dates.

## Demo plumbing

- **Login**: `lib/session.ts` reads cookie `tb_demo_user` (`ingrid` = member, `stina` = board).
  `app/(site)/logga-in/actions.ts` has `loginAs` / `logout`. Pages that need a member call
  `getSession()` and `redirect("/logga-in?next=…")` when null. Real auth later: Auth.js magic
  links + passkeys, as drawn.
- **Interactions** (likes, "jag hänger med", comments, sign-ups, uploads): client components using
  `useDemoState(key, initial)` from `lib/demo-store.ts` (localStorage, survives reloads; reset
  from the footer). Never pretend data reached a server.
- "Today" is the real date (`todayISO()`); content is dated around Oct–Nov 2026.
- Demo people in `lib/data/users.ts` are fictional. Real names only where the old site publishes
  them (board, contacts).
