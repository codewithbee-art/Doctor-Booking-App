-- Migration: Add blocked slot support to available_slots
-- Run this in the Supabase SQL Editor

alter table available_slots
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_reason text;

-- Index for fast admin queries on blocked slots
create index if not exists idx_slots_blocked on available_slots (is_blocked)
  where is_blocked = true;
