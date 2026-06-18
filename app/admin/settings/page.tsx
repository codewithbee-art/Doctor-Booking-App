"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminAccessDenied from "@/components/AdminAccessDenied";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
import PaymentMethodsSettings from "@/components/PaymentMethodsSettings";
import type { PermissionKey } from "@/lib/permissions";

const TABS: { key: string; label: string; description: string; permission: PermissionKey }[] = [
  { key: "clinic", label: "Clinic Info", description: "Configure clinic name, address, phone number, logo, and operating hours.", permission: "settings_clinic_info" },
  { key: "payment", label: "Payment Methods", description: "Manage bank accounts, wallets, QR codes, and manual payment instructions shown on receipts.", permission: "payment_methods" },
  { key: "email", label: "Email Settings", description: "Configure Resend API key, sender address, and email notification preferences.", permission: "settings_email" },
  { key: "notifications", label: "Admin Notifications", description: "Choose which events trigger admin/doctor email or in-app notifications.", permission: "settings_notifications" },
  { key: "shop", label: "Shop Settings", description: "Configure delivery fees, minimum order amount, shop open/close status, and stock thresholds.", permission: "settings_shop" },
  { key: "seo", label: "SEO / Metadata", description: "Set default page titles, descriptions, OpenGraph images, and social sharing metadata.", permission: "settings_seo" },
  { key: "security", label: "Security & Account", description: "Change password, manage sessions, and configure two-factor authentication.", permission: "settings_security" },
  { key: "system", label: "System Settings", description: "Manage date format preferences, timezone, appointment slot duration, and system maintenance.", permission: "settings_system" },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: staffProfile, noSession, inactive, hasPermission } = useStaffProfile();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Compute permitted tabs
  const permittedTabs = useMemo(
    () => (staffProfile ? TABS.filter((t) => hasPermission(t.permission)) : []),
    [staffProfile, hasPermission]
  );

  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  // Set initial active tab once permitted tabs are known
  useEffect(() => {
    if (permittedTabs.length > 0 && (activeTab === null || !permittedTabs.some((t) => t.key === activeTab))) {
      setActiveTab(permittedTabs[0].key);
    }
  }, [permittedTabs, activeTab]);

  if (checking || staffLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (inactive) return <AdminInactive />;
  if (staffProfile && permittedTabs.length === 0) {
    return <AdminAccessDenied message="You do not have permission to access settings." />;
  }

  const currentTab = permittedTabs.find((t) => t.key === activeTab) ?? permittedTabs[0];
  if (!currentTab) return null;

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Configure clinic, payments, notifications, and system preferences."
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tab navigation */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex min-w-max px-4" aria-label="Settings tabs">
            {permittedTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                aria-selected={activeTab === tab.key}
                role="tab"
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6 sm:p-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">
              {currentTab.label}
            </h2>
            <p className="font-body text-sm text-slate-500 mb-6">
              {currentTab.description}
            </p>

            {/* Tab content */}
            {activeTab === "payment" ? (
              <PaymentMethodsSettings />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-3 font-body text-sm font-medium text-slate-500">
                  This section will be configured in a future phase.
                </p>
                <p className="mt-1 font-body text-xs text-slate-400">
                  {currentTab.label} settings are not yet available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
