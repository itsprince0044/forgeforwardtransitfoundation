-- Run this in the Supabase SQL Editor

create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  is_booked boolean not null default false,
  unique (date, time)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  email text,
  service text not null,             -- type of ride requested
  pickup_location text,
  destination text,
  amount int not null default 0,     -- rides are free
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists slots_date_idx on slots(date);
