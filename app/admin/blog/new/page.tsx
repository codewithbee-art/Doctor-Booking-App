"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import BlogForm from "../BlogForm";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { loading: staffLoading, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (inactive) return <AdminInactive />;

  return (
    <main className="min-h-screen bg-bg-light">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <a
            href="/admin/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back
          </a>
          <h1 className="font-heading text-2xl font-bold text-text-primary">New Blog Post</h1>
        </div>
        <BlogForm />
      </div>
    </main>
  );
}
