# Environment Variables

Five variables. All in `.env.example`. No Supabase, Razorpay, or Resend vars exist.

---

## Setup

```bash
cp .env.example .env
```

Fill in the values below. Never commit `.env` or `.env.local`.

---

## Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Pooled PostgreSQL URL used by the app at runtime | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Direct PostgreSQL URL used by Prisma migrations | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_URL` | Origin used for auth callbacks | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for next-auth JWT signing | output of `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public app URL (client-visible) | `http://localhost:3000` |

With Neon, `DATABASE_URL` is the pooled connection string and `DIRECT_URL` is the direct (non-pooled) string.

---

## Template (`.env.example`)

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Prisma CLI

Prisma CLI reads `.env` but not `.env.local`. Keep both URLs in `.env`, or export them before running Prisma commands.

```powershell
$env:DATABASE_URL="<pooled URL>"
$env:DIRECT_URL="<direct URL>"
npx prisma migrate dev
```

---

## Security notes

- Never commit `.env` or `.env.local` (both are gitignored).
- Generate the secret: `openssl rand -base64 32`. Replace `change-me-in-production` before any shared deploy.
- Rotate `NEXTAUTH_SECRET` if exposed (invalidates all sessions).
- In production, both URLs must be the https origin.
- The demo seed password is defined in `prisma/seed.js`. Change it before sharing an environment.
