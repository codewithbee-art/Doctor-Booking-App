"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
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

const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

const STOCK_STATUS_STYLES: Record<string, string> = {
  in_stock: "text-green-700",
  low_stock: "text-amber-700",
  out_of_stock: "text-red-600",
};

export default function ProductCard({
  id, slug, name, short_description, category, price, sale_price,
  image_url, image_alt, stock_status, is_featured,
  requires_consultation, allow_delivery, allow_pickup,
}: ProductCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = getItemQuantity(id);
  const canAdd = stock_status !== "out_of_stock" && stock_status !== "hidden";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!canAdd) return;
    addItem({
      product_id: id,
      name,
      slug,
      price,
      sale_price,
      image_url,
      stock_status,
      requires_consultation,
      allow_delivery,
      allow_pickup,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-secondary/30 hover:shadow-md flex flex-col">
      {/* Image */}
      <Link href={`/shop/${slug}`} className="block overflow-hidden rounded-t-xl">
        <div className="relative flex h-44 items-center justify-center bg-bg-off overflow-hidden">
          <ProductImage
            src={image_url}
            alt={image_alt || name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {is_featured && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">Featured</span>
            )}
            {requires_consultation && (
              <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">Consultation Required</span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            {CATEGORY_LABELS[category] || category}
          </span>
          <span className={`font-body text-[10px] font-semibold ${STOCK_STATUS_STYLES[stock_status] || "text-text-secondary"}`}>
            {STOCK_STATUS_LABELS[stock_status] || stock_status}
          </span>
        </div>
        <Link href={`/shop/${slug}`}>
          <h3 className="font-body text-base font-semibold text-text-primary line-clamp-2 hover:text-primary transition-colors">{name}</h3>
        </Link>
        {short_description && (
          <p className="font-body text-sm text-text-secondary line-clamp-2 mt-1">{short_description}</p>
        )}

        {/* Delivery/Pickup indicators */}
        <div className="flex items-center gap-3 mt-2">
          {allow_delivery && (
            <span className="flex items-center gap-1 font-body text-[10px] text-text-secondary">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.375m0 0V11.25m0 3H21" /></svg>
              Delivery
            </span>
          )}
          {allow_pickup && (
            <span className="flex items-center gap-1 font-body text-[10px] text-text-secondary">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" /></svg>
              Pickup
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 mb-3">
            {sale_price != null && sale_price > 0 && sale_price < price ? (
              <>
                <span className="font-body text-lg font-bold text-primary">NPR {sale_price}</span>
                <span className="font-body text-sm text-text-secondary line-through">NPR {price}</span>
              </>
            ) : (
              <span className="font-body text-lg font-bold text-primary">NPR {price}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!canAdd}
              className={`flex-1 rounded-lg px-3 py-2.5 text-center font-body text-sm font-semibold transition-colors ${
                !canAdd
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : added
                  ? "bg-green-600 text-white"
                  : "bg-accent text-white hover:bg-accent-hover"
              }`}
              aria-label={`Add ${name} to cart`}
            >
              {!canAdd ? "Out of Stock" : added ? "Added!" : inCart > 0 ? `In Cart (${inCart})` : "Add to Cart"}
            </button>
            <Link
              href={`/shop/${slug}`}
              className="rounded-lg border border-border px-3 py-2.5 text-center font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
            >
              Details
            </Link>
          </div>
          {requires_consultation && inCart > 0 && (
            <p className="mt-1.5 font-body text-[10px] text-purple-700">Consultation required — admin will review your order.</p>
          )}
        </div>
      </div>
    </div>
  );
}
