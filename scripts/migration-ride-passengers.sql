-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION — Additional passengers (riders 2-4)
-- Run this in the Supabase SQL Editor on an existing database.
-- Safe / idempotent.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists ride_passengers (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  position   smallint,                 -- 2, 3, or 4
  full_name  text not null,
  dod_id     text,
  created_at timestamptz not null default now()
);

create index if not exists ride_passengers_booking_id_idx on ride_passengers(booking_id);

alter table ride_passengers enable row level security;

-- Recreate policies idempotently
drop policy if exists "ride_passengers_insert_all"   on ride_passengers;
drop policy if exists "ride_passengers_select_admin" on ride_passengers;
create policy "ride_passengers_insert_all"   on ride_passengers for insert with check (true);
create policy "ride_passengers_select_admin" on ride_passengers for select using (auth.role() = 'authenticated');
