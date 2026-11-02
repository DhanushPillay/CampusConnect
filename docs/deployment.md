# Deployment Guide

Production target: Vercel Hobby + Neon Postgres (free tiers). No Docker, AWS, Razorpay, or Resend involved.

---

## Prerequisites

- Node.js 18+ and npm
- A Neon Postgres project (provisioned via the Vercel Storage tab -> Neon integration)
- A Vercel project linked to this repo

---

## Local run

Local dev uses Postgres (the schema provider is `postgresql`; SQLite is not supported).

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL + DIRECT_URL
npx prisma migrate dev
npx prisma db seed
npm run dev                  # http://localhost:3000
```

Prisma CLI reads `.env` but not `.env.local`. Export both URLs inline when running Prisma commands outside Next.js, or keep them in `.env`:

```powershell
$env:DATABASE_URL="<pooled Neon URL>"
$env:DIRECT_URL="<direct Neon URL>"
npx prisma migrate dev
```

---

## Production build (Vercel)

Vercel runs `npm run vercel-build`, which is `prisma generate && prisma migrate deploy && next build`.

Scripts: `dev`, `build`, `vercel-build`, `start`, `lint`, `typecheck`, `test`, `boundaries`.

Before deploying, run:

```bash
npm run typecheck
npm test
npm run boundaries
npm run build
```

ESLint uses `next/core-web-vitals` via `.eslintrc.json`.

---

## Database

Postgres (Neon). `DATABASE_URL` is the pooled URL (runtime), `DIRECT_URL` is the direct URL (migrations).

- Local/dev: `npx prisma migrate dev`
- Production: `npx prisma migrate deploy` (runs automatically in `vercel-build`)
- Seed demo accounts: `npx prisma db seed` - run once manually, never on deploy

The latest migration `20261028000000_integrity_fixes` adds a unique index on `FeeInvoice(studentId, feeStructureId)`. Applying it will fail if existing rows contain duplicates; deduplicate those rows before deploying.

---

## Environment variables

```env
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

1. **Neon database** - create via the Vercel Storage tab; vars auto-inject into the Vercel project.
2. **Migrations on deploy** - automatic via `vercel-build`.
3. **Real secret + URLs** - fresh `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` set to the public https origin.
4. **Seed accounts** - run the seed once if the database is empty, then change the demo password.

---

## Troubleshooting

- **Prisma cannot find the DB:** export `DATABASE_URL` / `DIRECT_URL` inline (Prisma ignores `.env.local`); confirm migrations ran.
- **Auth loops / JWT errors:** `NEXTAUTH_SECRET` missing or changed; `NEXTAUTH_URL` must match the public origin.
- **Build fails:** run `npm run typecheck` and `npm test` locally first.
- **Migration fails on the unique index:** check for duplicate `(studentId, feeStructureId)` rows in `FeeInvoice`.
