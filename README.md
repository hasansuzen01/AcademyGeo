# AcademyGeo

Interactive training for the static clues that decide a GeoGuessr round: plate
colours, bollard heads, road lines, signage script, vegetation and
architecture. Cards you miss come back on a spaced repetition schedule until
they stick.

| App | Path | Port | Stack |
| --- | --- | --- | --- |
| Frontend | `frontend` | 3000 | Next.js 16 (App Router), Tailwind 4, Framer Motion, next-intl |
| Backend | `backend` | 3001 | NestJS 12, Prisma 7, PostgreSQL, Redis, Better Auth |

## Setup

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Fill in `backend/.env`:

- `BETTER_AUTH_SECRET` — any 32+ character random string, e.g. `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — from the Google Cloud console.
  Add `http://localhost:3001/api/auth/callback/google` as an authorised redirect URI.

The API refuses to start until those three are set. Uploading pictures also
needs a Cloudflare R2 bucket. Every value, and where to click to get it, is in
[docs/servisler.md](docs/servisler.md).

## Database

Postgres and Redis run in Docker on ports 5433 and 6380 so they do not clash
with anything already on the default ports.

```bash
docker compose up -d postgres redis
npm run db:migrate --workspace backend   # create the schema
npm run seed --workspace backend         # 28 countries, 32 metas
```

`npm run seed:art --workspace backend` redraws the card illustrations into
`frontend/public/metas`. Run it after editing `backend/prisma/catalogue.ts`,
which is the single source for countries, metas and their artwork.

## Ways to play

`/play` is a hub rather than a session. Practice is the untimed spaced
repetition run; the other four are scored, and the server deals every card and
keeps the score, so a leaderboard row can only be earned by playing.

| Mode | Rule | What it is for |
| --- | --- | --- |
| Practice | Untimed, 12 cards | The spaced repetition session. Nothing is scored. |
| Daily challenge | 10 cards, once a day | The same hand for everyone, seeded from the UTC date. |
| Rush | 90 seconds | As many as you can name. Speed and a run of correct answers both pay. |
| Survival | 3 lives | Easy cards first, so the run gets harder as a life gets more expensive. |
| Weak spots | 15 cards | Built from the countries the player actually gets wrong. |

An answer scores a flat base, a bonus for answering quickly, a bonus for the
harder cards, and a multiplier that grows with the run of correct answers
behind it and stops at 2x. Every answer, in every mode, still feeds the same
spaced repetition schedule: the modes differ in how they score, never in what
they remember.

A run is one row. The hand it was dealt lives on that row rather than in the
browser, so the client is never told what is coming, and a refresh picks the
run back up instead of losing it. Walking away banks whatever the run had, with
one exception: a half-played daily challenge is left open, because it is the
only attempt that day.

`/leaderboard` shows one row per player, their best run in the mode, over all
time or the past week.

## Collections

`/collections` holds themed runs through part of the catalogue: plates,
bollards, road lines, left-hand traffic, script, and the cards experienced
players still lose rounds to. Each one can be studied untimed, raced against
the clock, or played with three lives.

Membership is a rule rather than a list of slugs, written in
`backend/prisma/decks.ts`, so a collection picks up new cards as admins add
them instead of quietly going stale. Admins can also build one by hand in
`/admin/decks`, which is where an event deck with a closing date belongs.

## Levels and badges

Every answer earns experience, a correct one earns more, and the harder cards
earn more again, so a bad session still moves the number. Levels cost
progressively more. Sixteen badges sit behind milestones in cards answered,
days in a row, level, run score, answer streak, clean daily sheets and distinct
countries named. The catalogue lives in `backend/src/progress/achievements.ts`
rather than in a table: the names belong in the translation files, and a rule
nobody can edit cannot drift out of step with the badge it unlocks.

## Atlas

`/atlas` is the reference half of the site, open to everyone. Each country
carries the facts a player checks once they think they know where they are,
which side of the road, the domain and dialling code, the currency, the
languages, the coverage generations, and a sentence on what to look at first.
Under those sit every published clue picture, grouped in the order a player
works through a scene: the car in front, then the roadside, then the road, then
the wider view. Admins edit all of it from `/admin/countries`.

Card pictures are filed under hashed names, and an uploaded photograph loses
the filename it arrived with. A card called `tr-plate.svg` would hand the
answer to anyone who opened the network tab.

## Admin panel

The first admin is whoever signs in with an email listed in `ADMIN_EMAILS`.
An existing account is promoted with:

```bash
npm run admin:grant --workspace backend -- someone@example.com
```

