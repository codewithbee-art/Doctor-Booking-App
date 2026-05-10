-- Migration 006: Add cancellation reason and cancelled_at to bookings
-- Phase 6H: Booking and Patient Record Workflow Improvements

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ DEFAULT NULL;
