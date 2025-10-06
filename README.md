# Second Brain Dashboard

A secure, Notion-inspired personal operating system built with Next.js 14, Supabase, Tailwind CSS, shadcn/ui primitives, and SWR. Designed to deploy on Vercel with a Supabase backend and embeddable at `dash.bansalpatel.com` (use the `/embed` route for clean iframes).

## Getting started

1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env.local` with Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Run database migration in Supabase SQL editor using `supabase/migrations/0001_create_schema.sql`.
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Features

- Supabase Auth with passwordless magic links (Cloudflare Access friendly) and middleware enforced routes.
- Drag-and-drop configurable dashboard tiles persisted per user profile.
- Widgets for daily overview, tasks, habits, mood logging, training logs, civic admin, and external embeds.
- `/embed` layout optimized for iframe embedding on the solo website.
- Type-safe Supabase helpers and RLS policies for every table.

## Deployment

Deploy the Next.js app to Vercel. Point `dash.bansalpatel.com` to the Vercel project and configure Supabase URL/keys in project environment variables. Use the same build on the Solo site via `<iframe src="https://dash.bansalpatel.com/embed" />`.
