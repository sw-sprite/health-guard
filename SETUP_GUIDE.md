# Health Guard — Setup Guide

While the app is being built, complete the steps below. Each section is ordered by priority.

---

## 1. Supabase (Required — do this first)

Supabase is the backend (database + auth). The free tier is sufficient.

1. Go to **https://supabase.com** and create a free account
2. Click **"New project"**
   - Organization: create one if prompted (your name is fine)
   - Project name: `health-guard`
   - Database password: generate a strong one and **save it somewhere safe**
   - Region: pick the one closest to you
3. Wait ~2 minutes for the project to provision
4. Once ready, go to **Project Settings → API**
5. Copy these two values — you'll need them later:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public key** (long JWT string)

That's it for now. You'll paste these into a `.env.local` file once the app scaffold is ready.

---

## 2. Local Prerequisites (Verify)

You already have Node.js 18 installed. Just confirm these are present:

```bash
node --version   # Should be v18+
npm --version    # Should be v9+
git --version    # Any version is fine
```

No other installs needed right now.

---

## 3. Running the App Locally

Once the scaffold is built, do the following:

### 3.1 Create environment file

In the project root (`health_guard/`), create a file called `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with the ones you copied from Supabase in Step 1.

### 3.2 Install dependencies and run

```bash
cd /home/sheldon/vibe_projects/health_guard
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 4. Supabase Database Setup

Once the app is running, you'll need to run the database migrations. The SQL file will be at:

```
health_guard/supabase/migrations/001_initial_schema.sql
```

To run it:
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Paste the contents of the migration file
5. Click **"Run"**

---

## 5. Vercel (For Deployment — can do later)

You only need this when you're ready to deploy publicly. Skip for now.

1. Go to **https://vercel.com** and create a free account (sign up with GitHub for easiest setup)
2. Create a GitHub repo for the project and push the code
3. In Vercel: **"Add New Project"** → import the GitHub repo
4. Add the same environment variables from `.env.local` in the Vercel dashboard
5. Deploy

---

## Summary Checklist

| Task | Where | Status |
|------|--------|--------|
| Create Supabase account | supabase.com | ⬜ |
| Create `health-guard` Supabase project | supabase.com | ⬜ |
| Copy Supabase URL + anon key | Project Settings → API | ⬜ |
| Create `.env.local` with Supabase credentials | project root | ⬜ (after scaffold done) |
| Run `npm install && npm run dev` | terminal | ⬜ (after scaffold done) |
| Run database migration SQL | Supabase SQL Editor | ⬜ (after above) |
| Create Vercel account | vercel.com | ⬜ (later) |
