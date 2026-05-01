# Supabase Database Setup

## Prerequisites

1. Create a free Supabase project at [https://supabase.com](https://supabase.com).
2. Note your **Project URL** and **Anon (public) Key** from **Settings → API**.
3. Note the **Service Role Key** (keep it secret — server-side only).

## Step 1 — Run the Schema

1. Open your Supabase project dashboard.
2. Go to **SQL Editor** → **New Query**.
3. Paste the entire contents of `schema.sql`.
4. Click **Run**.

This creates all seven tables in the correct order with indexes and triggers.

### Tables created

| # | Table                  | Purpose                          |
|---|------------------------|----------------------------------|
| 1 | visiting_specialists   | Visiting specialist schedules    |
| 2 | bookings               | Patient appointment bookings     |
| 3 | available_slots        | 30-min appointment time slots    |
| 4 | products               | Medicine shop inventory          |
| 5 | orders                 | Customer orders                  |
| 6 | order_items            | Line items per order             |
| 7 | blog_posts             | Health blog articles             |

## Step 2 — Seed Appointment Slots

1. In the **SQL Editor**, open a new query.
2. Paste the entire contents of `seed-slots.sql`.
3. Click **Run**.

This generates 30 days of 30-minute slots (9:00 AM – 4:30 PM).

> **Note:** BS (Bikram Sambat) dates are left empty and will be populated by the application using the Nepali date converter.

## Step 3 — Create Admin User

1. Go to **Authentication → Users**.
2. Click **Add User → Create New User**.
3. Enter an email and password for the admin account.
4. There is no public sign-up — admin access is manual only.

## Step 4 — Configure Environment Variables

Copy `.env.example` from the project root and rename it to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- `NEXT_PUBLIC_*` variables are safe for client-side use.
- `SUPABASE_SERVICE_ROLE_KEY` must **never** be exposed to the browser.

## Row Level Security (RLS)

RLS policies have **not** been added yet. They will be configured in a later phase when API routes and auth are implemented. Until then, tables are accessible only via the service role key on the server side.
