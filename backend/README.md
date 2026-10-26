# AcademyGeo API

NestJS 12 + Prisma 7 + PostgreSQL + Redis. See the [root README](../README.md) for the architecture, setup and test commands.

```bash
npm run dev            # watch mode on :3001
npm test               # unit tests (Vitest)
npm run test:e2e       # end-to-end tests, needs Postgres + Redis
npm run db:push        # sync the schema in prisma/schema.prisma
npm run seed           # seed countries, starter cards, pages and guides
```
