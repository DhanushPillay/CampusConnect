# Environment Variables

Complete reference for all environment variables.

---

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the values for each variable below.

---

## Required Variables

### Supabase

| Variable | Where to get it | Example |
|----------|-----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` is a secret. Never expose it to the client. Only use in API routes.

### Database

| Variable | Where to get it | Example |
|----------|-----------------|---------|
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string → URI | `postgresql://postgres:password@db.xyzcompany.supabase.co:5432/postgres` |

> **Note:** Replace `[YOUR-PASSWORD]` with your database password. Use the **Transaction** mode connection string for serverless (Vercel).

### Razorpay (for payments)

| Variable | Where to get it | Example |
|----------|-----------------|---------|
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys → Key ID | `rzp_test_xxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys → Key Secret | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (exposed to client for checkout) | `rzp_test_xxxxxxxxxxxxx` |

> **Note:** Use test keys during development. Switch to live keys only for production.

---

## Optional Variables

### App Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Your app's URL (set to production URL when deploying) |
| `NEXT_PUBLIC_APP_NAME` | `CampusConnect` | App name displayed in UI |

### Email (Resend)

| Variable | Where to get it | Description |
|----------|-----------------|-------------|
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys | API key for sending emails |
| `RESEND_FROM_EMAIL` | Your verified domain email | Sender email (e.g., `noreply@campusconnect.com`) |

### Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTAUTH_SECRET` | (generate one) | Secret for JWT encryption. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` | Your app's URL for auth callbacks |

### File Storage

| Variable | Default | Description |
|----------|---------|-------------|
| `SUPABASE_STORAGE_BUCKET` | `campus-connect` | Supabase Storage bucket name for file uploads |

---

## Environment File Template

```env
# ===========================================
# CAMPUSCONNECT - Environment Variables
# ===========================================

# -------------------------------------------
# Supabase
# -------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# -------------------------------------------
# Database
# -------------------------------------------
DATABASE_URL=postgresql://postgres:your-password@db.xyzcompany.supabase.co:5432/postgres

# -------------------------------------------
# Razorpay
# -------------------------------------------
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# -------------------------------------------
# App Configuration
# -------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CampusConnect

# -------------------------------------------
# Auth
# -------------------------------------------
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# -------------------------------------------
# Email (Optional)
# -------------------------------------------
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# RESEND_FROM_EMAIL=noreply@campusconnect.com

# -------------------------------------------
# Storage (Optional)
# -------------------------------------------
# SUPABASE_STORAGE_BUCKET=campus-connect
```

---

## Getting Supabase Connection String

The `DATABASE_URL` format for Supabase is:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Steps:
1. Go to Supabase Dashboard → Settings → Database
2. Under **Connection string**, select **URI**
3. Copy the string
4. Replace `[YOUR-PASSWORD]` with your actual database password

---

## Vercel Environment Variables

When deploying to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with its value
3. Select which environments to apply (Production, Preview, Development)
4. Click **Save**

> **Tip:** You can paste the entire `.env.local` content into Vercel's bulk editor.

---

## Security Notes

- Never commit `.env.local` to Git (it's in `.gitignore`)
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — keep it secret
- Use test Razorpay keys during development, live keys only in production
- Rotate `NEXTAUTH_SECRET` if it's ever exposed
- In production, ensure all URLs use HTTPS
