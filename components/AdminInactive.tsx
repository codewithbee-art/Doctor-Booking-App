"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/**
 * Full-page message for inactive staff members.
 * Shows a clear explanation and a logout option.
 */
export default function AdminInactive() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <main className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="font-heading text-xl font-bold text-text-primary mb-2">Account Inactive</h1>
        <p className="font-body text-sm text-text-secondary mb-6">
          Your staff account has been deactivated. Please contact the clinic owner to restore access.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
