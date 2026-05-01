-- =============================================================
-- Seed: Available Appointment Slots (next 30 days)
-- =============================================================
-- Generates 30-minute slots from 9:00 AM to 4:30 PM every day.
-- The last slot starts at 4:30 PM so appointments end by 5 PM.
-- BS dates are left empty and will be populated by the app
-- using the Nepali date converter on first load.
-- =============================================================

-- Clear any existing slots first (safe for initial setup only)
-- Remove this line if you want to keep existing data:
-- DELETE FROM available_slots;

INSERT INTO available_slots (slot_date_ad, slot_date_bs, slot_time, is_booked)
SELECT
  date_val::date AS slot_date_ad,
  '' AS slot_date_bs,
  time_val::time AS slot_time,
  false AS is_booked
FROM
  generate_series(
    current_date,
    current_date + interval '30 days',
    interval '1 day'
  ) AS date_val,
  generate_series(
    '09:00'::time,
    '17:00'::time,
    interval '30 minutes'
  ) AS time_val
WHERE
  time_val < '17:00'::time;
