# Forge Forward Transit Foundation

A ride-request and coordination platform for the **Forge Forward Transit Foundation** — a military-support nonprofit that provides free, safe transportation for active-duty service members and military families.

Built with Next.js (App Router) + Tailwind CSS v4 + Supabase. The architecture is adapted from a booking/scheduling app: instead of booking appointments, riders **request a ride** (pickup date → time slot → details), and coordinators manage those requests from an admin dashboard.

## Features

- **Public site** — mission-driven landing page (Hero, How We Help, Our Impact, About) with links out to the foundation's GoFundMe and social media.
- **Request a Ride** — a multi-step modal: pick a pickup date, choose an available time slot, then enter rider details (name, contact, pickup location, destination, ride type). All rides are free.
- **Coordinator dashboard** (`/admin`) — review and confirm ride requests, manage pickup time slots, manage ride types, view ride analytics, and manage coordinator accounts (master role only).

## Getting Started

### 1. Configure environment

Copy `.env.example` to `.env.local` and fill in your Supabase project credentials:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Set up the database

In the Supabase SQL Editor, paste and run [`scripts/setup-complete.sql`](scripts/setup-complete.sql). This creates all tables (slots, bookings, services, profiles, user_details), row-level security policies, and seeds the three default ride types.

### 3. Create the master coordinator

```bash
npx ts-node scripts/create-admin.ts      # creates the auth user
```

Then re-run `scripts/setup-complete.sql` (or just its final block) to promote that user to the `master` role. Default credentials are defined in `scripts/create-admin.ts` — change them before going live.

### 4. Seed pickup time slots

```bash
npx ts-node --project tsconfig.json scripts/seed-slots.ts
```

### 5. Run the dev server

```bash
npm install
npm run dev    # http://localhost:3030
```

## Customization

- **External links** (GoFundMe, Facebook, Instagram, X, TikTok) live in [`lib/links.ts`](lib/links.ts) — update the placeholder URLs with the foundation's real pages.
- **Ride types** can be edited live from the dashboard (master role) under **Ride Types**, or seeded via SQL.
- **Branding** colors are CSS variables in [`app/globals.css`](app/globals.css) (navy `--foreground`, gold accent, light steel background).
