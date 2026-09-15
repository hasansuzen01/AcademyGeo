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
npm run db:push --workspace backend      # bring the schema up to date
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
| Duel | 20 cards, two answers | One picture and the two countries this player keeps mixing up. |
| Flash | 15 cards, from memory | The picture is covered before the answer, and the look shortens with the streak. |
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

`/leaderboard` opens on the site-wide table, which ranks every account by
experience: every mode feeds it, so nobody climbs it by picking the mode that
suits them, and a new player has a place on it from their first answer. The
other tabs are per mode and show one row per player, their best run in it, over
all time or the past week.

A duel picks its second country from the pairs this player actually confuses,
falling back to a neighbour when there is no history to go on. Flash decides
its own reveal window on the server and shortens it by a third of a second for
every correct answer in a row, down to a floor of 1.2 seconds. Covering the
picture is still the browser's job, so the flash board is only as honest as the
player's browser; the site-wide table is built on experience, which is earned
one answer at a time and is not worth doctoring.

## Collections

`/collections` holds themed runs through part of the catalogue: plates,
bollards, road lines, left-hand traffic, script, and the cards experienced
players still lose rounds to. Each one can be studied untimed, raced against
the clock, or played with three lives.

Membership of the shipped collections is a rule rather than a list of slugs,
written in `backend/prisma/decks.ts`, and it fills each one the first time it
is created. From then on a collection belongs to the panel: cards published
later are added to it in `/admin/decks`, and a redeploy never rewrites its
name, its contents or whether it is live. Admins can also build one by hand
there, which is where an event deck with a closing date belongs.

## Sound

The game makes a noise when an answer lands, when a streak reaches five, when
the picture drops in flash mode, and when a run ends. Nothing is downloaded for
any of it: the sounds are written as note lists in
`frontend/src/lib/sound-design.ts` and played through the Web Audio API.

That is deliberate. Synthesised sounds weigh nothing, so there is no audio to
fetch before the first card; they belong to this project rather than to whoever
recorded them; and a note list can be read and argued with, which an audio file
cannot. The rule behind the notes is the one nobody has to be taught: up means
yes, down means no, and nothing lasts long enough to get in the way.

The speaker in the header turns it all off, remembered in that browser. A
browser that refuses to remember it still plays, because sound is a
convenience and a refused write is not an error worth showing anyone.

## Levels and badges

Every answer earns experience, a correct one earns more, and the harder cards
earn more again, so a bad session still moves the number. Levels cost
progressively more. Sixteen badges sit behind milestones in cards answered,
days in a row, level, run score, answer streak, clean daily sheets and distinct
countries named. The catalogue lives in `backend/src/progress/achievements.ts`
rather than in a table: the names belong in the translation files, and a rule
nobody can edit cannot drift out of step with the badge it unlocks.

## Atlas

`/atlas` opens on a world map. Countries the deck covers are painted and can
be clicked; the rest are drawn flat, because a map with holes in it reads as
broken rather than as unfinished. A search box and the country list sit under
it, because typing a name is faster than hunting for it.

The map is not a map service. Country borders do not move, so fetching them at
runtime would buy an outage and a rate limit for nothing. The shapes come from
Natural Earth by way of the `world-atlas` package, which is public domain, and
`npm run map:build --workspace frontend` projects them once into
`frontend/src/lib/world-map.json`. The page then renders that on the server as
plain SVG paths: no geometry library reaches the browser, no JavaScript is
needed to use the map, and each country is a real link that can be opened in a
new tab. Rounded to whole pixels and with Antarctica left out, the whole world
costs about 29 KB over the wire.

The map zooms, because Luxembourg is four pixels wide at world scale. The wheel
zooms towards the pointer, dragging moves the view, and there are buttons for
anyone not using a mouse. Only the viewBox is worked out in the browser: the
shapes are handed to the client component as children, already rendered on the
server, so the geometry still never reaches the bundle. The wheel is only
swallowed when it actually moved the map, so scrolling down a page past a map
that is already zoomed out carries on down the page instead of stopping dead
on it.

It is the reference half of the site, open to everyone. Each country
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

