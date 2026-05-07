-- =============================================================
-- Migration 005: Patient Identity Safety (Phase 6E-fix)
-- Run this in the Supabase SQL Editor after 004_patient_identity.sql
-- =============================================================
--
-- Changes:
--   1. Drop UNIQUE constraint on patients.phone (allow shared phones)
--   2. Drop UNIQUE constraint on patients.email (allow shared emails)
--   3. Add identity_status column for flagging records
--   4. Keep indexes for fast search (non-unique)
-- =============================================================

-- 1. Drop unique constraint on phone
alter table patients drop constraint if exists patients_phone_unique;

-- 2. Drop unique constraint on email
alter table patients drop constraint if exists patients_email_unique;

-- 3. Add identity_status column
alter table patients
  add column if not exists identity_status text not null default 'normal'
  check (identity_status in ('normal', 'possible_duplicate', 'shared_contact', 'needs_review'));

comment on column patients.identity_status is
  'Patient identity flag: normal, possible_duplicate, shared_contact, needs_review';

-- Note: idx_patients_phone and idx_patients_email indexes remain for fast search.
-- They are non-unique indexes created in 002_patient_records.sql.
