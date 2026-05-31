"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import ProductImage from "@/components/ProductImage";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  image_alt: string | null;
  stock_quantity: number;
  stock_status: string;
  is_active: boolean;
  is_featured: boolean;
  requires_consultation: boolean;
  allow_delivery: boolean;
  allow_pickup: boolean;
  usage_instructions: string | null;
  ingredients: string | null;
  warnings: string | null;
  created_at: string;
  updated_at: string;
}

type FilterTab = "all" | "active" | "inactive" | "out_of_stock" | "hidden";

interface ProductFormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  price: string;
  sale_price: string;
  image_url: string;
  image_alt: string;
  stock_quantity: string;
  stock_status: string;
  is_active: boolean;
  is_featured: boolean;
  requires_consultation: boolean;
  allow_delivery: boolean;
  allow_pickup: boolean;
  usage_instructions: string;
  ingredients: string;
  warnings: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  ayurveda: "Ayurveda",
  supplements: "Supplements",
  pain_relief: "Pain Relief",
  skin_care: "Skin Care",
  digestive: "Digestive",
  immunity: "Immunity",
  personal_care: "Personal Care",
  first_aid: "First Aid",
  vitamins: "Vitamins",
  other: "Other",
};

const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  hidden: "Hidden",
};

const STOCK_STATUS_STYLES: Record<string, string> = {
  in_stock: "border-green-300 bg-green-50 text-green-800",
  low_stock: "border-amber-300 bg-amber-50 text-amber-800",
  out_of_stock: "border-red-300 bg-red-50 text-red-800",
  hidden: "border-slate-300 bg-slate-100 text-slate-600",
};

