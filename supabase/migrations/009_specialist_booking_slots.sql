-- ============================================================
-- Migration 009: Add slot_duration_minutes and max_patients
-- to visiting_specialists for Phase 9B specialist booking.
-- ============================================================

ALTER TABLE public.visiting_specialists
  ADD COLUMN IF NOT EXISTS slot_duration_minutes integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS max_patients integer;
