-- ═══════════════════════════════════════════════════════════════════
-- services table
-- Master can add/edit/delete services from admin panel.
-- Public can read active services (is_active = 1).
-- ═══════════════════════════════════════════════════════════════════

-- Also add email column to bookings (for feature 4)
alter table bookings add column if not exists email text;

create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       numeric(10,2) not null,
  description text not null default '',
  duration    text not null default '30 min',
  is_active   smallint not null default 1 check (is_active in (0, 1)),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- RLS
alter table services enable row level security;

-- Anyone can read active services (booking page, homepage)
create policy "services_select_all" on services
  for select using (true);

-- All mutations go through service role (server actions) — no extra policies needed

-- ── Seed default ride types ────────────────────────────────────────
insert into services (name, price, description, duration, is_active, sort_order) values
  ('Medical & VA Appointments', 0, 'Safe, on-time rides to medical, dental, and VA appointments so recovery and care never wait.', 'Local rides', 1, 1),
  ('Work & Errands',            0, 'Transportation to work, interviews, groceries, and daily errands to keep life moving forward.', 'Local rides', 1, 2),
  ('Community & Family',        0, 'Rides to school events, base services, and family activities — because connection matters.', 'Local rides', 1, 3)
on conflict do nothing;
