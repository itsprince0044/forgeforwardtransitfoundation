-- Run in Supabase SQL Editor AFTER schema.sql and rls.sql

-- 1. Profiles table — ties auth.users to roles
--    Roles: 'master' (full access) | 'admin' (bookings only)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'admin' check (role in ('master', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Track which admin handled a booking (optional, set when marking complete)
alter table bookings add column if not exists barber_id uuid references profiles(id) on delete set null;

-- 3. RLS for profiles
alter table profiles enable row level security;

-- Authenticated users can read all profiles
create policy "profiles_select_auth" on profiles
  for select using (auth.role() = 'authenticated');

-- Only own-profile updates (service role handles inserts)
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- 4. Allow authenticated users to INSERT and DELETE slots
--    (app layer enforces master role check)
create policy "slots_insert_auth" on slots
  for insert with check (auth.role() = 'authenticated');

create policy "slots_delete_auth" on slots
  for delete using (auth.role() = 'authenticated' and is_booked = false);

-- 5. Seed master profile for existing admin account
insert into profiles (id, email, role)
select id, email, 'master'
from auth.users
where email = 'admin@thefaderoom.com'
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: If you already ran the old migration (master_admin / barber),
-- run these lines to update existing data to the new role names:
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Drop the old check constraint
alter table profiles drop constraint if exists profiles_role_check;

-- Step 2: Rename existing role values
update profiles set role = 'master' where role = 'master_admin';
update profiles set role = 'admin'  where role = 'barber';

-- Step 3: Add the new check constraint
alter table profiles
  add constraint profiles_role_check check (role in ('master', 'admin'));
