# Deployment Guide

Production target: Vercel Hobby + Neon Postgres (free tiers). No Docker, AWS, Razorpay, or Resend involved.

---

## Prerequisites

- Node.js 18+ and npm
- A Neon Postgres project (provisioned via Vercel Storage tab → Neon integration)
- Vercel project linked to this repo

---

## Local run

Local dev also uses Postgres now (schema provider is `postgresql` — SQLite is no longer supported).

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL + DIRECT_URL (Neon branch URL works)
npx prisma migrate dev
npm run dev                  # http://localhost:3000
```

Note: Prisma CLI does not read `.env.local`. Export `DATABASE_URL` and `DIRECT_URL` inline when running Prisma commands outside Next.js, e.g.:

```bash
$env:DATABASE_URL="<direct Neon URL>"; $env:DIRECT_URL="<direct Neon URL>"; npx prisma migrate dev
```

---

## Production build (Vercel)

Vercel runs `npm run vercel-build`, which is `prisma generate && prisma migrate deploy && next build`.

Scripts: `dev`, `build`, `vercel-build`, `start`, `typecheck`, `test`, `boundaries`.

---

## Database

Postgres (Neon). `DATABASE_URL` is the pooled URL (runtime), `DIRECT_URL` is the direct URL (migrations).

- Local/dev: `npx prisma migrate dev` (needs direct URL exported)
- Prod: `npx prisma migrate deploy` (runs automatically in `vercel-build`)
- Seed (demo accounts, `password123`): `npx prisma db seed` — run **once manually**, never on deploy

---

## Environment variables

```
DATABASE_URL="<pooled Neon URL>"
DIRECT_URL="<direct Neon URL>"
NEXTAUTH_URL="https://<your-app>.vercel.app"
NEXTAUTH_SECRET="<generated>"
NEXT_PUBLIC_APP_URL="https://<your-app>.vercel.app"
```

Generate the secret with:

```bash
openssl rand -base64 32
```

Never ship `change-me-in-production`.

---

## What production still needs

1. **Neon database** — create via Vercel Storage tab; vars auto-inject into the Vercel project.
2. **Migrate on deploy** — automatic via `vercel-build`.
3. **Real secret + URLs** — fresh `NEXTAUTH_SECRET`, `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` set to the public origin (https).
4. **Auth** stays next-auth JWT Credentials. No OAuth/Supabase keys to configure.

---

## Troubleshooting

- **Prisma can't find DB:** export `DATABASE_URL`/`DIRECT_URL` inline (Prisma ignores `.env.local`); check `prisma/migrations` ran.
- **Auth loops / JWT errors:** `NEXTAUTH_SECRET` missing or changed; `NEXTAUTH_URL` must match the origin.
- **Build fails:** run `npm run typecheck` locally and fix errors first.
