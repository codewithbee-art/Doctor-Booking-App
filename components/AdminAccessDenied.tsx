"use client";

import Link from "next/link";

interface AdminAccessDeniedProps {
  /** Short explanation of why access is denied */
  message?: string;
  /** Show a link to go back to the dashboard */
  showDashboardLink?: boolean;
}

/**
 * Full-page access denied message for admin pages
 * when the user's role does not have permission.
 */
export default function AdminAccessDenied({
  message = "You do not have permission to view this page.",
  showDashboardLink = true,
}: AdminAccessDeniedProps) {
  return (
    <main className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="font-heading text-xl font-bold text-text-primary mb-2">Access Denied</h1>
        <p className="font-body text-sm text-text-secondary mb-6">{message}</p>
        {showDashboardLink && (
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Go to Dashboard
          </Link>
        )}
      </div>
    </main>
  );
}
