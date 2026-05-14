-- ============================================================
-- Migration 008: Add optional profile/detail fields to visiting_specialists
-- Phase 9A: Specialist Detail Page
--
-- All new columns are nullable (except display_order which defaults to 0)
-- so this migration is backward-compatible with existing data.
-- ============================================================

ALTER TABLE public.visiting_specialists
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS qualifications text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS work_history text,
  ADD COLUMN IF NOT EXISTS treatment_areas text,
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS visit_location text,
  ADD COLUMN IF NOT EXISTS public_note text,
  ADD COLUMN IF NOT EXISTS preparation_note text,
  ADD COLUMN IF NOT EXISTS languages text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS consultation_mode text,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- Check constraints for enum-like text columns
ALTER TABLE public.visiting_specialists
  ADD CONSTRAINT chk_specialist_gender
    CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));

ALTER TABLE public.visiting_specialists
  ADD CONSTRAINT chk_specialist_consultation_mode
    CHECK (consultation_mode IS NULL OR consultation_mode IN ('in_person', 'online', 'both'));
