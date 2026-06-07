-- ================================================================
-- Phase 13A: Payment Methods and Receipt/Invoice Support
-- ================================================================

-- ================================================================
-- payment_methods table
-- ================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  method_type     text NOT NULL DEFAULT 'bank' CHECK (method_type IN ('bank', 'wallet', 'cash', 'other')),
  display_name    text NOT NULL,
  bank_name       text,
  account_holder  text,
  account_number  text,
  branch          text,
  wallet_name     text,
  wallet_number   text,
  qr_image_url    text,
  instructions    text,
  is_enabled      boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payment_methods_updated_at ON public.payment_methods;

CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_methods_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_enabled
  ON public.payment_methods(is_enabled, display_order);

CREATE INDEX IF NOT EXISTS idx_payment_methods_display_order
  ON public.payment_methods(display_order);

-- ================================================================
-- RLS for payment_methods
-- ================================================================
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_methods_read_for_anon" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_read_for_authenticated" ON public.payment_methods;
DROP POLICY IF EXISTS "service_role_manage_payment_methods" ON public.payment_methods;

-- service_role manages payment methods through server-side admin APIs
CREATE POLICY "service_role_manage_payment_methods"
  ON public.payment_methods
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Explicit grants for Supabase Data API
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO service_role;

-- Keep direct public access locked down.
-- Receipts should use saved payment method snapshots, not direct public reads.
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.payment_methods FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.payment_methods FROM authenticated;

-- ================================================================
-- Add payment_methods_snapshot and payment fields to orders
-- ================================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_methods_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS paid_amount numeric(10,2) CHECK (paid_amount IS NULL OR paid_amount >= 0),
  ADD COLUMN IF NOT EXISTS payment_note text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_payment_reference
  ON public.orders(payment_reference);

-- Keep service_role access explicit
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO service_role;

-- ================================================================
-- Add booking_reference, payment_methods_snapshot, and payment fields to bookings
-- ================================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_reference text,
  ADD COLUMN IF NOT EXISTS payment_methods_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS paid_amount numeric(10,2) CHECK (paid_amount IS NULL OR paid_amount >= 0),
  ADD COLUMN IF NOT EXISTS payment_note text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_booking_reference
  ON public.bookings(booking_reference)
  WHERE booking_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_reference_search
  ON public.bookings(booking_reference);

-- Keep service_role access explicit
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO service_role;