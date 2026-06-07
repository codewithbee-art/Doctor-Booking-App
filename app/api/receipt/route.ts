import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/receipt?type=order&id=<uuid>                              */
/*  GET /api/receipt?type=booking&id=<uuid>                            */
/*  Public-safe receipt data (no sensitive admin data)                  */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!id || !type) {
    return NextResponse.json({ success: false, error: "Missing type or id." }, { status: 400 });
  }

  try {
    if (type === "order") {
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select("id, order_number, customer_name, customer_phone, customer_email, fulfillment_method, delivery_address, order_status, payment_status, payment_preference, subtotal, delivery_fee, total, has_consultation_items, payment_methods_snapshot, payment_reference, created_at")
        .eq("id", id)
        .single();

      if (error || !order) {
        return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
      }

      // Fetch order items
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_name_snapshot, quantity, unit_price, subtotal, requires_consultation_snapshot")
        .eq("order_id", id)
        .order("created_at", { ascending: true });

      return NextResponse.json({
        success: true,
        receipt_type: "order",
        data: {
          ...order,
          items: items ?? [],
        },
      });
    }

    if (type === "booking") {
      const { data: booking, error } = await supabaseAdmin
        .from("bookings")
        .select("id, patient_name, patient_phone, patient_email, problem, appointment_date_ad, appointment_date_bs, appointment_time, booking_type, specialist_id, status, booking_reference, payment_methods_snapshot, payment_status, consultation_mode, payment_preference, created_at")
        .eq("id", id)
        .single();

      if (error || !booking) {
        return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
      }

      // Fetch specialist info if applicable
      let specialistName: string | null = null;
      let specialistSpecialization: string | null = null;
      let consultationFee: number | null = null;
      if (booking.specialist_id) {
        const { data: specialist } = await supabaseAdmin
          .from("visiting_specialists")
          .select("specialist_name, specialization, consultation_fee")
          .eq("id", booking.specialist_id)
          .single();
        if (specialist) {
          specialistName = specialist.specialist_name;
          specialistSpecialization = specialist.specialization;
          consultationFee = specialist.consultation_fee;
        }
      }

      return NextResponse.json({
        success: true,
        receipt_type: "booking",
        data: {
          ...booking,
          specialist_name: specialistName,
          specialist_specialization: specialistSpecialization,
          consultation_fee: consultationFee,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid receipt type." }, { status: 400 });
  } catch (err) {
    console.error("[receipt GET]", err);
    return NextResponse.json({ success: false, error: "Unexpected error." }, { status: 500 });
  }
}
