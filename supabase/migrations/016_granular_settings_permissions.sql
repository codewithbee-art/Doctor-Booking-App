-- Migration 016: Granular Settings Permissions
-- Replaces the broad "settings" key with granular settings permission keys.
-- Safe to run after Migration 015.

BEGIN;

-- 1. Owner rows: all granular Settings permissions are always true.
-- Only process rows that still contain the old "settings" key.
UPDATE staff_profiles
SET permissions = (permissions - 'settings')
  || jsonb_build_object(
    'settings_clinic_info', true,
    'settings_email', true,
    'settings_notifications', true,
    'settings_shop', true,
    'settings_seo', true,
    'settings_security', true,
    'settings_system', true,
    'staff', true
  )
WHERE role = 'owner'
  AND permissions ? 'settings';

-- 2. Non-owner rows:
-- Preserve existing granular values when present.
-- Otherwise inherit delegatable values from the old "settings" permission.
-- Owner-only permissions are always forced to false.
-- Existing "payment_methods" and unrelated permissions remain unchanged.
UPDATE staff_profiles
SET permissions = (permissions - 'settings')
  || jsonb_build_object(
    'settings_clinic_info',
      COALESCE(
        (permissions->>'settings_clinic_info')::boolean,
        (permissions->>'settings')::boolean,
        false
      ),

    'settings_notifications',
      COALESCE(
        (permissions->>'settings_notifications')::boolean,
        (permissions->>'settings')::boolean,
        false
      ),

    'settings_shop',
      COALESCE(
        (permissions->>'settings_shop')::boolean,
        (permissions->>'settings')::boolean,
        false
      ),

    'settings_seo',
      COALESCE(
        (permissions->>'settings_seo')::boolean,
        (permissions->>'settings')::boolean,
        false
      ),

    'settings_email', false,
    'settings_security', false,
    'settings_system', false,
    'staff', false
  )
WHERE role <> 'owner'
  AND permissions ? 'settings';

COMMIT;