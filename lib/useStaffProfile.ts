"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { StaffRole } from "@/types/database";

export interface StaffProfileData {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  phone: string | null;
  is_active: boolean;
}

interface UseStaffProfileResult {
  /** Still loading auth + profile */
  loading: boolean;
  /** Authenticated user email (from Supabase Auth) */
  userEmail: string | null;
  /** Staff profile from staff_profiles table (null if not found) */
  profile: StaffProfileData | null;
  /** True if the user has no valid session */
  noSession: boolean;
  /** True if the staff profile exists but is_active = false */
  inactive: boolean;
  /** True if profile exists and is active */
  ready: boolean;
  /** Check if the user's role is in the allowed list */
  hasRole: (...roles: StaffRole[]) => boolean;
}

/**
 * Client-side hook that loads the current user's auth session
 * and their staff profile in one step.
 *
 * Usage:
 *   const { loading, profile, noSession, inactive, hasRole } = useStaffProfile();
 */
export function useStaffProfile(): UseStaffProfileResult {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<StaffProfileData | null>(null);
  const [noSession, setNoSession] = useState(false);
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Check auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        setNoSession(true);
        setLoading(false);
        return;
      }

      setUserEmail(session.user.email ?? null);

      // 2. Fetch staff profile using the access token
      try {
        const res = await fetch("/api/admin/staff/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (cancelled) return;

        if (res.ok) {
          const json = await res.json();
          const p = json.profile as StaffProfileData | null;
          setProfile(p);
          if (p && !p.is_active) {
            setInactive(true);
          }
        }
      } catch {
        // If fetch fails, profile stays null — page will handle gracefully
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const ready = !!profile && profile.is_active;

  const hasRole = (...roles: StaffRole[]) => {
    if (!profile || !profile.is_active) return false;
    return roles.includes(profile.role);
  };

  return { loading, userEmail, profile, noSession, inactive, ready, hasRole };
}
