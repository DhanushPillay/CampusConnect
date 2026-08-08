# Deployment Guide

Step-by-step deployment to Vercel + Supabase (zero cost).

---

## Prerequisites

- [GitHub account](https://github.com)
- [Vercel account](https://vercel.com) (free, sign up with GitHub)
- [Supabase account](https://supabase.com) (free, sign up with GitHub)
- [Razorpay account](https://razorpay.com) (for payments)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose organization (or create one)
4. Fill in:
   - **Project name**: `campus-connect`
   - **Database password**: (save this somewhere safe)
   - **Region**: Choose closest to your users (e.g., `Mumbai` for India)
5. Click **Create new project**
6. Wait 1-2 minutes for setup

### Get API Keys

1. In your project dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Get Database Connection

1. Go to **Settings** → **Database**
2. Under **Connection string**, copy the URI
3. Replace `[YOUR-PASSWORD]` with your database password
4. This is your `DATABASE_URL`

---

## Step 2: Set Up Razorpay (Optional - for payments)

1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Complete KYC verification
3. Go to **Settings** → **API Keys**
4. Generate keys:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

---

## Step 3: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/campus-connect.git
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your `campus-connect` repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Click **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
DATABASE_URL = your-database-url
RAZORPAY_KEY_ID = your-razorpay-key-id
RAZORPAY_KEY_SECRET = your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID = your-razorpay-key-id
```

6. Click **Deploy**
7. Wait for build to complete (2-3 minutes)

---

## Step 5: Run Database Migrations

After first deploy, you need to set up the database schema.

### Option A: Via Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Option B: Via Supabase SQL Editor

1. Go to Supabase dashboard → **SQL Editor**
2. Copy the contents of your `prisma/migrations` SQL files
3. Run them in order

---

## Step 6: Seed Initial Data

The seed script creates:
- Default admin account
- Sample campus
- Sample departments and classes

```bash
npx prisma db seed
```

**Default admin login:**
```
Email: admin@campusconnect.com
Password: admin123
```

Change this password immediately after first login.

---

## Step 7: Prevent Supabase Free Tier Pausing

Supabase free tier pauses projects after 7 days of inactivity. Set up a keep-alive ping.

### Option A: UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com) and sign up
2. Click **Add New Monitor**
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: CampusConnect DB Keep-Alive
   - **URL**: `https://your-project.supabase.co/rest/v1/`
   - **Monitoring Interval**: Every 6 days
4. Save

This sends a request to your Supabase project every 6 days, preventing it from pausing.

### Option B: GitHub Actions (Free)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Supabase Alive
on:
  schedule:
    - cron: '0 0 */5 * *'  # Every 5 days
  workflow_dispatch:

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"
```

Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your GitHub repo secrets.

---

## Step 8: Custom Domain (Optional)

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Enter your domain name
3. Add DNS records as shown by Vercel
4. SSL is auto-configured

---

## Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Create first campus
- [ ] Create departments and classes
- [ ] Create teacher accounts
- [ ] Create student accounts
- [ ] Set up fee structures
- [ ] Test payment flow with Razorpay test mode
- [ ] Set up UptimeRobot for keep-alive
- [ ] Verify email delivery (Resend)

---

## Environment Variables Reference

See [environment.md](environment.md) for the complete list.

---

## Troubleshooting

### Build fails on Vercel
- Check that all environment variables are set in Vercel dashboard
- Run `npx prisma generate` locally and commit the generated files

### Database connection refused
- Check `DATABASE_URL` format: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`
- Ensure Supabase project is not paused (check dashboard)

### Supabase project paused
- Go to Supabase dashboard → click **Restore project**
- Set up UptimeRobot to prevent future pausing

### Razorpay payment not updating
- Check webhook is configured: Razorpay Dashboard → Settings → Webhooks
- Webhook URL: `https://your-domain.com/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`
