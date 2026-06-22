-- ═══════════════════════════════════════════════════════════════════
-- user_details table
-- Controls which widgets/graphs each Admin user can access.
-- Only Master can manage this table (via service role in server actions).
-- Admins can only read their own rows (to check their own access).
-- ═══════════════════════════════════════════════════════════════════

create table if not exists user_details (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  description text not null default 'OTA Bookings',
  status      smallint not null default 1 check (status in (0, 1)),
  created_at  timestamptz not null default now(),
  unique (user_id, description)
);

-- RLS
alter table user_details enable row level security;

-- Admins can read their own widget settings
create policy "user_details_select_own" on user_details
  for select using (auth.uid() = user_id);

-- Master can read all (via service role in server actions — no RLS needed for service role)
-- But for the server component using the user client, allow authenticated to read all:
create policy "user_details_select_auth" on user_details
  for select using (auth.role() = 'authenticated');

-- All mutations (insert/update/delete) go through service role only (server actions)
-- No additional policies needed for mutations — service role bypasses RLS.

-- ── Seed: create OTA Bookings widget entry for all existing admins ──
insert into user_details (user_id, description, status)
select id, 'OTA Bookings', 1
from profiles
where role = 'admin'
on conflict (user_id, description) do nothing;