const EMPTY_FORM: ProductFormData = {
  name: "", slug: "", short_description: "", description: "",
  category: "other", price: "", sale_price: "", image_url: "", image_alt: "",
  stock_quantity: "0", stock_status: "in_stock",
  is_active: true, is_featured: false, requires_consultation: false,
  allow_delivery: true, allow_pickup: true,
  usage_instructions: "", ingredients: "", warnings: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminShopPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: staffProfile, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /* ---- Auth ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch ---- */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking && !inactive) fetchProducts();
  }, [checking, inactive, fetchProducts]);

  /* ---- Filters ---- */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (filter === "active" && (!p.is_active || p.stock_status === "hidden")) return false;
      if (filter === "inactive" && p.is_active) return false;
      if (filter === "out_of_stock" && p.stock_status !== "out_of_stock") return false;
      if (filter === "hidden" && p.stock_status !== "hidden") return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, filter, search]);

  const counts = useMemo(() => ({
    all: products.length,
    active: products.filter((p) => p.is_active && p.stock_status !== "hidden").length,
    inactive: products.filter((p) => !p.is_active).length,
    out_of_stock: products.filter((p) => p.stock_status === "out_of_stock").length,
    hidden: products.filter((p) => p.stock_status === "hidden").length,
  }), [products]);

  /* ---- Form helpers ---- */
  function openCreate() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setSlugManual(false);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      name: p.name,
      slug: p.slug,
      short_description: p.short_description || "",
      description: p.description || "",
      category: p.category,
      price: String(p.price),
      sale_price: p.sale_price != null ? String(p.sale_price) : "",
      image_url: p.image_url || "",
      image_alt: p.image_alt || "",
      stock_quantity: String(p.stock_quantity),
      stock_status: p.stock_status,
      is_active: p.is_active,
      is_featured: p.is_featured,
      requires_consultation: p.requires_consultation,
      allow_delivery: p.allow_delivery,
      allow_pickup: p.allow_pickup,
      usage_instructions: p.usage_instructions || "",
      ingredients: p.ingredients || "",
      warnings: p.warnings || "",
    });
    setSlugManual(true);
    setFormError(null);
    setShowModal(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "name" && !slugManual) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setForm((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setFormError(null);
    if (!form.name.trim()) { setFormError("Product name is required."); return; }
    if (!form.slug.trim()) { setFormError("Slug is required."); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { setFormError("A valid price is required."); return; }
    if (form.sale_price && Number(form.sale_price) > 0 && Number(form.sale_price) >= Number(form.price)) {
      setFormError("Sale price must be lower than regular price.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        category: form.category,
        price: Number(form.price),
        sale_price: form.sale_price && Number(form.sale_price) > 0 ? Number(form.sale_price) : null,
        image_url: form.image_url.trim() || null,
        image_alt: form.image_alt.trim() || null,
        stock_quantity: Math.max(0, Math.floor(Number(form.stock_quantity) || 0)),
        stock_status: form.stock_status,
        is_active: form.is_active,
        is_featured: form.is_featured,
        requires_consultation: form.requires_consultation,
        allow_delivery: form.allow_delivery,
        allow_pickup: form.allow_pickup,
        usage_instructions: form.usage_instructions.trim() || null,
        ingredients: form.ingredients.trim() || null,
        warnings: form.warnings.trim() || null,
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
      }

      const res = await fetch("/api/admin/products", {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setActionMsg({ text: editingProduct ? "Product updated." : "Product created.", type: "success" });
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: p.is_active ? "Product deactivated." : "Product activated.", type: "success" });
      fetchProducts();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Action failed.", type: "error" });
    }
  }

  async function toggleFeatured(p: Product) {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, is_featured: !p.is_featured }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: p.is_featured ? "Removed from featured." : "Marked as featured.", type: "success" });
      fetchProducts();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Action failed.", type: "error" });
    }
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: "Product deleted.", type: "success" });
      fetchProducts();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Delete failed.", type: "error" });
    }
  }

  /* ---- Loading gates ---- */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (inactive) return <AdminInactive />;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "out_of_stock", label: "Out of Stock" },
    { key: "hidden", label: "Hidden" },
  ];

  return (
    <main className="min-h-screen bg-bg-light">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">Shop Management</h1>
            <p className="font-body text-sm text-text-secondary mt-1">Manage products, stock, and catalogue.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Dashboard
            </a>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              New Product
            </button>
          </div>
        </div>

        {/* Shop admin tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <span className="px-4 py-2.5 font-body text-sm font-semibold text-primary border-b-2 border-primary">Products</span>
          <a href="/admin/orders" className="px-4 py-2.5 font-body text-sm font-semibold text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/30">Orders</a>
          <a href="/admin/shop/analytics" className="px-4 py-2.5 font-body text-sm font-semibold text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/30">Analytics</a>
        </div>

        {/* Action message */}
        {actionMsg && (
          <div className={`mb-4 rounded-lg border px-4 py-3 font-body text-sm ${actionMsg.type === "success" ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"}`}>
            {actionMsg.text}
            <button onClick={() => setActionMsg(null)} className="ml-3 font-semibold underline">Dismiss</button>
          </div>
        )}

        {/* Search + Tabs */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name, slug, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          />
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                  filter === t.key
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text-secondary hover:border-secondary"
                }`}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        {error && <p className="text-center font-body text-sm text-danger py-10">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center font-body text-sm text-text-secondary py-16">No products found.</p>
        )}

        {/* Products grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className={`rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${!p.is_active ? "opacity-60" : ""}`}>
                {/* Image */}
                <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-bg-off overflow-hidden">
                  <ProductImage src={p.image_url} alt={p.image_alt || p.name} className="h-full w-full object-cover" placeholderClassName="h-10 w-10 text-border" />
                </div>
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STOCK_STATUS_STYLES[p.stock_status] || ""}`}>
                    {STOCK_STATUS_LABELS[p.stock_status] || p.stock_status}
                  </span>
                  <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {CATEGORY_LABELS[p.category] || p.category}
                  </span>
                  {p.is_featured && (
                    <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Featured</span>
                  )}
                  {!p.is_active && (
                    <span className="inline-block rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Inactive</span>
                  )}
                  {p.requires_consultation && (
                    <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">Consultation</span>
                  )}
                </div>
                {/* Info */}
                <h3 className="font-body text-sm font-semibold text-text-primary truncate" title={p.name}>{p.name}</h3>
                <p className="font-body text-xs text-text-secondary truncate mt-0.5">{p.short_description || "—"}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  {p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price ? (
                    <>
                      <span className="font-body text-sm font-bold text-primary">NPR {p.sale_price}</span>
                      <span className="font-body text-xs text-text-secondary line-through">NPR {p.price}</span>
                    </>
                  ) : (
                    <span className="font-body text-sm font-bold text-primary">NPR {p.price}</span>
                  )}
                  <span className="ml-auto font-body text-[10px] text-text-secondary">Qty: {p.stock_quantity}</span>
                </div>
                <p className="font-body text-[10px] text-text-secondary mt-1">{formatDate(p.updated_at)}</p>
                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  <button onClick={() => openEdit(p)} className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">Edit</button>
                  <button onClick={() => toggleActive(p)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${p.is_active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                    {p.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => toggleFeatured(p)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${p.is_featured ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                    {p.is_featured ? "Unfeature" : "Feature"}
                  </button>
                  <button onClick={() => deleteProduct(p)} className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors ml-auto">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== Create / Edit Modal ==================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">{editingProduct ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-bg-light transition-colors" aria-label="Close">
                <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {formError && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 font-body text-sm text-red-700">{formError}</p>}

              {/* Name */}
              <div>
                <label htmlFor="pf-name" className="block font-body text-sm font-semibold text-text-primary mb-1">Product Name <span className="text-danger">*</span></label>
                <input id="pf-name" name="name" type="text" value={form.name} onChange={handleFormChange} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="pf-slug" className="block font-body text-sm font-semibold text-text-primary mb-1">Slug <span className="text-danger">*</span></label>
                <input
                  id="pf-slug" name="slug" type="text" value={form.slug}
                  onChange={(e) => { setSlugManual(true); handleFormChange(e); }}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="font-body text-xs text-text-secondary mt-0.5">URL-friendly identifier. Auto-generated from name.</p>
              </div>

              {/* Category + Price row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="pf-category" className="block font-body text-sm font-semibold text-text-primary mb-1">Category</label>
                  <select id="pf-category" name="category" value={form.category} onChange={handleFormChange} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="pf-price" className="block font-body text-sm font-semibold text-text-primary mb-1">Price (NPR) <span className="text-danger">*</span></label>
                  <input id="pf-price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label htmlFor="pf-sale-price" className="block font-body text-sm font-semibold text-text-primary mb-1">Sale Price</label>
                  <input id="pf-sale-price" name="sale_price" type="number" min="0" step="0.01" value={form.sale_price} onChange={handleFormChange} placeholder="Leave empty if no sale" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary" />
                  {form.sale_price && Number(form.sale_price) > 0 && Number(form.price) > 0 && Number(form.sale_price) >= Number(form.price) && (
                    <p className="mt-1 font-body text-xs text-danger">Sale price must be lower than regular price.</p>
                  )}
                </div>
              </div>

              {/* Short description */}
              <div>
                <label htmlFor="pf-short-desc" className="block font-body text-sm font-semibold text-text-primary mb-1">Short Description</label>
                <input id="pf-short-desc" name="short_description" type="text" maxLength={200} value={form.short_description} onChange={handleFormChange} placeholder="Brief one-line description" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="pf-desc" className="block font-body text-sm font-semibold text-text-primary mb-1">Full Description</label>
                <textarea id="pf-desc" name="description" rows={3} value={form.description} onChange={handleFormChange} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="mt-1 font-body text-[11px] text-text-secondary">Markdown supported: **bold**, *italic*, ## heading, - bullet, 1. numbered, [link](url), &gt; quote</p>
              </div>

              {/* Image */}
              <div>
                <label className="block font-body text-sm font-semibold text-text-primary mb-1">Product Image</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input name="image_url" type="text" value={form.image_url} onChange={handleFormChange} placeholder="Image URL" className="flex-1 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary" />
                  <label className={`inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    {uploading ? "Uploading…" : "Upload"}
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {form.image_url && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-border bg-bg-off">
                      <ProductImage src={form.image_url} alt={form.image_alt || "Preview"} className="h-full w-full object-cover" placeholderClassName="h-6 w-6 text-border" />
                    </div>
                    <input name="image_alt" type="text" value={form.image_alt} onChange={handleFormChange} placeholder="Image alt text" className="flex-1 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                )}
              </div>

              {/* Stock row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pf-qty" className="block font-body text-sm font-semibold text-text-primary mb-1">Stock Quantity</label>
                  <input id="pf-qty" name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleFormChange} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label htmlFor="pf-status" className="block font-body text-sm font-semibold text-text-primary mb-1">Stock Status</label>
                  <select id="pf-status" name="stock_status" value={form.stock_status} onChange={handleFormChange} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                    {Object.entries(STOCK_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["is_active", "Active"],
                  ["is_featured", "Featured"],
                  ["requires_consultation", "Requires Consultation"],
                  ["allow_delivery", "Allow Delivery"],
                  ["allow_pickup", "Allow Pickup"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={key} checked={form[key] as boolean} onChange={handleFormChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="font-body text-sm text-text-primary">{label}</span>
                  </label>
                ))}
              </div>

              {/* Usage / Ingredients / Warnings */}
              <div>
                <label htmlFor="pf-usage" className="block font-body text-sm font-semibold text-text-primary mb-1">Usage Instructions</label>
                <textarea id="pf-usage" name="usage_instructions" rows={2} value={form.usage_instructions} onChange={handleFormChange} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="mt-1 font-body text-[11px] text-text-secondary">Markdown supported: **bold**, *italic*, - bullet list, 1. numbered list</p>
              </div>
              <div>
                <label htmlFor="pf-ingredients" className="block font-body text-sm font-semibold text-text-primary mb-1">Ingredients</label>
                <textarea id="pf-ingredients" name="ingredients" rows={2} value={form.ingredients} onChange={handleFormChange} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="mt-1 font-body text-[11px] text-text-secondary">Markdown supported: **bold**, - bullet list, 1. numbered list</p>
              </div>
              <div>
                <label htmlFor="pf-warnings" className="block font-body text-sm font-semibold text-text-primary mb-1">Warnings / Precautions</label>
                <textarea id="pf-warnings" name="warnings" rows={2} value={form.warnings} onChange={handleFormChange} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="mt-1 font-body text-[11px] text-text-secondary">Markdown supported: **bold**, - bullet list, 1. numbered list</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-accent px-5 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving…" : editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
