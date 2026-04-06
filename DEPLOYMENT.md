# Health Guard — Deployment Guide

Complete step-by-step guide to go from local dev to live on Vercel with Google OAuth.

---

## Overview

You need to complete these in order:
1. Run database migration 002 in Supabase
2. Set up Google OAuth credentials
3. Configure Supabase for production
4. Push code to GitHub
5. Deploy to Vercel
6. Update Supabase with your Vercel URL

---

## Step 1: Run Migration 002 in Supabase

1. Open your Supabase project → **SQL Editor** → **New query**
2. Paste the contents of `supabase/migrations/002_auth_and_types.sql`
3. Click **Run**
4. Confirm it says "Success"

---

## Step 2: Set Up Google OAuth

### 2.1 Create a Google Cloud Project

1. Go to **https://console.cloud.google.com**
2. Click the project dropdown at the top → **New Project**
3. Name it `health-guard` → **Create**
4. Make sure it's selected as the active project

### 2.2 Enable the OAuth API

1. Go to **APIs & Services → OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `Health Guard`
   - User support email: your email
   - Developer contact email: your email
4. Click **Save and Continue** through the remaining screens (no need to add scopes manually)
5. On the Summary screen, click **Back to Dashboard**

### 2.3 Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `Health Guard Web`
5. Under **Authorized redirect URIs**, click **+ Add URI** and enter:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   *(Replace `YOUR-PROJECT-REF` with your Supabase project ref — found in Supabase → Settings → General)*
6. Click **Create**
7. Copy the **Client ID** and **Client Secret** — you'll need them next

---

## Step 3: Configure Supabase for Google OAuth

1. Open your Supabase project → **Authentication → Providers**
2. Find **Google** and toggle it **on**
3. Paste your **Client ID** and **Client Secret** from Step 2.3
4. Click **Save**

### 3.1 Set Site URL (do after you have your Vercel URL — see Step 6)

This tells Supabase where to redirect after login. Come back to this step.

---

## Step 4: Push Code to GitHub

```bash
cd /home/sheldon/vibe_projects/health_guard

# Initialize git if not already done
git init
git add .
git commit -m "Initial Health Guard build"

# Create a new repo on github.com (call it health-guard)
# Then connect it:
git remote add origin https://github.com/YOUR-USERNAME/health-guard.git
git push -u origin main
```

Make sure `.env.local` is in `.gitignore` — it should be (create-next-app adds it automatically). Never commit your Supabase keys.

---

## Step 5: Deploy to Vercel

1. Go to **https://vercel.com** → **Sign Up** (use GitHub for easiest setup)
2. Click **Add New → Project**
3. Import your `health-guard` GitHub repo
4. Vercel auto-detects Next.js — leave all build settings as defaults
5. Before clicking **Deploy**, open **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

6. Click **Deploy**
7. Wait ~2 minutes for the build to complete
8. Copy your deployment URL (e.g., `https://health-guard-xyz.vercel.app`)

---

## Step 6: Update Supabase with Your Vercel URL

Now that you have your Vercel URL, go back to Supabase:

### 6.1 Set Site URL
1. Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to: `https://health-guard-xyz.vercel.app`
3. Click **Save**

### 6.2 Add Redirect URLs
1. Under **Redirect URLs**, click **+ Add URL** and add:
   ```
   https://health-guard-xyz.vercel.app/**
   ```
2. Also add your local dev URL if you want OAuth to work locally:
   ```
   http://localhost:3000/**
   ```
3. Click **Save**

### 6.3 Update Google Cloud Redirect URI
1. Go back to Google Cloud Console → **Credentials → your OAuth client**
2. Add a second **Authorized redirect URI**:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   *(This was already added in Step 2.3 — confirm it's still there)*

---

## Step 7: Test the Full Flow

1. Visit your Vercel URL in an incognito/private window
2. You should see the Health Guard login page
3. Click **Sign in with Google**
4. Complete the Google login flow
5. You should land on `/status` with your real name shown
6. Try logging a medication — it should persist after refresh
7. Sign out in Settings → sign back in → logs should still be there

---

## Local Development with OAuth

For Google OAuth to work on localhost:

1. In Google Cloud Console → Credentials → your OAuth client
2. Add to **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback
   ```
   Wait, this redirect goes to Supabase first, not your app directly. Supabase handles it.
   
   Actually, you just need Supabase's redirect URL in Google Cloud — which you've already added. The Supabase → your app redirect is handled by the `Redirect URLs` setting in Supabase (Step 6.2 above — add `http://localhost:3000/**`).

3. Your `.env.local` is already set up. Just run:
   ```bash
   npm run dev
   ```

---

## Environment Variables Reference

| Variable | Where to get it | Required |
|----------|----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key | Yes |

---

## Troubleshooting

**"Invalid redirect URI" from Google**
→ Double-check the redirect URI in Google Cloud Console matches exactly: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

**Redirects to login in a loop**
→ Check that Site URL is set correctly in Supabase → Authentication → URL Configuration

**"User not found" or blank profile**
→ Run migration 002 in Supabase — it creates the trigger that auto-creates profiles on login

**OAuth works locally but not on Vercel**
→ Make sure `https://your-app.vercel.app/**` is in Supabase Redirect URLs
