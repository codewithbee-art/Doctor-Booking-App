"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BlogFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_image_alt: string;
  category: string;
  tags: string;
  author_name: string;
  reviewed_by: string;
  status: "draft" | "published" | "archived";
  published_at: string;
  reading_time: string;
  medical_disclaimer: string;
  seo_title: string;
  seo_description: string;
  is_featured: boolean;
}

interface BlogFormProps {
  initialData?: BlogFormData;
  isEdit?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "health_tips", label: "Health Tips" },
  { value: "ayurveda", label: "Ayurveda" },
  { value: "medicine_info", label: "Medicine Info" },
  { value: "patient_stories", label: "Patient Stories" },
  { value: "medical_news", label: "Medical News" },
  { value: "clinic_news", label: "Clinic News" },
  { value: "specialist_advice", label: "Specialist Advice" },
];

function renderMarkdownPreview(md: string): string {
  let html = md
    // headings
    .replace(/^######\s+(.+)$/gm, "<h6 class='text-sm font-bold mt-4 mb-1'>$1</h6>")
    .replace(/^#####\s+(.+)$/gm, "<h5 class='text-sm font-bold mt-4 mb-1'>$1</h5>")
    .replace(/^####\s+(.+)$/gm, "<h4 class='text-base font-bold mt-4 mb-1'>$1</h4>")
    .replace(/^###\s+(.+)$/gm, "<h3 class='text-lg font-bold mt-5 mb-2'>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2 class='text-xl font-bold mt-6 mb-2'>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
    // blockquotes
    .replace(/^>\s+(.+)$/gm, "<blockquote class='border-l-4 border-primary/30 pl-4 italic text-text-secondary my-3'>$1</blockquote>")
    // bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' class='text-primary underline' target='_blank' rel='noopener noreferrer'>$1</a>")
    // unordered lists
    .replace(/^[-*]\s+(.+)$/gm, "<li class='ml-5 list-disc'>$1</li>")
    // ordered lists
    .replace(/^\d+\.\s+(.+)$/gm, "<li class='ml-5 list-decimal'>$1</li>")
    // paragraphs
    .replace(/\n\n/g, "</p><p class='my-2'>")
    .replace(/\n/g, "<br/>");

  html = "<p class='my-2'>" + html + "</p>";
  // clean up empty paragraphs
  html = html.replace(/<p class='my-2'>\s*<\/p>/g, "");

  return html;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BlogForm({ initialData, isEdit }: BlogFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "");
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.cover_image_alt || "");
  const [category, setCategory] = useState(initialData?.category || "general");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [authorName, setAuthorName] = useState(initialData?.author_name || "");
  const [reviewedBy, setReviewedBy] = useState(initialData?.reviewed_by || "");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(initialData?.status || "draft");
  const [publishedAt, setPublishedAt] = useState(initialData?.published_at || "");
  const [readingTime, setReadingTime] = useState(initialData?.reading_time || "");
  const [medicalDisclaimer, setMedicalDisclaimer] = useState(initialData?.medical_disclaimer || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugManual && !isEdit) {
      setSlug(slugify(title));
    }
  }, [title, slugManual, isEdit]);

  /* ---- Image upload ---- */
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/blog/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCoverImageUrl(data.url);
      if (!coverImageAlt) setCoverImageAlt(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }, [coverImageAlt]);

  /* ---- Save ---- */
  const handleSave = useCallback(async (overrideStatus?: "draft" | "published" | "archived") => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const finalStatus = overrideStatus || status;

    const payload = {
      ...(isEdit ? { id: initialData?.id } : {}),
      title,
      slug,
      excerpt,
      content,
      cover_image_url: coverImageUrl || null,
      cover_image_alt: coverImageAlt || null,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      author_name: authorName || null,
      reviewed_by: reviewedBy || null,
      status: finalStatus,
      published_at: publishedAt || null,
      reading_time: readingTime || null,
      medical_disclaimer: medicalDisclaimer || null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      is_featured: isFeatured,
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (isEdit) {
        setSuccess("Post updated successfully.");
      } else {
        setSuccess("Post created successfully. Redirecting...");
        setTimeout(() => {
          router.push(`/admin/blog/${data.post.id}/edit`);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post.");
    } finally {
      setSaving(false);
    }
  }, [title, slug, excerpt, content, coverImageUrl, coverImageAlt, category, tags, authorName, reviewedBy, status, publishedAt, readingTime, medicalDisclaimer, seoTitle, seoDescription, isFeatured, isEdit, initialData?.id, router]);

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 font-body text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Title + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="blog-title" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="blog-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Post title"
          />
        </div>
        <div>
          <label htmlFor="blog-slug" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            id="blog-slug"
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="post-slug"
          />
          <p className="mt-1 font-body text-xs text-text-secondary">
            {slugManual || isEdit ? "Manually edited." : "Auto-generated from title."} URL: /blog/{slug || "..."}
          </p>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="blog-excerpt" className="block font-body text-sm font-semibold text-text-primary mb-1">
          Excerpt
        </label>
        <textarea
          id="blog-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="Short summary for listing cards and SEO..."
        />
      </div>

      {/* Category + Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="blog-category" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Category
          </label>
          <select
            id="blog-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="blog-tags" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Tags
          </label>
          <input
            id="blog-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="tag1, tag2, tag3"
          />
          <p className="mt-1 font-body text-xs text-text-secondary">Comma-separated.</p>
        </div>
      </div>

      {/* Cover image */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="font-heading text-sm font-bold text-text-primary mb-3">Cover Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="blog-cover-url" className="block font-body text-xs font-semibold text-text-secondary mb-1">
              Image URL
            </label>
            <input
              id="blog-cover-url"
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 font-body text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                {uploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>
              <p className="mt-1 font-body text-xs text-text-secondary">JPEG, PNG, WebP, GIF. Max 2 MB.</p>
            </div>
          </div>
          <div>
            <label htmlFor="blog-cover-alt" className="block font-body text-xs font-semibold text-text-secondary mb-1">
              Alt Text
            </label>
            <input
              id="blog-cover-alt"
              type="text"
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the image..."
            />
            {coverImageUrl && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt={coverImageAlt || "Cover preview"}
                  className="h-32 w-full rounded-lg object-cover border border-border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Author + Reviewed By */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="blog-author" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Author Name <span className="font-normal text-text-secondary">(optional)</span>
          </label>
          <input
            id="blog-author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Dr. Name"
          />
        </div>
        <div>
          <label htmlFor="blog-reviewed" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Reviewed By <span className="font-normal text-text-secondary">(optional)</span>
          </label>
          <input
            id="blog-reviewed"
            type="text"
            value={reviewedBy}
            onChange={(e) => setReviewedBy(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Dr. Reviewer"
          />
        </div>
      </div>

      {/* Status + Published At + Reading Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="blog-status" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Status
          </label>
          <select
            id="blog-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label htmlFor="blog-published-at" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Published Date
          </label>
          <input
            id="blog-published-at"
            type="datetime-local"
            value={publishedAt ? publishedAt.slice(0, 16) : ""}
            onChange={(e) => setPublishedAt(e.target.value ? new Date(e.target.value).toISOString() : "")}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 font-body text-xs text-text-secondary">Auto-set when publishing if empty.</p>
        </div>
        <div>
          <label htmlFor="blog-reading-time" className="block font-body text-sm font-semibold text-text-primary mb-1">
            Reading Time <span className="font-normal text-text-secondary">(optional)</span>
          </label>
          <input
            id="blog-reading-time"
            type="text"
            value={readingTime}
            onChange={(e) => setReadingTime(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="5 min read"
          />
          <p className="mt-1 font-body text-xs text-text-secondary">Leave empty to auto-calculate later.</p>
        </div>
      </div>

      {/* Featured toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-full" />
        </label>
        <span className="font-body text-sm font-semibold text-text-primary">Featured Post</span>
        <span className="font-body text-xs text-text-secondary">(Only one post can be featured at a time)</span>
      </div>

      {/* Medical Disclaimer */}
      <div>
        <label htmlFor="blog-disclaimer" className="block font-body text-sm font-semibold text-text-primary mb-1">
          Medical Disclaimer <span className="font-normal text-text-secondary">(optional)</span>
        </label>
        <textarea
          id="blog-disclaimer"
          value={medicalDisclaimer}
          onChange={(e) => setMedicalDisclaimer(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="Leave empty for default disclaimer. Enter custom text to override."
        />
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="font-heading text-sm font-bold text-text-primary mb-3">SEO Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="blog-seo-title" className="block font-body text-xs font-semibold text-text-secondary mb-1">
              SEO Title
            </label>
            <input
              id="blog-seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Falls back to post title"
            />
          </div>
          <div>
            <label htmlFor="blog-seo-desc" className="block font-body text-xs font-semibold text-text-secondary mb-1">
              SEO Description
            </label>
            <input
              id="blog-seo-desc"
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Falls back to excerpt"
            />
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="blog-content" className="font-body text-sm font-semibold text-text-primary">
            Content <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-border bg-white px-3 py-1 font-body text-xs font-semibold text-text-secondary hover:bg-bg-light transition-colors"
          >
            {showPreview ? "Editor" : "Preview"}
          </button>
        </div>

        {!showPreview ? (
          <textarea
            id="blog-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full rounded-lg border border-border bg-white px-4 py-3 font-mono text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Write your blog post in Markdown..."
          />
        ) : (
          <div className="rounded-lg border border-border bg-white px-6 py-4 min-h-[300px] font-body text-sm text-text-primary prose-sm">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }} />
            ) : (
              <p className="text-text-secondary italic">Nothing to preview.</p>
            )}
          </div>
        )}
        <p className="mt-1 font-body text-xs text-text-secondary">
          Markdown supported: # headings, **bold**, *italic*, - lists, 1. numbered lists, [links](url), &gt; quotes
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={() => handleSave("draft")}
          disabled={saving || !title.trim() || !slug.trim()}
          className="rounded-lg border border-border bg-white px-5 py-2.5 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save as Draft"}
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving || !title.trim() || !slug.trim()}
          className="rounded-lg bg-accent px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : (isEdit && status === "published" ? "Update & Publish" : "Publish")}
        </button>
        {isEdit && status !== "archived" && (
          <button
            onClick={() => handleSave("archived")}
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 font-body text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Archive
          </button>
        )}
        <a
          href="/admin/blog"
          className="rounded-lg border border-border bg-white px-5 py-2.5 font-body text-sm font-semibold text-text-secondary hover:bg-bg-light transition-colors"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
