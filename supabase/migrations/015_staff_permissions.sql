-- ============================================================
-- Migration 015: Staff Permissions JSONB Column
-- Phase 14B: Custom Staff Permissions System
-- ============================================================

-- 1. Add permissions JSONB column to staff_profiles
-- Stores per-staff permission overrides as { key: boolean }
ALTER TABLE staff_profiles
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Backfill existing staff rows from their current role templates
-- Only backfill rows where permissions are still empty, to avoid overwriting custom permissions.

-- Owner: all permissions true
UPDATE staff_profiles SET permissions = '{
  "dashboard": true,
  "bookings": true,
  "patients": true,
  "patient_visits": true,
  "availability": true,
  "specialists": true,
  "specialist_bookings": true,
  "blog": true,
  "shop": true,
  "orders": true,
  "shop_analytics": true,
  "payment_methods": true,
  "settings": true,
  "staff": true
}'::jsonb
WHERE role = 'owner'
AND permissions = '{}'::jsonb;

-- Doctor: dashboard, bookings, patients, patient_visits, availability, specialists, specialist_bookings
UPDATE staff_profiles SET permissions = '{
  "dashboard": true,
  "bookings": true,
  "patients": true,
  "patient_visits": true,
  "availability": true,
  "specialists": true,
  "specialist_bookings": true,
  "blog": false,
  "shop": false,
  "orders": false,
  "shop_analytics": false,
  "payment_methods": false,
  "settings": false,
  "staff": false
}'::jsonb
WHERE role = 'doctor'
AND permissions = '{}'::jsonb;

-- Receptionist: same as doctor
UPDATE staff_profiles SET permissions = '{
  "dashboard": true,
  "bookings": true,
  "patients": true,
  "patient_visits": true,
  "availability": true,
  "specialists": true,
  "specialist_bookings": true,
  "blog": false,
  "shop": false,
  "orders": false,
  "shop_analytics": false,
  "payment_methods": false,
  "settings": false,
  "staff": false
}'::jsonb
WHERE role = 'receptionist'
AND permissions = '{}'::jsonb;

-- Inventory manager: dashboard, shop, orders, shop_analytics
UPDATE staff_profiles SET permissions = '{
  "dashboard": true,
  "bookings": false,
  "patients": false,
  "patient_visits": false,
  "availability": false,
  "specialists": false,
  "specialist_bookings": false,
  "blog": false,
  "shop": true,
  "orders": true,
  "shop_analytics": true,
  "payment_methods": false,
  "settings": false,
  "staff": false
}'::jsonb
WHERE role = 'inventory_manager'
AND permissions = '{}'::jsonb;

-- Content editor: dashboard, blog
UPDATE staff_profiles SET permissions = '{
  "dashboard": true,
  "bookings": false,
  "patients": false,
  "patient_visits": false,
  "availability": false,
  "specialists": false,
  "specialist_bookings": false,
  "blog": true,
  "shop": false,
  "orders": false,
  "shop_analytics": false,
  "payment_methods": false,
  "settings": false,
  "staff": false
}'::jsonb
WHERE role = 'content_editor'
AND permissions = '{}'::jsonb;