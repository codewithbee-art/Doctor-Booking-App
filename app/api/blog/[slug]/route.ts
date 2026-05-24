import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/blog/[slug]                                                */
/*  Public: returns a single published blog post by slug                */
/* ------------------------------------------------------------------ */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    // Fetch recent posts (excluding current) — always latest published
    const { data: recentPosts } = await supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, cover_image_alt, category, author_name, published_at, reading_time, is_featured")
      .eq("status", "published")
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(5);

    // Fetch related posts (same category, excluding current)
    const { data: sameCategoryPosts } = await supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, cover_image_alt, category, author_name, published_at, reading_time, is_featured")
      .eq("status", "published")
      .eq("category", post.category)
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(3);

    // Fallback: if fewer than 3 same-category posts, fill with latest posts
    let relatedPosts = sameCategoryPosts ?? [];
    if (relatedPosts.length < 3 && (recentPosts ?? []).length > 0) {
      const existingIds = new Set(relatedPosts.map((p) => p.id));
      const fillers = (recentPosts ?? []).filter((p) => !existingIds.has(p.id));
      relatedPosts = [...relatedPosts, ...fillers].slice(0, 3);
    }

    return NextResponse.json({
      success: true,
      post,
      recentPosts: recentPosts ?? [],
      relatedPosts,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
