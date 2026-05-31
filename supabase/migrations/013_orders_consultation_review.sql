-- Migration 013: Add consultation review fields to orders
-- Required for Phase 12B-2 consultation-required order workflow

-- Add consultation review columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS consultation_reviewed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consultation_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS consultation_review_note text;

-- Existing non-consultation orders should not be blocked
-- (consultation_reviewed defaults to false, but the API only checks this field
--  when has_consultation_items = true)

-- Grant access to service_role (already has full access via RLS bypass, but explicit for safety)
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO service_role;
