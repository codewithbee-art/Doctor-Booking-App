"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
import BlogForm from "../../BlogForm";
import { adminFetch } from "@/lib/adminFetch";

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
      const res = await adminFetch(`/api/admin/blog/${postId}`);
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
    <>
      <AdminPageHeader title="Edit Post">
        <span className={`rounded-full border px-2.5 py-0.5 font-body text-xs font-semibold ${
          post.status === "published" ? "border-green-300 bg-green-50 text-green-800"
          : post.status === "archived" ? "border-slate-300 bg-slate-100 text-slate-600"
          : "border-amber-300 bg-amber-50 text-amber-800"
        }`}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </AdminPageHeader>
      <div className="mx-auto max-w-4xl">
        <BlogForm initialData={initialData} isEdit />
      </div>
    </>
  );
}
