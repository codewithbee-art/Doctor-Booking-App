"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import PageHero from "@/components/PageHero";

// Change this path to use a page-specific hero image when available
const SHOP_HERO_IMAGE = "/Images/PageHero/shop7.jpg";

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  category: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  image_alt: string | null;
  stock_status: string;
  is_featured: boolean;
  requires_consultation: boolean;
  allow_delivery: boolean;
  allow_pickup: boolean;
}

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

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setProducts(data.products ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (stockFilter === "in_stock" && p.stock_status !== "in_stock" && p.stock_status !== "low_stock") return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.short_description?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, category, stockFilter]);

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Hero */}
      <PageHero
        title="Medicine Shop"
        subtitle="Browse our range of quality medicines and health products"
        breadcrumb={{ label: "Back to Home", href: "/" }}
        backgroundImage={SHOP_HERO_IMAGE}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
            className="w-full rounded-lg border border-border bg-white px-4 py-3 font-body text-base text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex flex-wrap gap-3">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                  category === "all" ? "border-primary bg-primary text-white" : "border-border bg-white text-text-secondary hover:border-secondary"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                    category === c ? "border-primary bg-primary text-white" : "border-border bg-white text-text-secondary hover:border-secondary"
                  }`}
                >
                  {CATEGORY_LABELS[c] || c}
                </button>
              ))}
            </div>
            {/* Stock filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Stock availability filter"
              className="rounded-full border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Availability</option>
              <option value="in_stock">In Stock Only</option>
            </select>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        {error && <p className="text-center font-body text-base text-danger py-16">{error}</p>}

        {/* Products grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-lg text-text-secondary">No products found.</p>
            {search || category !== "all" ? (
              <button
                onClick={() => { setSearch(""); setCategory("all"); setStockFilter("all"); }}
                className="mt-3 font-body text-sm font-semibold text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        )}

        {/* Medicine disclaimer */}
        <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-body text-sm font-semibold text-amber-800">Medicine Safety Disclaimer</p>
              <p className="font-body text-sm text-amber-700 mt-1">
                Products listed here are for informational purposes. Always consult with a qualified healthcare professional before starting any medication.
                Self-medication can be harmful. Some products may require a doctor&apos;s consultation before purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="font-body text-sm font-semibold text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
