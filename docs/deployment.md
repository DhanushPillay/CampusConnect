# Deployment Guide

Local-first app. No Supabase, Vercel, Razorpay, Resend, Docker, or AWS involved.

---

## Prerequisites

- Node.js 18+ and npm
- That's it. SQLite file DB, no external services.

---

## Local run

```bash
npm install
cp .env.example .env.local   # fill in the 4 vars below
npx prisma migrate dev
npm run dev                  # http://localhost:3000
```

---

## Production build (same machine or any Node host)

```bash
npm run build
npm start
```

Scripts: `dev`, `build`, `start`, `lint`. No containers, no serverless config.

---

## Database

SQLite. `DATABASE_URL="file:./dev.db"` in `.env.example`.

- Local/dev: `npx prisma migrate dev`
- Prod: `npx prisma migrate deploy`
- The `dev.db` file lives next to the schema. Back it up if it matters.

---

## Environment variables

Only 4 (see `docs/environment.md`):

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generated>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate the secret with:

```bash
openssl rand -base64 32
```

Never ship `change-me-in-production`.

---

## What production still needs

1. **Hosted database** — SQLite file works on one VM (with backups). For multi-instance, move to Postgres and update `DATABASE_URL` + `datasource db provider` in `prisma/schema.prisma`.
2. **Migrate on deploy** — run `npx prisma migrate deploy` before `npm start`.
3. **Real secret + URLs** — fresh `NEXTAUTH_SECRET`, `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` set to the public origin (https).
4. **Auth** stays next-auth JWT Credentials. No OAuth/Supabase keys to configure.

---

## Troubleshooting

- **Prisma can't find DB:** check `DATABASE_URL` path and that `prisma/migrations` ran.
- **Auth loops / JWT errors:** `NEXTAUTH_SECRET` missing or changed; `NEXTAUTH_URL` must match the origin.
- **Build fails:** run `npm run lint` locally and fix errors first.
