import { supabase } from "@/lib/supabase";

/**
 * Fetch wrapper for admin API calls that automatically attaches
 * the Supabase Auth Bearer token from the current session.
 *
 * Usage:
 *   const res = await adminFetch("/api/admin/patients?search=foo");
 *   const res = await adminFetch("/api/admin/patients", { method: "POST", body: JSON.stringify({...}) });
 */
export async function adminFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Auto-add Content-Type for non-FormData bodies
  if (options?.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
