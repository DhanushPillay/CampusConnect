# Environment Variables

Exactly 4. All in `.env.example`. No Supabase, Razorpay, or Resend vars exist.

---

## Setup

```bash
cp .env.example .env.local
```

Fill in the 4 values below. Never commit `.env.local`.

---

## Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file location | `file:./dev.db` |
| `NEXTAUTH_URL` | Origin used for auth callbacks | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for next-auth JWT signing | output of `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public app URL (client-visible) | `http://localhost:3000` |

---

## Template (`.env.example`)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Security notes

- Never commit `.env.local` (it's gitignored).
- Generate the secret: `openssl rand -base64 32`. Replace `change-me-in-production` before any shared deploy.
- Rotate `NEXTAUTH_SECRET` if exposed (invalidates all sessions).
- In production, both URLs must be the https origin.
