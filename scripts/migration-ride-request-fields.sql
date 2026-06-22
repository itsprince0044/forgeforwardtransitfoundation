-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION — Ride Request intake fields (matches the official form)
-- Run this in the Supabase SQL Editor on a database that was created
-- before these fields existed. Safe / idempotent.
-- ═══════════════════════════════════════════════════════════════════

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

-- Requests no longer require a pre-defined slot
alter table bookings alter column slot_id drop not null;

create index if not exists bookings_ride_date_idx on bookings(ride_date);
