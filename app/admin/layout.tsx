"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useStaffProfile } from "@/lib/useStaffProfile";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page should NOT get the sidebar layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { userEmail } = useStaffProfile();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar userEmail={userEmail} />
      {/* Main content area */}
      <div className="lg:pl-64">
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
