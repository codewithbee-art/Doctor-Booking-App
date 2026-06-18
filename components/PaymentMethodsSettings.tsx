"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/adminFetch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PaymentMethod {
  id: string;
  method_type: string;
  display_name: string;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  branch: string | null;
  wallet_name: string | null;
  wallet_number: string | null;
  qr_image_url: string | null;
  instructions: string | null;
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

type MethodType = "bank" | "wallet" | "cash" | "other";

const METHOD_TYPE_LABELS: Record<MethodType, string> = {
  bank: "Bank Transfer",
  wallet: "Digital Wallet",
  cash: "Cash",
  other: "Other",
};

const EMPTY_FORM = {
  method_type: "bank" as MethodType,
  display_name: "",
  bank_name: "",
  account_holder: "",
  account_number: "",
  branch: "",
  wallet_name: "",
  wallet_number: "",
  qr_image_url: "",
  instructions: "",
  is_enabled: true,
  display_order: 0,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PaymentMethodsSettings() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/payment-methods");
      const data = await res.json();
      if (data.success) {
        setMethods(data.methods);
      } else {
        setError(data.error || "Failed to fetch payment methods.");
      }
    } catch {
      setError("Failed to fetch payment methods.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  function openAdd() {
    setForm({ ...EMPTY_FORM, display_order: methods.length });
    setEditingId(null);
    setShowForm(true);
    setActionMsg(null);
  }

  function openEdit(m: PaymentMethod) {
    setForm({
      method_type: m.method_type as MethodType,
      display_name: m.display_name,
      bank_name: m.bank_name || "",
      account_holder: m.account_holder || "",
      account_number: m.account_number || "",
      branch: m.branch || "",
      wallet_name: m.wallet_name || "",
      wallet_number: m.wallet_number || "",
      qr_image_url: m.qr_image_url || "",
      instructions: m.instructions || "",
      is_enabled: m.is_enabled,
      display_order: m.display_order,
    });
    setEditingId(m.id);
    setShowForm(true);
    setActionMsg(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.display_name.trim()) {
      setActionMsg({ text: "Display name is required.", type: "error" });
      return;
    }
    setSaving(true);
    setActionMsg(null);
    try {
      const payload = { ...form, id: editingId || undefined };
      const method = editingId ? "PATCH" : "POST";
      const res = await adminFetch("/api/admin/payment-methods", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: editingId ? "Payment method updated." : "Payment method created.", type: "success" });
      setShowForm(false);
      setEditingId(null);
      await fetchMethods();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to save.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled(m: PaymentMethod) {
    setActionMsg(null);
    try {
      const res = await adminFetch("/api/admin/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, is_enabled: !m.is_enabled }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchMethods();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to toggle.", type: "error" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    setDeleting(id);
    setActionMsg(null);
    try {
      const res = await adminFetch(`/api/admin/payment-methods?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: "Payment method deleted.", type: "success" });
      await fetchMethods();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to delete.", type: "error" });
    } finally {
      setDeleting(null);
    }
  }

  async function handleMoveUp(idx: number) {
    if (idx === 0) return;
    const items = [...methods];
    const prev = items[idx - 1];
    const curr = items[idx];
    setActionMsg(null);
    try {
      await Promise.all([
        adminFetch("/api/admin/payment-methods", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: curr.id, display_order: prev.display_order }),
        }),
        adminFetch("/api/admin/payment-methods", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: prev.id, display_order: curr.display_order }),
        }),
      ]);
      await fetchMethods();
    } catch {
      setActionMsg({ text: "Failed to reorder.", type: "error" });
    }
  }

  async function handleMoveDown(idx: number) {
    if (idx === methods.length - 1) return;
    const items = [...methods];
    const next = items[idx + 1];
    const curr = items[idx];
    setActionMsg(null);
    try {
      await Promise.all([
        adminFetch("/api/admin/payment-methods", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: curr.id, display_order: next.display_order }),
        }),
        adminFetch("/api/admin/payment-methods", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: next.id, display_order: curr.display_order }),
        }),
      ]);
      await fetchMethods();
    } catch {
      setActionMsg({ text: "Failed to reorder.", type: "error" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="font-body text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Action message */}
      {actionMsg && (
        <div className={`rounded-lg border px-4 py-3 font-body text-sm ${actionMsg.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {actionMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-slate-600">
          {methods.length === 0 ? "No payment methods configured yet." : `${methods.length} payment method${methods.length > 1 ? "s" : ""} configured.`}
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Method
        </button>
      </div>

      {/* Methods list */}
      {methods.length > 0 && (
        <div className="space-y-3">
          {methods.map((m, idx) => (
            <div
              key={m.id}
              className={`rounded-lg border p-4 transition-colors ${m.is_enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body text-sm font-semibold text-slate-900">{m.display_name}</span>
                    <span className={`rounded-full px-2 py-0.5 font-body text-xs font-medium ${
                      m.method_type === "bank" ? "bg-blue-50 text-blue-700"
                      : m.method_type === "wallet" ? "bg-purple-50 text-purple-700"
                      : m.method_type === "cash" ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-600"
                    }`}>
                      {METHOD_TYPE_LABELS[m.method_type as MethodType] || m.method_type}
                    </span>
                    {!m.is_enabled && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-body text-xs font-medium text-amber-700">Disabled</span>
                    )}
                  </div>
                  <div className="mt-1 font-body text-xs text-slate-500 space-y-0.5">
                    {m.method_type === "bank" && m.bank_name && (
                      <p>{m.bank_name}{m.branch ? ` — ${m.branch}` : ""}</p>
                    )}
                    {m.account_holder && <p>A/C Holder: {m.account_holder}</p>}
                    {m.account_number && <p>A/C: {m.account_number}</p>}
                    {m.method_type === "wallet" && m.wallet_name && (
                      <p>{m.wallet_name}: {m.wallet_number || "—"}</p>
                    )}
                    {m.instructions && <p className="italic">{m.instructions}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Reorder */}
                  <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" title="Move up">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  </button>
                  <button onClick={() => handleMoveDown(idx)} disabled={idx === methods.length - 1} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" title="Move down">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {/* Toggle */}
                  <button onClick={() => handleToggleEnabled(m)} className={`rounded p-1 ${m.is_enabled ? "text-green-600 hover:text-green-800" : "text-slate-400 hover:text-slate-600"}`} title={m.is_enabled ? "Disable" : "Enable"}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      {m.is_enabled
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      }
                    </svg>
                  </button>
                  {/* Edit */}
                  <button onClick={() => openEdit(m)} className="rounded p-1 text-slate-400 hover:text-primary" title="Edit">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                  </button>
                  {/* Delete */}
                  <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="rounded p-1 text-slate-400 hover:text-red-600 disabled:opacity-50" title="Delete">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Edit Payment Method" : "Add Payment Method"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Method type */}
              <div>
                <label className="block font-body text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={form.method_type}
                  onChange={(e) => setForm({ ...form, method_type: e.target.value as MethodType })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(METHOD_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Display name */}
              <div>
                <label className="block font-body text-sm font-medium text-slate-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="e.g. Nabil Bank, eSewa, Cash at Clinic"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Bank fields */}
              {(form.method_type === "bank" || form.method_type === "other") && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-body text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={form.bank_name}
                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm font-medium text-slate-700 mb-1">Branch</label>
                      <input
                        type="text"
                        value={form.branch}
                        onChange={(e) => setForm({ ...form, branch: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-slate-700 mb-1">Account Holder</label>
                    <input
                      type="text"
                      value={form.account_holder}
                      onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={form.account_number}
                      onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              )}

              {/* Wallet fields */}
              {form.method_type === "wallet" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-sm font-medium text-slate-700 mb-1">Wallet Name</label>
                    <input
                      type="text"
                      value={form.wallet_name}
                      onChange={(e) => setForm({ ...form, wallet_name: e.target.value })}
                      placeholder="e.g. eSewa, Khalti"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-slate-700 mb-1">Wallet Number</label>
                    <input
                      type="text"
                      value={form.wallet_number}
                      onChange={(e) => setForm({ ...form, wallet_number: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* QR Image */}
              {form.method_type !== "cash" && (
                <div>
                  <label className="block font-body text-sm font-medium text-slate-700 mb-1">QR Image</label>

                  {/* Upload */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 font-body text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      {uploadingQr ? "Uploading..." : "Upload QR Image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={uploadingQr}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            setUploadError("File too large. Maximum 2MB.");
                            return;
                          }
                          setUploadingQr(true);
                          setUploadError(null);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await adminFetch("/api/admin/payment-methods/upload-qr", {
                              method: "POST",
                              body: fd,
                            });
                            const data = await res.json();
                            if (!data.success) throw new Error(data.error);
                            setForm({ ...form, qr_image_url: data.url });
                          } catch (err) {
                            setUploadError(err instanceof Error ? err.message : "Upload failed.");
                          } finally {
                            setUploadingQr(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    <span className="font-body text-xs text-slate-500">PNG, JPEG, WebP, GIF · Max 2MB</span>
                  </div>
                  {uploadError && (
                    <p className="font-body text-xs text-red-600 mb-2">{uploadError}</p>
                  )}

                  {/* Manual URL input */}
                  <input
                    type="url"
                    value={form.qr_image_url}
                    onChange={(e) => setForm({ ...form, qr_image_url: e.target.value })}
                    placeholder="Or paste QR image URL: https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />

                  {/* Preview */}
                  {form.qr_image_url && (
                    <div className="mt-2 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.qr_image_url} alt="QR Preview" className="h-24 w-24 rounded border object-contain" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, qr_image_url: "" })}
                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 font-body text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div>
                <label className="block font-body text-sm font-medium text-slate-700 mb-1">Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  rows={2}
                  placeholder="Additional instructions for the customer..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                />
              </div>

              {/* Enabled toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_enabled}
                  onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="font-body text-sm text-slate-700">Enabled (visible on receipts)</span>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-body text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
