import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ------------------------------------------------------------------ */
/*  GET /api/admin/blog                                                */
/*  List blog posts with optional filters                              */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.trim().toLowerCase();

    let query = supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, tags, author_name, status, published_at, reading_time, is_featured, cover_image_url, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (statusFilter && ["draft", "published", "archived"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[blog GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch blog posts." }, { status: 500 });
    }

    let posts = data ?? [];

    if (search) {
      posts = posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search) ||
          p.author_name?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, posts });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/blog                                               */
/*  Create a new blog post                                             */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, slug, excerpt, content, cover_image_url, cover_image_alt,
      category, tags, author_name, reviewed_by, status,
      published_at, reading_time, medical_disclaimer,
      seo_title, seo_description, is_featured,
    } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required." }, { status: 400 });
    }
    if (!slug?.trim()) {
      return NextResponse.json({ success: false, error: "Slug is required." }, { status: 400 });
    }
    const trimmedSlug = slug.trim().toLowerCase();
    if (!SLUG_REGEX.test(trimmedSlug)) {
      return NextResponse.json({ success: false, error: "Slug must contain only lowercase letters, numbers, and hyphens." }, { status: 400 });
    }

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("slug", trimmedSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: "A blog post with this slug already exists." }, { status: 409 });
    }

    // If marking as featured, remove featured from other posts
    if (is_featured) {
      await supabaseAdmin
        .from("blog_posts")
        .update({ is_featured: false })
        .eq("is_featured", true);
    }

    const insertData: Record<string, unknown> = {
      title: title.trim(),
      slug: trimmedSlug,
      excerpt: excerpt?.trim() || null,
      content: content || "",
      cover_image_url: cover_image_url?.trim() || null,
      cover_image_alt: cover_image_alt?.trim() || null,
      category: category?.trim() || "general",
      tags: Array.isArray(tags) ? tags : [],
      author_name: author_name?.trim() || null,
      reviewed_by: reviewed_by?.trim() || null,
      status: ["draft", "published", "archived"].includes(status) ? status : "draft",
      published_at: status === "published" ? (published_at || new Date().toISOString()) : (published_at || null),
      reading_time: reading_time?.trim() || null,
      medical_disclaimer: medical_disclaimer?.trim() || null,
      seo_title: seo_title?.trim() || null,
      seo_description: seo_description?.trim() || null,
      is_featured: !!is_featured,
    };

    const { data: post, error: insertError } = await supabaseAdmin
      .from("blog_posts")
      .insert(insertData)
      .select("id, slug")
      .single();

    if (insertError || !post) {
      console.error("[blog POST]", insertError);
      return NextResponse.json({ success: false, error: "Failed to create blog post." }, { status: 500 });
    }

    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/blog                                              */
/*  Update an existing blog post                                       */
/* ------------------------------------------------------------------ */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Post ID is required." }, { status: 400 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (fields.title !== undefined) updateData.title = fields.title.trim();
    if (fields.slug !== undefined) {
      const trimmedSlug = fields.slug.trim().toLowerCase();
      if (!SLUG_REGEX.test(trimmedSlug)) {
        return NextResponse.json({ success: false, error: "Slug must contain only lowercase letters, numbers, and hyphens." }, { status: 400 });
      }
      // Check slug uniqueness (exclude current post)
      const { data: existing } = await supabaseAdmin
        .from("blog_posts")
        .select("id")
        .eq("slug", trimmedSlug)
        .neq("id", id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: false, error: "A blog post with this slug already exists." }, { status: 409 });
      }
      updateData.slug = trimmedSlug;
    }
    if (fields.excerpt !== undefined) updateData.excerpt = fields.excerpt?.trim() || null;
    if (fields.content !== undefined) updateData.content = fields.content || "";
    if (fields.cover_image_url !== undefined) updateData.cover_image_url = fields.cover_image_url?.trim() || null;
    if (fields.cover_image_alt !== undefined) updateData.cover_image_alt = fields.cover_image_alt?.trim() || null;
    if (fields.category !== undefined) updateData.category = fields.category?.trim() || "general";
    if (fields.tags !== undefined) updateData.tags = Array.isArray(fields.tags) ? fields.tags : [];
    if (fields.author_name !== undefined) updateData.author_name = fields.author_name?.trim() || null;
    if (fields.reviewed_by !== undefined) updateData.reviewed_by = fields.reviewed_by?.trim() || null;
    if (fields.status !== undefined) {
      if (["draft", "published", "archived"].includes(fields.status)) {
        updateData.status = fields.status;
        // Auto-set published_at when publishing for the first time
        if (fields.status === "published" && !fields.published_at) {
          const { data: currentPost } = await supabaseAdmin
            .from("blog_posts")
            .select("published_at")
            .eq("id", id)
            .single();
          if (!currentPost?.published_at) {
            updateData.published_at = new Date().toISOString();
          }
        }
      }
    }
    if (fields.published_at !== undefined) updateData.published_at = fields.published_at || null;
    if (fields.reading_time !== undefined) updateData.reading_time = fields.reading_time?.trim() || null;
    if (fields.medical_disclaimer !== undefined) updateData.medical_disclaimer = fields.medical_disclaimer?.trim() || null;
    if (fields.seo_title !== undefined) updateData.seo_title = fields.seo_title?.trim() || null;
    if (fields.seo_description !== undefined) updateData.seo_description = fields.seo_description?.trim() || null;
    if (fields.is_featured !== undefined) {
      updateData.is_featured = !!fields.is_featured;
      // If marking as featured, remove featured from other posts
      if (fields.is_featured) {
        await supabaseAdmin
          .from("blog_posts")
          .update({ is_featured: false })
          .eq("is_featured", true)
          .neq("id", id);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("blog_posts")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("[blog PATCH]", updateError);
      return NextResponse.json({ success: false, error: "Failed to update blog post." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/blog                                             */
/*  Delete a blog post (only drafts; published/archived → archive)     */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Post ID is required." }, { status: 400 });
    }

    // Check post status
    const { data: post } = await supabaseAdmin
      .from("blog_posts")
      .select("id, status")
      .eq("id", id)
      .single();

    if (!post) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }

    // Only allow deleting drafts; for published/archived, prefer archive
    if (post.status !== "draft") {
      return NextResponse.json(
        { success: false, error: "Only draft posts can be deleted. Archive published or archived posts instead." },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[blog DELETE]", deleteError);
      return NextResponse.json({ success: false, error: "Failed to delete blog post." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
