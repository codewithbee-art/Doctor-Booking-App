import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/blog                                                       */
/*  Public: returns only published blog posts                           */
/*  Query params: search, category, featured (for homepage preview)     */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const category = searchParams.get("category")?.trim();
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const homepage = searchParams.get("homepage") === "true";

    let query = supabaseAdmin
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, cover_image_url, cover_image_alt, category, tags, author_name, published_at, reading_time, is_featured, seo_title, seo_description"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[public blog GET]", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch blog posts." },
        { status: 500 }
      );
    }

    let posts = data ?? [];

    // Client-side search filter
    if (search) {
      posts = posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.excerpt?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search) ||
          p.author_name?.toLowerCase().includes(search) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(search))
      );
    }

    // Featured-first ordering: pin featured post(s) first, then newest
    const featured = posts.filter((p) => p.is_featured);
    const others = posts.filter((p) => !p.is_featured);
    const ordered = [...featured, ...others];

    if (homepage) {
      return NextResponse.json({ success: true, posts: ordered.slice(0, 3) });
    }

    return NextResponse.json({ success: true, posts: ordered.slice(0, limit) });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