`/admin` then covers cards, collections, countries, accounts and an activity
log. There is no separate admin sign-in: the role is checked on the server, and
anyone without it gets a 404 rather than a locked door.

Card pictures are uploaded straight to R2 from the browser; the API only signs
the request, so no image ever passes through it.

## Cards waiting for a picture

A card is a picture with a question attached, so it cannot go into a practice
session without one. Cards can be written long before anyone has a photograph
for them, and those sit as drafts: out of every session, out of the atlas, and
counted on the admin overview as the upload queue. Publishing one without a
picture is refused with a message saying so.

`backend/prisma/draft-cards.ts` holds 64 of them, covering all 28 countries and
all nine clue types. Each already carries the country, the clue type, the
difficulty and the explanation a player sees after answering. All an admin has
to add is the photograph, in `/admin/metas`, where the list can be filtered
down to exactly the cards still waiting.

Re-seeding never touches a card's picture or whether it is live. Both belong to
whoever runs the site once the card exists, so a re-seed cannot undo an upload
or take a published card back down.

## Real pictures

Cards carry an `imageSource`. A `PHOTO` is a real photograph and fills the card
frame the way a game screen does. An `ILLUSTRATION` is one of the seeded
diagrams standing in for a photograph, letterboxed so no detail is cropped.

The 32 seeded cards all start as diagrams. Uploading a picture in the card
editor marks that card a photograph; the admin overview counts how many are
still waiting, and the card list filters on it.

## Accounts

`/admin/users` lists every account with its level, answers, last seen and role,
and filters by role or status. Each row opens an account page carrying what the
player has built up, the countries they keep missing, their recent scored runs
and their badges, next to the four things an admin can do:

- **Grant or take away admin.** The role is read from the database on every
  request, so taking it away takes effect on the person's next click.
- **Suspend or restore.** A suspended account cannot sign in, disappears from
  the leaderboards, and has its open sessions closed on the spot. Its history is
  kept, so restoring gives everything back. A reason can be recorded and is
  shown to whoever lifts it later.
- **Sign out everywhere.** Closes every open session without changing anything
  else.
- **Delete.** Removes the account and everything it has answered. This is the
  one that cannot be undone, which is why suspending exists.

Two rules stop the panel locking itself: nobody can suspend, demote or delete
their own account, and the last remaining admin cannot be taken out either.
Every one of these writes a line to the audit trail naming who did it.

## Blog, pages and search engines

`/admin/posts` writes blog posts with a rich text editor. A post belongs to one
language rather than being a translation pair, so an author writes for one
audience at a time. The body is cleaned by the API before it is stored, so what
reaches a reader is what a browser can safely render.

`/admin/pages` holds the standing pages the footer links to. They are seeded in
both languages: about, privacy, cookies and terms.

`/admin/seo` carries the site-wide settings: default titles, the crawling rule,
a hand-written robots.txt, and the verification and measurement ids. Nothing is
loaded into a visitor's browser while a measurement field is empty.

`/robots.txt` and `/sitemap.xml` are built per request from those settings.
Outside production everything is closed to crawlers, so a staging copy never
competes with the real site for the same searches.

## Development

```bash
npm run dev            # backend on :3001 and frontend on :3000
npm run dev:backend
npm run dev:frontend
```

## Other commands

```bash
npm run build    # both apps
npm run start    # both apps from their production builds
npm run lint
npm test         # scheduler, queue, choices, streak and locale tests
```

## Everything in Docker

```bash
docker compose up --build
```

Compose reads `backend/.env` and `frontend/.env.local`, so there is nothing to
fill in at the repository root. The frontend image bakes its `NEXT_PUBLIC_*`
values at build time, so rebuild that service after changing the public URLs.

## How the review scheduler works

`backend/src/review/srs.ts` is an SM-2 variant. Instead of asking players to
rate their own recall it derives the grade from response time: under 2.5s
counts as instant, under 8s as steady, slower as hesitant. A wrong answer sends
the card back within ten minutes and lowers its ease factor, which never drops
below 1.3. Correct answers move the card 1 day out, then 6, then by the ease
factor each time.

`backend/src/review/choices.ts` draws the three wrong options from the
answer's own region first, so a session trains you to tell Turkey from Georgia
rather than from Brazil.

## Language

The interface ships in English and Turkish. The proxy at
`frontend/src/proxy.ts` reads the visitor's country from the hosting platform's
geo header and sends Turkish visitors to `/tr` and everyone else to `/en`. The
language toggle in the header writes a `NEXT_LOCALE` cookie that overrides the
country for later visits.
