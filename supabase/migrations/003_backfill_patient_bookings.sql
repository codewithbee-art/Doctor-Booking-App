-- =============================================================
-- Migration 003: Backfill patient_id on existing bookings
-- Run this in the Supabase SQL Editor after 002_patient_records.sql
-- =============================================================
--
-- Step 1: Create patient records for any bookings that have no
--         matching patient yet (match by phone).
-- Step 2: Link bookings.patient_id to the matched patient.
--
-- This is safe to run multiple times (idempotent).
-- =============================================================

-- Step 1: Insert new patients from bookings that have no patient match
-- (phone is the primary key for matching)
INSERT INTO patients (phone, email, name)
SELECT DISTINCT ON (b.patient_phone)
  b.patient_phone,
  b.patient_email,
  b.patient_name
FROM bookings b
WHERE b.patient_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.phone = b.patient_phone
  )
ORDER BY b.patient_phone, b.created_at DESC
ON CONFLICT (phone) DO NOTHING;

-- Step 2: Link all unlinked bookings to their patient by phone
UPDATE bookings b
SET patient_id = p.id
FROM patients p
WHERE b.patient_id IS NULL
  AND b.patient_phone = p.phone;
