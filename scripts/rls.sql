-- Run this AFTER schema.sql in the Supabase SQL Editor

-- Enable RLS
alter table slots enable row level security;
alter table bookings enable row level security;

-- slots: anyone can read; only authenticated (admin) can update
create policy "slots_select_all" on slots
  for select using (true);

create policy "slots_update_admin" on slots
  for update using (auth.role() = 'authenticated');

-- bookings: anyone can insert (customer books); only authenticated (admin) can read/update
create policy "bookings_insert_all" on bookings
  for insert with check (true);

create policy "bookings_select_admin" on bookings
  for select using (auth.role() = 'authenticated');

create policy "bookings_update_admin" on bookings
  for update using (auth.role() = 'authenticated');
