-- Phase 9D: Add booking_source column to bookings table
-- Values: 'online' (public booking), 'walk_in' (admin walk-in), 'admin' (future admin-created)

-- Add column with default 'online' so existing bookings get the right value
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_source text NOT NULL DEFAULT 'online';

-- Backfill: existing specialist bookings are all from online public flow
-- (No walk-ins exist yet, so all current bookings are 'online')
-- Regular bookings are also 'online' by default

-- Update specialist public booking API to explicitly set booking_source = 'online'
-- Walk-in bookings will use booking_source = 'walk_in'
