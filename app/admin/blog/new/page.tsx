"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
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
    <>
      <AdminPageHeader title="New Blog Post" />
      <div className="mx-auto max-w-4xl">
        <BlogForm />
      </div>
    </>
  );
}
