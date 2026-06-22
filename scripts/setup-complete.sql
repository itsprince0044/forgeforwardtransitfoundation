-- ═══════════════════════════════════════════════════════════════════
-- FORGE FORWARD TRANSIT FOUNDATION — Complete Database Setup
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. TABLES ────────────────────────────────────────────────────────

-- Pickup time slots offered by the foundation
create table if not exists slots (
  id        uuid primary key default gen_random_uuid(),
  date      date not null,
  time      text not null,
  is_booked boolean not null default false,
  unique (date, time)
);

-- Ride requests submitted by service members / families.
-- Mirrors the official Ride Request intake form. slot_id is optional —
-- requests carry their own ride_date + pickup_time chosen by the rider.
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  slot_id         uuid references slots(id) on delete set null,
  customer_name   text not null,             -- Full Name
  phone           text not null,             -- Phone Number
  email           text,                      -- Email Address
  rider_type      text,                      -- Single Soldier / Military Family / Other
  dod_id          text,                      -- DoD ID Number (Full DODID)
  ride_date       date,                      -- Date of Requested Ride
  pickup_time     text,                      -- Pickup Time (HH:MM)
  service         text not null,             -- Reason for Transportation
  pickup_location text,                      -- Pickup Location (full address)
  destination     text,                      -- Destination (full address)
  passengers      text,                      -- Will anyone else be riding? Yes / No
  special_notes   text,                      -- Special Notes or Accommodations
  agreement       boolean not null default false, -- Transportation Agreement accepted
  signature       text,                      -- Electronic Signature (typed full name)
  amount          int  not null default 0,   -- rides are free; kept for compatibility
  status          text not null default 'pending',
  created_at      timestamptz not null default now()
);

-- Ride types shown on the homepage / request form
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       numeric(10,2) not null default 0,
  description text not null default '',
  duration    text not null default 'Local rides',
  is_active   smallint not null default 1 check (is_active in (0, 1)),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Profiles — links auth.users to roles
-- Roles: 'master' (full access) | 'admin' (ride requests only)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'admin' check (role in ('master', 'admin')),
  created_at timestamptz not null default now()
);

-- Controls which dashboard widgets each coordinator can access
create table if not exists user_details (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  description text not null default 'Ride Requests',
  status      smallint not null default 1 check (status in (0, 1)),
  created_at  timestamptz not null default now(),
  unique (user_id, description)
);


-- ── 2. INDEXES ───────────────────────────────────────────────────────

create index if not exists slots_date_idx on slots(date);


-- ── 3. EXTRA COLUMNS (idempotent — safe on existing databases) ───────

alter table bookings add column if not exists email           text;
alter table bookings add column if not exists rider_type      text;
alter table bookings add column if not exists dod_id          text;
alter table bookings add column if not exists ride_date       date;
alter table bookings add column if not exists pickup_time     text;
alter table bookings add column if not exists pickup_location text;
alter table bookings add column if not exists destination     text;
alter table bookings add column if not exists passengers      text;
alter table bookings add column if not exists special_notes   text;
alter table bookings add column if not exists agreement       boolean not null default false;
alter table bookings add column if not exists signature       text;
alter table bookings add column if not exists driver_id       uuid references profiles(id) on delete set null;

-- slot_id is optional now (requests carry their own date/time)
alter table bookings alter column slot_id drop not null;

-- A given slot, if used, maps to a single request (NULLs are allowed/ignored)
create unique index if not exists bookings_slot_id_unique on bookings(slot_id);
create index if not exists bookings_ride_date_idx on bookings(ride_date);


-- ── 4. ROW LEVEL SECURITY ────────────────────────────────────────────

alter table slots        enable row level security;
alter table bookings     enable row level security;
alter table services     enable row level security;
alter table profiles     enable row level security;
alter table user_details enable row level security;

-- Slots: anyone can read; authenticated coordinators can manage
create policy "slots_select_all"   on slots for select using (true);
create policy "slots_update_admin" on slots for update using (auth.role() = 'authenticated');
create policy "slots_insert_auth"  on slots for insert with check (auth.role() = 'authenticated');
create policy "slots_delete_auth"  on slots for delete using (auth.role() = 'authenticated' and is_booked = false);

-- Bookings: anyone can submit a request; only coordinators can read/update
create policy "bookings_insert_all"   on bookings for insert with check (true);
create policy "bookings_select_admin" on bookings for select using (auth.role() = 'authenticated');
create policy "bookings_update_admin" on bookings for update using (auth.role() = 'authenticated');

-- Services: anyone can read active ride types; mutations go through service role
create policy "services_select_all" on services for select using (true);

-- Profiles: authenticated can read all; only own row for updates
create policy "profiles_select_auth" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own"  on profiles for update using (auth.uid() = id);

-- user_details: coordinators can read; mutations go through service role
create policy "user_details_select_auth" on user_details for select using (auth.role() = 'authenticated');


-- ── 5. SEED RIDE TYPES ───────────────────────────────────────────────

insert into services (name, price, description, duration, is_active, sort_order) values
  ('Medical & VA Appointments', 0, 'Safe, on-time rides to medical, dental, and VA appointments so recovery and care never wait.', 'Local rides', 1, 1),
  ('Work & Errands',            0, 'Transportation to work, interviews, groceries, and daily errands to keep life moving forward.', 'Local rides', 1, 2),
  ('Community & Family',        0, 'Rides to school events, base services, and family activities — because connection matters.', 'Local rides', 1, 3)
on conflict do nothing;


-- ── 6. SEED MASTER COORDINATOR PROFILE ──────────────────────────────
-- Creates the profile row for the master coordinator with 'master' role.
-- This user must already exist in Supabase Auth (run create-admin.ts first,
-- or create them manually in Auth → Users in the Supabase dashboard).

insert into profiles (id, email, role)
select id, email, 'master'
from auth.users
where email = 'admin@forgeforwardtransit.org'
on conflict (id) do update set role = 'master';

-- Give the master coordinator the Ride Requests widget by default
insert into user_details (user_id, description, status)
select id, 'Ride Requests', 1
from profiles
where role = 'master'
on conflict (user_id, description) do nothing;


-- ═══════════════════════════════════════════════════════════════════
-- Done! Your database is fully set up.
-- ═══════════════════════════════════════════════════════════════════
