-- Migration: Add private counselling fields to bookings table
-- Phase 11: Private Counselling Booking

-- Add counselling-specific columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS consultation_mode text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS privacy_preference text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_preference text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS counselling_reason text DEFAULT NULL;

-- Optional safety constraints for counselling field values
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS chk_bookings_consultation_mode,
  ADD CONSTRAINT chk_bookings_consultation_mode
    CHECK (
      consultation_mode IS NULL
      OR consultation_mode IN ('phone', 'video', 'in_person')
    );

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS chk_bookings_privacy_preference,
  ADD CONSTRAINT chk_bookings_privacy_preference
    CHECK (
      privacy_preference IS NULL
      OR privacy_preference IN ('private', 'normal')
    );

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS chk_bookings_payment_preference,
  ADD CONSTRAINT chk_bookings_payment_preference
    CHECK (
      payment_preference IS NULL
      OR payment_preference IN ('pay_now', 'pay_later', 'pay_on_visit')
    );

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS chk_bookings_payment_status,
  ADD CONSTRAINT chk_bookings_payment_status
    CHECK (
      payment_status IS NULL
      OR payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')
    );

-- Documentation comments
COMMENT ON COLUMN public.bookings.consultation_mode IS 'phone | video | in_person — only for counselling bookings';
COMMENT ON COLUMN public.bookings.privacy_preference IS 'private | normal — only for counselling bookings';
COMMENT ON COLUMN public.bookings.payment_preference IS 'pay_now | pay_later | pay_on_visit — only for counselling bookings';
COMMENT ON COLUMN public.bookings.payment_status IS 'unpaid | pending | paid | failed | refunded';
COMMENT ON COLUMN public.bookings.counselling_reason IS 'Optional brief reason/concern for counselling — kept minimal and private';

-- Explicit grant for Supabase Data API compatibility
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO service_role;