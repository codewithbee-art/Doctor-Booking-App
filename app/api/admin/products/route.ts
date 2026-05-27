import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_STOCK_STATUSES = ["in_stock", "low_stock", "out_of_stock", "hidden"];
const VALID_CATEGORIES = [
  "ayurveda", "supplements", "pain_relief", "skin_care", "digestive",
  "immunity", "personal_care", "first_aid", "vitamins", "other",
];

/* ------------------------------------------------------------------ */
/*  GET /api/admin/products                                             */
/*  Admin: list ALL products (including inactive/hidden)                */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const statusFilter = searchParams.get("stock_status");
    const activeFilter = searchParams.get("is_active");

    let query = supabaseAdmin
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });

    if (statusFilter && VALID_STOCK_STATUSES.includes(statusFilter)) {
      query = query.eq("stock_status", statusFilter);
    }
    if (activeFilter === "true") query = query.eq("is_active", true);
    if (activeFilter === "false") query = query.eq("is_active", false);

    const { data, error } = await query;

    if (error) {
      console.error("[admin products GET]", error.code);
      return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
    }

    let products = data ?? [];

    if (search) {
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(search) ||
          p.slug?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/products                                            */
/*  Admin: create a new product                                         */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, slug, short_description, description, category,
      price, sale_price, image_url, image_alt,
      stock_quantity, stock_status,
      is_active, is_featured, requires_consultation,
      allow_delivery, allow_pickup,
      usage_instructions, ingredients, warnings,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Product name is required." }, { status: 400 });
    }
    if (!slug?.trim()) {
      return NextResponse.json({ success: false, error: "Slug is required." }, { status: 400 });
    }
    const trimmedSlug = slug.trim().toLowerCase();
    if (!SLUG_REGEX.test(trimmedSlug)) {
      return NextResponse.json({ success: false, error: "Slug must contain only lowercase letters, numbers, and hyphens." }, { status: 400 });
    }
    if (price == null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ success: false, error: "A valid price is required." }, { status: 400 });
    }

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", trimmedSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: "A product with this slug already exists." }, { status: 409 });
    }

    const insertData: Record<string, unknown> = {
      name: name.trim(),
      slug: trimmedSlug,
      short_description: short_description?.trim() || null,
      description: description?.trim() || null,
      category: VALID_CATEGORIES.includes(category) ? category : "other",
      price: Number(price),
      sale_price: sale_price != null && !isNaN(Number(sale_price)) && Number(sale_price) > 0 ? Number(sale_price) : null,
      image_url: image_url?.trim() || null,
      image_alt: image_alt?.trim() || null,
      stock_quantity: stock_quantity != null && !isNaN(Number(stock_quantity)) ? Math.max(0, Math.floor(Number(stock_quantity))) : 0,
      stock_status: VALID_STOCK_STATUSES.includes(stock_status) ? stock_status : "in_stock",
      is_active: is_active !== false,
      is_featured: !!is_featured,
      requires_consultation: !!requires_consultation,
      allow_delivery: allow_delivery !== false,
      allow_pickup: allow_pickup !== false,
      usage_instructions: usage_instructions?.trim() || null,
      ingredients: ingredients?.trim() || null,
      warnings: warnings?.trim() || null,
    };

    const { data: product, error: insertError } = await supabaseAdmin
      .from("products")
      .insert(insertData)
      .select("id, slug")
      .single();

    if (insertError || !product) {
      console.error("[admin products POST]", insertError?.code);
      return NextResponse.json({ success: false, error: "Failed to create product." }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/products                                           */
/*  Admin: update an existing product                                   */
/* ------------------------------------------------------------------ */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (fields.name !== undefined) updateData.name = fields.name.trim();
    if (fields.slug !== undefined) {
      const trimmedSlug = fields.slug.trim().toLowerCase();
      if (!SLUG_REGEX.test(trimmedSlug)) {
        return NextResponse.json({ success: false, error: "Slug must contain only lowercase letters, numbers, and hyphens." }, { status: 400 });
      }
      const { data: existing } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("slug", trimmedSlug)
        .neq("id", id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: false, error: "A product with this slug already exists." }, { status: 409 });
      }
      updateData.slug = trimmedSlug;
    }
    if (fields.short_description !== undefined) updateData.short_description = fields.short_description?.trim() || null;
    if (fields.description !== undefined) updateData.description = fields.description?.trim() || null;
    if (fields.category !== undefined) updateData.category = VALID_CATEGORIES.includes(fields.category) ? fields.category : "other";
    if (fields.price !== undefined) updateData.price = Math.max(0, Number(fields.price) || 0);
    if (fields.sale_price !== undefined) {
      updateData.sale_price = fields.sale_price != null && !isNaN(Number(fields.sale_price)) && Number(fields.sale_price) > 0
        ? Number(fields.sale_price) : null;
    }
    if (fields.image_url !== undefined) updateData.image_url = fields.image_url?.trim() || null;
    if (fields.image_alt !== undefined) updateData.image_alt = fields.image_alt?.trim() || null;
    if (fields.stock_quantity !== undefined) updateData.stock_quantity = Math.max(0, Math.floor(Number(fields.stock_quantity) || 0));
    if (fields.stock_status !== undefined && VALID_STOCK_STATUSES.includes(fields.stock_status)) updateData.stock_status = fields.stock_status;
    if (fields.is_active !== undefined) updateData.is_active = !!fields.is_active;
    if (fields.is_featured !== undefined) updateData.is_featured = !!fields.is_featured;
    if (fields.requires_consultation !== undefined) updateData.requires_consultation = !!fields.requires_consultation;
    if (fields.allow_delivery !== undefined) updateData.allow_delivery = !!fields.allow_delivery;
    if (fields.allow_pickup !== undefined) updateData.allow_pickup = !!fields.allow_pickup;
    if (fields.usage_instructions !== undefined) updateData.usage_instructions = fields.usage_instructions?.trim() || null;
    if (fields.ingredients !== undefined) updateData.ingredients = fields.ingredients?.trim() || null;
    if (fields.warnings !== undefined) updateData.warnings = fields.warnings?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("[admin products PATCH]", updateError.code);
      return NextResponse.json({ success: false, error: "Failed to update product." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/products                                          */
/*  Admin: permanently delete a product                                 */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[admin products DELETE]", deleteError.code);
      return NextResponse.json({ success: false, error: "Failed to delete product." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
