"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductDetail {
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
  is_featured: boolean;
  requires_consultation: boolean;
  allow_delivery: boolean;
  allow_pickup: boolean;
  usage_instructions: string | null;
  ingredients: string | null;
  warnings: string | null;
}

interface SimilarProduct {
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

const STOCK_LABELS: Record<string, { text: string; className: string }> = {
  in_stock: { text: "In Stock", className: "border-green-300 bg-green-50 text-green-800" },
  low_stock: { text: "Low Stock", className: "border-amber-300 bg-amber-50 text-amber-800" },
  out_of_stock: { text: "Out of Stock", className: "border-red-300 bg-red-50 text-red-800" },
};

type DetailTab = "description" | "usage" | "ingredients" | "warnings";

/* ------------------------------------------------------------------ */
/*  Markdown prose component                                           */
/* ------------------------------------------------------------------ */

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none font-body text-text-primary prose-headings:font-heading prose-headings:text-text-primary prose-p:leading-relaxed prose-li:leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-strong:text-text-primary">
      <Markdown>{content}</Markdown>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Product not found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Fetch similar products once we have the product
  useEffect(() => {
    if (!product) return;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (!data.success) return;
        const all: SimilarProduct[] = data.products ?? [];
        // Exclude current product
        const others = all.filter((p) => p.id !== product.id);
        // Prioritise same category
        const sameCategory = others.filter((p) => p.category === product.category);
        const different = others.filter((p) => p.category !== product.category);
        const combined = [...sameCategory, ...different].slice(0, 4);
        setSimilarProducts(combined);
      } catch { /* ignore */ }
    })();
  }, [product]);

  // Set initial active tab based on available content
  useEffect(() => {
    if (!product) return;
    if (product.description) { setActiveTab("description"); return; }
    if (product.usage_instructions) { setActiveTab("usage"); return; }
    if (product.ingredients) { setActiveTab("ingredients"); return; }
    if (product.warnings) { setActiveTab("warnings"); return; }
  }, [product]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <main className="min-h-screen bg-bg-light">
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  /* ---- Error ---- */
  if (error || !product) {
    return (
      <main className="min-h-screen bg-bg-light">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Product Not Found</h1>
          <p className="mt-3 font-body text-base text-text-secondary">{error || "The product you are looking for does not exist or has been removed."}</p>
          <Link href="/shop" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const stockInfo = STOCK_LABELS[product.stock_status];
  const hasTabs = product.description || product.usage_instructions || product.ingredients || product.warnings;

  const tabs: { key: DetailTab; label: string; available: boolean }[] = [
    { key: "description", label: "Description", available: !!product.description },
    { key: "usage", label: "Usage Instructions", available: !!product.usage_instructions },
    { key: "ingredients", label: "Ingredients", available: !!product.ingredients },
    { key: "warnings", label: "Warnings", available: !!product.warnings },
  ];

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center gap-2 font-body text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="text-border">/</span>
          <span className="text-text-primary font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Product Hero Section */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Image */}
            <div className="relative aspect-square rounded-2xl border border-border bg-bg-off overflow-hidden">
              <ProductImage
                src={product.image_url}
                alt={product.image_alt || product.name}
                fill
                className="absolute inset-0 h-full w-full object-contain"
                placeholderClassName="h-20 w-20 text-border"
              />
              {/* Featured badge */}
              {product.is_featured && (
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">Featured</span>
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              {/* Category + Stock badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                {stockInfo && (
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${stockInfo.className}`}>
                    {stockInfo.text}
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl lg:text-4xl leading-tight">{product.name}</h1>

              {/* Short description */}
              {product.short_description && (
                <p className="mt-3 font-body text-base text-text-secondary leading-relaxed">{product.short_description}</p>
              )}

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3">
                {product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price ? (
                  <>
                    <span className="font-body text-3xl font-bold text-primary">NPR {product.sale_price}</span>
                    <span className="font-body text-lg text-text-secondary line-through">NPR {product.price}</span>
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                      {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="font-body text-3xl font-bold text-primary">NPR {product.price}</span>
                )}
              </div>

              {/* Consultation warning */}
              {product.requires_consultation && (
                <div className="mt-5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 flex items-start gap-3">
                  <svg className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="font-body text-sm text-purple-800">
                    <span className="font-semibold">Consultation Required.</span> This product requires a doctor&apos;s consultation before purchase. Please book an appointment or contact us.
                  </p>
                </div>
              )}

              {/* Delivery / Pickup */}
              <div className="mt-5 flex flex-wrap gap-4">
                {product.allow_delivery && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-light px-3 py-2">
                    <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.375m0 0V11.25m0 3H21" /></svg>
                    <span className="font-body text-sm font-medium text-text-primary">Delivery Available</span>
                  </div>
                )}
                {product.allow_pickup && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-light px-3 py-2">
                    <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" /></svg>
                    <span className="font-body text-sm font-medium text-text-primary">Collect from Shop</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-6">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  Contact Clinic to Order
                </Link>
                <p className="mt-2 font-body text-xs text-text-secondary">Online ordering coming soon. Call or visit us to purchase.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      {hasTabs && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          {/* Tab buttons */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
            {tabs.filter((t) => t.available).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors ${
                  activeTab === t.key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-border text-text-secondary hover:border-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="rounded-xl border border-border bg-white p-6 md:p-8 shadow-sm">
            {activeTab === "description" && product.description && (
              <MarkdownContent content={product.description} />
            )}
            {activeTab === "usage" && product.usage_instructions && (
              <MarkdownContent content={product.usage_instructions} />
            )}
            {activeTab === "ingredients" && product.ingredients && (
              <MarkdownContent content={product.ingredients} />
            )}
            {activeTab === "warnings" && product.warnings && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                  <h3 className="font-heading text-base font-bold text-amber-800">Important Safety Information</h3>
                </div>
                <div className="prose prose-sm max-w-none font-body text-amber-800 prose-headings:text-amber-900 prose-strong:text-amber-900 prose-ul:list-disc prose-ol:list-decimal prose-li:leading-relaxed">
                  <Markdown>{product.warnings}</Markdown>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 md:pb-12">
          <h2 className="font-heading text-xl font-bold text-text-primary mb-6 md:text-2xl">Similar Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}

      {/* Medicine Safety Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 pb-8 md:pb-12">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-body text-sm font-semibold text-amber-800">Medicine Safety Disclaimer</p>
              <p className="font-body text-sm text-amber-700 mt-1">
                Always consult with a qualified healthcare professional before starting any medication.
                Self-medication can be harmful. Information provided here is for educational purposes only and should not be considered medical advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to shop */}
      <div className="pb-12 text-center">
        <Link href="/shop" className="font-body text-sm font-semibold text-primary hover:underline">
          ← Back to Shop
        </Link>
      </div>
    </main>
  );
}
