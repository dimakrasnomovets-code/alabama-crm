# CRM Production Deployment Guide

Follow these steps to successfully deploy the Alabama Foreclosure CRM to Vercel and Supabase.

## 1. Supabase Database Setup (The Foundation)

Before deploying the code, create and configure your production database.

1.  **Create Project:** Go to [Supabase](https://supabase.com) and create a new project.
2.  **Run Migrations:** Open the **SQL Editor** in your new project and run the contents of these files in order:
    - [001_initial_schema.sql](file:///C:/Users/krasn/Alabama_hunting/supabase/migrations/001_initial_schema.sql)
    - [002_seed_scoring.sql](file:///C:/Users/krasn/Alabama_hunting/supabase/migrations/002_seed_scoring.sql)
    - [003_activity_triggers.sql](file:///C:/Users/krasn/Alabama_hunting/supabase/migrations/003_activity_triggers.sql)
    - [004_dashboard_rpc.sql](file:///C:/Users/krasn/Alabama_hunting/supabase/migrations/004_dashboard_rpc.sql)
    - [005_close_integration.sql](file:///C:/Users/krasn/Alabama_hunting/supabase/migrations/005_close_integration.sql)
    - [006_notifications_and_search.sql](file:///C:/Users/krasn/Alabama_hunting/supabase/migrations/006_notifications_and_search.sql)

> [!CAUTION]
> Ensure you run them sequentially. `001` must be first.

---

## 2. GitHub Preparation

Ensure your local repository is pushed to a remote GitHub repository.

1.  **Commit Your Changes:**
    ```bash
    git add .
    git commit -m "Final Phase 6 Features (Search, Notify, Settings, Export)"
    ```
2.  **Push to main:**
    ```bash
    git push origin main
    ```

---

## 3. Vercel Deployment

1.  **Link Repository:** In the [Vercel Dashboard](https://vercel.com), click **Add New** > **Project** and select your GitHub repository.
2.  **Configure Build:**
    - **Framework Preset:** Next.js
    - **Build Command:** `npm run build`
3.  **Add Environment Variables:** (See below)
4.  **Deploy:** Click **Deploy**.

---

## 4. Environment Variables (Critical)

You must add these in the Vercel **Settings > Environment Variables** tab:

| Variable | Source |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project API Key (Anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Project Secret Key (Service Role) |
| `CRON_SECRET` | Generate a random string (e.g., `openssl rand -base64 32`) |
| `NEXTAUTH_SECRET` | Generate a random string (if using Auth) |

---

## 5. Close CRM Webhook Registration

To enable real-time inbound sync:

1.  Log in to [Close.com](https://close.com).
2.  Go to **Settings > Developer > Webhooks**.
3.  Add a new Webhook:
    - **URL:** `https://your-vercel-domain.com/api/webhooks/close`
    - **Events:** `lead.created`, `lead.updated`, `activity.email.created`, `activity.call.created`
4.  Verify the connection.

---

## 6. Verify Production Features

Once the build is complete:
- [ ] Log in with your production credentials.
- [ ] Test **⌘+K Search** for instant results.
- [ ] Export a lead list to **CSV**.
- [ ] Verify **Sync Settings** in the Data / API tab.

**The Alabama Foreclosure CRM is now LIVE!**
