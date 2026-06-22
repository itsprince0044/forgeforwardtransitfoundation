-- Run this in the Supabase SQL Editor
-- Adds a DB-level unique constraint so one slot can only ever have one booking record.
-- The app already enforces this atomically, but this is belt-and-suspenders protection.

ALTER TABLE bookings ADD CONSTRAINT bookings_slot_id_unique UNIQUE (slot_id);
