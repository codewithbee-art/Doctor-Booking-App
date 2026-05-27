"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

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

export default function ShopPreview() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products?featured=true", { cache: "no-store" });
        const json = await res.json();
        if (res.ok) {
          let items: ShopProduct[] = json.products ?? [];
          if (items.length === 0) {
            const allRes = await fetch("/api/products", { cache: "no-store" });
            const allJson = await allRes.json();
            items = (allJson.products ?? []).slice(0, 4);
          } else {
            items = items.slice(0, 4);
          }
          setProducts(items);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-2 text-center font-heading text-3xl font-bold md:text-4xl">
            Order Medicine Online
          </h2>
          <p className="mb-10 text-center font-body text-base text-text-secondary">
            Get essential medicines delivered to your doorstep
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-white overflow-hidden">
                <div className="h-44 bg-bg-off" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 rounded bg-bg-off" />
                  <div className="h-4 w-3/4 rounded bg-bg-off" />
                  <div className="h-3 w-full rounded bg-bg-off" />
                  <div className="h-5 w-20 rounded bg-bg-off" />
                  <div className="h-9 w-full rounded bg-bg-off" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-2 text-center font-heading text-3xl font-bold md:text-4xl">
            Order Medicine Online
          </h2>
          <p className="mb-10 text-center font-body text-base text-text-secondary">
            Get essential medicines delivered to your doorstep
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-bg-off">
                  <svg className="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-base font-semibold text-text-secondary">Coming Soon</h3>
                <p className="font-body text-sm text-text-secondary">Products will appear here once added.</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-body text-base font-semibold text-primary hover:text-secondary transition-colors"
            >
              Visit Shop
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg-light px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 text-center font-heading text-3xl font-bold md:text-4xl">
          Order Medicine Online
        </h2>
        <p className="mb-10 text-center font-body text-base text-text-secondary">
          Get essential medicines delivered to your doorstep
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-body text-base font-semibold text-primary hover:text-secondary transition-colors"
          >
            View All Products
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
