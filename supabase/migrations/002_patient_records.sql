-- =============================================================
-- Migration 002: Patient Records
-- Run this in the Supabase SQL Editor after 001_add_blocked_slots.sql
-- =============================================================
--
-- Patient matching logic:
--   Primary:   phone number (unique, always required)
--   Secondary: email (unique when provided, optional)
--   Name alone is NOT sufficient to identify a returning patient.
--
-- bookings.patient_id is nullable — existing and future bookings
-- created through the public booking flow leave it NULL.  The admin
-- links patients to bookings manually in Phase 6B or automatically
-- via a lookup on phone/email in Phase 6C.
-- =============================================================


-- =============================================================
-- 1. patients
-- =============================================================
create table if not exists patients (
  id            uuid        default gen_random_uuid() primary key,
  phone         text        not null,
  email         text,
  name          text        not null,
  date_of_birth date,
  notes         text,
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now(),

  -- Phone is the primary unique identifier
  constraint patients_phone_unique unique (phone),
  -- Email must be unique if supplied (partial unique index below handles NULLs)
  constraint patients_email_unique unique (email)
);

-- Index: fast lookup by phone (most common search path)
create index if not exists idx_patients_phone on patients (phone);

-- Index: fast lookup by email when provided
create index if not exists idx_patients_email on patients (email)
  where email is not null;

-- Trigger: auto-update updated_at
create trigger trg_patients_updated_at
  before update on patients
  for each row execute function update_updated_at();


-- =============================================================
-- 2. patient_visits
-- =============================================================
-- One row per clinical visit, tied to both a patient and a booking.
-- visit_notes, prescribed_medicines, follow_up_instructions, and
-- condition_summary are all nullable — Phase 6C will populate them.
-- =============================================================
create table if not exists patient_visits (
  id                       uuid    default gen_random_uuid() primary key,
  patient_id               uuid    not null references patients(id) on delete cascade,
  booking_id               uuid    references bookings(id) on delete set null,
  visit_date_ad            date    not null,
  visit_date_bs            text    not null default '',
  chief_complaint          text,
  visit_notes              text,
  prescribed_medicines     text,
  follow_up_instructions   text,
  condition_summary        text,
  created_at               timestamp with time zone default now(),
  updated_at               timestamp with time zone default now()
);

-- Index: look up all visits for a patient (most common admin query)
create index if not exists idx_patient_visits_patient_id on patient_visits (patient_id);

-- Index: look up visit linked to a specific booking
create index if not exists idx_patient_visits_booking_id on patient_visits (booking_id)
  where booking_id is not null;

-- Index: sort/filter visits by date
create index if not exists idx_patient_visits_date on patient_visits (visit_date_ad);

-- Trigger: auto-update updated_at
create trigger trg_patient_visits_updated_at
  before update on patient_visits
  for each row execute function update_updated_at();


-- =============================================================
-- 3. Add patient_id FK to bookings
-- =============================================================
-- Nullable: existing public bookings are not retroactively linked.
-- Admin links them in Phase 6B.
alter table bookings
  add column if not exists patient_id uuid references patients(id) on delete set null;

-- Index: look up all bookings for a patient
create index if not exists idx_bookings_patient_id on bookings (patient_id)
  where patient_id is not null;


-- =============================================================
-- 4. Service-role permissions
-- =============================================================
grant select, insert, update, delete on public.patients       to service_role;
grant select, insert, update, delete on public.patient_visits to service_role;
