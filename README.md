# AcademyGeo

Interactive training for the static clues that decide a GeoGuessr round: plate
colours, bollard heads, road lines, signage script, vegetation and
architecture. Cards you miss come back on a spaced repetition schedule until
they stick.

| App | Path | Port | Stack |
| --- | --- | --- | --- |
| Web | `apps/web` | 3000 | Next.js 16 (App Router), Tailwind 4, Framer Motion, next-intl |
| API | `apps/api` | 3001 | NestJS 12, Prisma 7, PostgreSQL, Redis, Better Auth |

## Setup

```bash
npm install

cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/api/.env`:

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
npm run db:migrate --workspace api   # create the schema
npm run seed --workspace api         # 28 countries, 32 metas
```

`npm run seed:art --workspace api` redraws the card illustrations into
`apps/web/public/metas`. Run it after editing `apps/api/prisma/catalogue.ts`,
which is the single source for countries, metas and their artwork.

## Admin panel

The first admin is whoever signs in with an email listed in `ADMIN_EMAILS`.
An existing account is promoted with:

```bash
npm run admin:grant --workspace api -- someone@example.com
```

`/admin` then covers cards, collections, countries, accounts and an activity
log. There is no separate admin sign-in: the role is checked on the server, and
anyone without it gets a 404 rather than a locked door.

Card pictures are uploaded straight to R2 from the browser; the API only signs
the request, so no image ever passes through it.

## Real pictures

Cards carry an `imageSource`. A `PHOTO` is a real photograph and fills the card
frame the way a game screen does. An `ILLUSTRATION` is one of the seeded
diagrams standing in for a photograph, letterboxed so no detail is cropped.

The 32 seeded cards all start as diagrams. Uploading a picture in the card
editor marks that card a photograph; the admin overview counts how many are
still waiting, and the card list filters on it.

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
npm run dev      # api on :3001 and web on :3000
npm run dev:api
npm run dev:web
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

The web image bakes `NEXT_PUBLIC_*` values at build time, so rebuild the web
service after changing the public URLs.

## How the review scheduler works

`apps/api/src/review/srs.ts` is an SM-2 variant. Instead of asking players to
rate their own recall it derives the grade from response time: under 2.5s
counts as instant, under 8s as steady, slower as hesitant. A wrong answer sends
the card back within ten minutes and lowers its ease factor, which never drops
below 1.3. Correct answers move the card 1 day out, then 6, then by the ease
factor each time.

`apps/api/src/review/choices.ts` draws the three wrong options from the
answer's own region first, so a session trains you to tell Turkey from Georgia
rather than from Brazil.

## Language

The interface ships in English and Turkish. The proxy at
`apps/web/src/proxy.ts` reads the visitor's country from the hosting platform's
geo header and sends Turkish visitors to `/tr` and everyone else to `/en`. The
language toggle in the header writes a `NEXT_LOCALE` cookie that overrides the
country for later visits.
