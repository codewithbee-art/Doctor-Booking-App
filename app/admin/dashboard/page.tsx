"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      setUserEmail(session.user.email ?? null);
      setChecking(false);
    }
    checkSession();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="mt-3 font-body text-sm text-text-secondary">Checking authentication…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-text-primary">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="font-body text-sm text-text-secondary hidden sm:inline">
                {userEmail}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-text-primary">
              Welcome to the Admin Dashboard
            </h2>
            <p className="mt-2 font-body text-base text-text-secondary">
              This is a placeholder for the admin dashboard. The full dashboard with booking management will be implemented in Phase 5.
            </p>
          </div>

          <div className="rounded-xl border border-light-blue bg-light-blue/30 p-6">
            <h3 className="font-body text-lg font-semibold text-primary mb-3">
              Current Status
            </h3>
            <ul className="space-y-2 font-body text-base text-text-secondary">
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Authentication working
              </li>
              {userEmail && (
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Logged in as {userEmail}
                </li>
              )}
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-border" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Booking dashboard coming in Phase 5
              </li>
            </ul>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href="/"
              className="rounded-lg border border-border bg-white px-6 py-3 font-body text-base font-semibold text-text-primary transition-colors hover:bg-bg-light"
            >
              Go to Website
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
