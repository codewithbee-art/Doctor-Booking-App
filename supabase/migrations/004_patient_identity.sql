-- =============================================================
-- Migration 004: Patient Identity Improvements (Phase 6E)
-- Run this in the Supabase SQL Editor after 003_backfill_patient_bookings.sql
-- =============================================================
--
-- Adds identity_notes column for admin notes about patient identity,
-- e.g. "Uses son's phone number", "Changed phone recently".
-- =============================================================

alter table patients
  add column if not exists identity_notes text;

comment on column patients.identity_notes is
  'Admin notes about patient identity, e.g. "Uses son''s phone number"';
