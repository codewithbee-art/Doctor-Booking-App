import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/payment-methods                                     */
/*  Returns all payment methods ordered by display_order               */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "payment_methods" });
  if (auth instanceof NextResponse) return auth;

  try {
    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[payment-methods GET]", error.message);
      return NextResponse.json({ success: false, error: "Failed to fetch payment methods." }, { status: 500 });
    }

    return NextResponse.json({ success: true, methods: data ?? [] });
  } catch (err) {
    console.error("[payment-methods GET] unexpected", err);
    return NextResponse.json({ success: false, error: "Unexpected error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/payment-methods                                    */
/*  Create a new payment method                                        */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "payment_methods" });
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    const { method_type, display_name, bank_name, account_holder, account_number, branch, wallet_name, wallet_number, qr_image_url, instructions, is_enabled, display_order } = body;

    if (!display_name?.trim()) {
      return NextResponse.json({ success: false, error: "Display name is required." }, { status: 400 });
    }
    if (!["bank", "wallet", "cash", "other"].includes(method_type)) {
      return NextResponse.json({ success: false, error: "Invalid method type." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .insert({
        method_type,
        display_name: display_name.trim(),
        bank_name: bank_name?.trim() || null,
        account_holder: account_holder?.trim() || null,
        account_number: account_number?.trim() || null,
        branch: branch?.trim() || null,
        wallet_name: wallet_name?.trim() || null,
        wallet_number: wallet_number?.trim() || null,
        qr_image_url: qr_image_url?.trim() || null,
        instructions: instructions?.trim() || null,
        is_enabled: is_enabled !== false,
        display_order: typeof display_order === "number" ? display_order : 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[payment-methods POST]", error.message);
      return NextResponse.json({ success: false, error: "Failed to create payment method." }, { status: 500 });
    }

    return NextResponse.json({ success: true, method: data });
  } catch (err) {
    console.error("[payment-methods POST] unexpected", err);
    return NextResponse.json({ success: false, error: "Unexpected error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/payment-methods                                   */
/*  Update an existing payment method                                  */
/* ------------------------------------------------------------------ */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "payment_methods" });
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Payment method ID is required." }, { status: 400 });
    }

    // Build safe update object
    const updateData: Record<string, unknown> = {};
    if (updates.method_type !== undefined) {
      if (!["bank", "wallet", "cash", "other"].includes(updates.method_type)) {
        return NextResponse.json({ success: false, error: "Invalid method type." }, { status: 400 });
      }
      updateData.method_type = updates.method_type;
    }
    if (updates.display_name !== undefined) updateData.display_name = updates.display_name?.trim() || null;
    if (updates.bank_name !== undefined) updateData.bank_name = updates.bank_name?.trim() || null;
    if (updates.account_holder !== undefined) updateData.account_holder = updates.account_holder?.trim() || null;
    if (updates.account_number !== undefined) updateData.account_number = updates.account_number?.trim() || null;
    if (updates.branch !== undefined) updateData.branch = updates.branch?.trim() || null;
    if (updates.wallet_name !== undefined) updateData.wallet_name = updates.wallet_name?.trim() || null;
    if (updates.wallet_number !== undefined) updateData.wallet_number = updates.wallet_number?.trim() || null;
    if (updates.qr_image_url !== undefined) updateData.qr_image_url = updates.qr_image_url?.trim() || null;
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions?.trim() || null;
    if (updates.is_enabled !== undefined) updateData.is_enabled = !!updates.is_enabled;
    if (updates.display_order !== undefined) updateData.display_order = updates.display_order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[payment-methods PATCH]", error.message);
      return NextResponse.json({ success: false, error: "Failed to update payment method." }, { status: 500 });
    }

    return NextResponse.json({ success: true, method: data });
  } catch (err) {
    console.error("[payment-methods PATCH] unexpected", err);
    return NextResponse.json({ success: false, error: "Unexpected error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/payment-methods                                   */
/*  Delete a payment method                                            */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "payment_methods" });
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Payment method ID is required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("payment_methods")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[payment-methods DELETE]", error.message);
      return NextResponse.json({ success: false, error: "Failed to delete payment method." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payment-methods DELETE] unexpected", err);
    return NextResponse.json({ success: false, error: "Unexpected error." }, { status: 500 });
  }
}
