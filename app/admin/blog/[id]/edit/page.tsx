"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import BlogForm from "../../BlogForm";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  tags: string[];
  author_name: string | null;
  reviewed_by: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  reading_time: string | null;
  medical_disclaimer: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { loading: staffLoading, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  const fetchPost = useCallback(async () => {
    setLoadingPost(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPost(data.post);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load post.");
    } finally {
      setLoadingPost(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!checking && !inactive && postId) fetchPost();
  }, [checking, inactive, postId, fetchPost]);

  if (checking || loadingPost) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (inactive) return <AdminInactive />;

  if (loadError || !post) {
    return (
      <main className="min-h-screen bg-bg-light">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="font-body text-base text-red-600 mb-4">{loadError || "Post not found."}</p>
          <a href="/admin/blog" className="font-body text-sm font-semibold text-primary hover:underline">Back to Blog</a>
        </div>
      </main>
    );
  }

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content,
    cover_image_url: post.cover_image_url || "",
    cover_image_alt: post.cover_image_alt || "",
    category: post.category,
    tags: (post.tags || []).join(", "),
    author_name: post.author_name || "",
    reviewed_by: post.reviewed_by || "",
    status: post.status,
    published_at: post.published_at || "",
    reading_time: post.reading_time || "",
    medical_disclaimer: post.medical_disclaimer || "",
    seo_title: post.seo_title || "",
    seo_description: post.seo_description || "",
    is_featured: post.is_featured,
  };

  return (
    <main className="min-h-screen bg-bg-light">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <a
            href="/admin/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back
          </a>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Edit Post</h1>
          <span className={`ml-auto rounded-full border px-2.5 py-0.5 font-body text-xs font-semibold ${
            post.status === "published" ? "border-green-300 bg-green-50 text-green-800"
            : post.status === "archived" ? "border-slate-300 bg-slate-100 text-slate-600"
            : "border-amber-300 bg-amber-50 text-amber-800"
          }`}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>
        <BlogForm initialData={initialData} isEdit />
      </div>
    </main>
  );
}
