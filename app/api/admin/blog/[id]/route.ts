import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/blog/[id]                                           */
/*  Fetch a single blog post by ID                                     */
/* ------------------------------------------------------------------ */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
