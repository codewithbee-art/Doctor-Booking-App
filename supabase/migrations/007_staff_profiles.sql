-- ============================================================
-- Migration 007: Staff Profiles + Doctor Reference on Visits
-- Phase 7A: Staff Profiles Database
-- ============================================================

-- 1. Create staff_profiles table linked to Supabase Auth users
-- Each row represents a staff member (owner, doctor, receptionist, etc.)
-- auth_user_id references auth.users(id) so only real auth users can be staff
CREATE TABLE IF NOT EXISTS staff_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'doctor'
                CHECK (role IN ('owner', 'doctor', 'receptionist', 'inventory_manager', 'content_editor')),
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add updated_at trigger for staff_profiles
-- Reuse the same trigger function pattern used by other tables
CREATE OR REPLACE FUNCTION update_staff_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_staff_profiles_updated_at ON staff_profiles;
CREATE TRIGGER set_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_profiles_updated_at();

-- 3. Add service_role permissions for staff_profiles
-- service_role is used by the Next.js server-side admin client (supabaseAdmin)
GRANT ALL ON staff_profiles TO service_role;

-- 4. Add doctor reference columns to patient_visits
-- doctor_id: links to the staff member who handled the visit
-- doctor_name_snapshot: stores the doctor name at the time of the visit
--   (so historical records are preserved even if the staff profile changes)
ALTER TABLE patient_visits
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS doctor_name_snapshot TEXT;

-- 5. Create index on staff_profiles for fast lookup by auth_user_id
CREATE INDEX IF NOT EXISTS idx_staff_profiles_auth_user_id ON staff_profiles(auth_user_id);

-- 6. Create index on patient_visits for fast lookup by doctor_id
CREATE INDEX IF NOT EXISTS idx_patient_visits_doctor_id ON patient_visits(doctor_id);

-- ============================================================
-- MANUAL STEP: Backfill the first owner staff profile
-- After running this migration, run the following SQL once
-- replacing the placeholders with your actual admin user info:
--
--   INSERT INTO staff_profiles (auth_user_id, full_name, email, role)
--   VALUES (
--     '<YOUR_AUTH_USER_UUID>',  -- from auth.users.id for your admin account
--     '<YOUR_FULL_NAME>',      -- e.g. 'Dr. Sharma'
--     '<YOUR_EMAIL>',          -- e.g. 'admin@clinic.com'
--     'owner'
--   );
--
-- To find your auth_user_id, run:
--   SELECT id, email FROM auth.users;
-- ============================================================