Re-seeding never touches a card that already exists: not its text, its
difficulty, its picture or whether it is live. All of it belongs to whoever
runs the site once the card exists, so a re-seed cannot undo an edit or an
upload, or take a published card back down. The same holds for countries: a
fact corrected in `/admin/countries` stays corrected. Editing the seed files
only changes a fresh database.

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

## The guide

`/guides` is the reading half of the site: the metas written down, rather
than asked. It is two levels. A **heading** names a kind of clue, the way a
player would say it out loud, and under it sit the **articles** that say what
to look at and what each thing narrows the answer down to. Power poles is a
heading; wooden poles with two crossarms is an article under it.

Both are written in `/admin/guides`. A heading carries a title, a summary, an
icon and, optionally, the clue type it teaches. An article is a rich text body
with pictures, written in the same editor the blog uses and cleaned by the API
the same way, plus the country it is about when it is about one.

Two switches decide what is public. An article is only readable when it and
its heading are both live, so a heading can go up long before there is enough
under it to publish, and publishing an article early cannot drag the
unfinished heading into public with it.

The library is wired into the rest of the site rather than sitting beside it:

- A heading tied to a clue type offers **practise these cards**, which opens a
  practice session dealt from that clue type alone.
- An article about a country links to that country in the atlas, and the
  country's atlas page lists the articles written about it.
- Finishing an article offers the next one under the same heading.
- Getting a card wrong now offers the country it was, instead of stopping at
  two sentences.

Ten headings are seeded, one per kind of clue, in both languages and as
drafts. They are created once and never updated, so wording changed in the
panel stays changed.

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

Compose reads `backend/.env`, so there is nothing to fill in at the repository
root. The web app's public URLs are build arguments, listed in the compose
file, so rebuild that service after changing one.

The schema is the single source of truth. The API brings the database up to
it with `prisma db push` on every start, in the container and on a laptop
alike, so nothing reads the leftover `backend/prisma/migrations` folder.

## Deploying to Coolify

Two services, each built from its own Dockerfile with the **repository root**
as the build context. In Coolify that means Base Directory `/` and Dockerfile
Location `backend/Dockerfile` or `frontend/Dockerfile`. Both images run as
`node` rather than root and carry a health check Coolify can wait on.

Add Postgres and Redis as Coolify resources and paste the connection strings
it gives you into the API's `DATABASE_URL` and `REDIS_URL`. The
`docker-compose.yml` in this repository is for a laptop: its database
password is in the file and both ports are bound to the loopback.

**The API** reads everything at run time, so its settings are ordinary
environment variables. It brings the database up to the shape the code expects
on every start, with `prisma db push`, and then seeds. The seed only ever
adds rows: nothing an admin has edited in the panel is written a second time,
so a redeploy cannot undo their work. `SKIP_SEED=1` turns it off.

**The web app** bakes everything the browser is told into the bundle at build
time, so these four have to be set as Coolify **build arguments**, not only as
runtime variables:

| Build argument | Example |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.academygeo.com` |
| `NEXT_PUBLIC_AUTH_URL` | `https://api.academygeo.com` |
| `NEXT_PUBLIC_APP_URL` | `https://academygeo.com` |
| `NEXT_PUBLIC_MEDIA_HOST` | `https://media.academygeo.com` |

Leaving `NEXT_PUBLIC_MEDIA_HOST` out builds a site that refuses to draw a
single uploaded picture, because next/image will not load a host it was not
told about. Set `INTERNAL_API_URL` as a runtime variable too if the two
services share a private network; server-rendered pages will take it.

Three settings on the API have to agree with the web app's address, and the
symptom when they do not is a site that looks fine and cannot keep anyone
signed in: `WEB_URL`, `CORS_ORIGIN` and, when the two share a parent domain,
`AUTH_COOKIE_DOMAIN` (`.academygeo.com`). The session cookie is sent
cross-site automatically whenever the two hosts differ, so a deployment on two
unrelated domains works as well.

Google's console needs `{API_URL}/api/auth/callback/google` as an authorised
redirect URI before anyone can sign in.

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
