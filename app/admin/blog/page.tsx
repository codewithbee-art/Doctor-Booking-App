"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
import { adminFetch } from "@/lib/adminFetch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  author_name: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  reading_time: string | null;
  is_featured: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

type FilterTab = "all" | "draft" | "published" | "archived";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  draft: "border-amber-300 bg-amber-50 text-amber-800",
  published: "border-green-300 bg-green-50 text-green-800",
  archived: "border-slate-300 bg-slate-100 text-slate-600",
};

const CATEGORY_LABELS: Record<string, string> = {
  health_tips: "Health Tips",
  ayurveda: "Ayurveda",
  medicine_info: "Medicine Info",
  patient_stories: "Patient Stories",
  medical_news: "Medical News",
  clinic_news: "Clinic News",
  specialist_advice: "Specialist Advice",
  general: "General",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminBlogPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: staffProfile, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  /* ---- Auth ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch posts ---- */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/blog");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking && !inactive) fetchPosts();
  }, [checking, inactive, fetchPosts]);

  /* ---- Filter ---- */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q) && !(p.author_name?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [posts, filter, search]);

  const counts = useMemo(() => ({
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    published: posts.filter((p) => p.status === "published").length,
    archived: posts.filter((p) => p.status === "archived").length,
  }), [posts]);

  /* ---- Quick actions ---- */
  const updateStatus = async (id: string, status: string) => {
    setActionMsg(null);
    try {
      const res = await adminFetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg(`Post ${status === "published" ? "published" : status === "archived" ? "archived" : "set to draft"}.`);
      fetchPosts();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Delete draft "${title}"? This cannot be undone.`)) return;
    setActionMsg(null);
    try {
      const res = await adminFetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg("Draft deleted.");
      fetchPosts();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  /* ---- Loading / inactive gates ---- */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (inactive) return <AdminInactive />;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Drafts" },
    { key: "published", label: "Published" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <>
      <AdminPageHeader title="Blog Management" description="Create, edit, and manage blog posts.">
        <a
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Post
        </a>
      </AdminPageHeader>

      <div className="mx-auto max-w-6xl">

        {/* Action message */}
        {actionMsg && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 font-body text-sm text-primary">
            {actionMsg}
          </div>
        )}

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-body text-sm font-semibold transition-colors ${
                  filter === t.key
                    ? "bg-primary text-white"
                    : "bg-white text-text-secondary hover:bg-bg-light border border-border"
                }`}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
          <div className="flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Search title, category, author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Loading / error / empty */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-3 font-body text-sm text-text-secondary">Loading posts...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-5 py-4 text-center">
            <p className="font-body text-sm text-danger">{error}</p>
            <button onClick={fetchPosts} className="mt-2 text-sm font-semibold text-primary hover:underline">Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-body text-base text-text-secondary">
              {posts.length === 0 ? "No blog posts yet. Create your first post!" : "No posts match your filters."}
            </p>
          </div>
        )}

        {/* Posts list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm hover:border-primary/30 transition-colors"
              >
                {/* Cover thumbnail */}
                <div className="flex-shrink-0">
                  {p.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="h-16 w-24 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="h-16 w-24 rounded-lg bg-bg-light border border-border flex items-center justify-center">
                      <svg className="h-6 w-6 text-text-secondary/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading text-base font-bold text-text-primary truncate">{p.title}</h3>
                    {p.is_featured && (
                      <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 font-body text-xs font-semibold text-amber-800">Featured</span>
                    )}
                    <span className={`rounded-full border px-2 py-0.5 font-body text-xs font-semibold ${STATUS_STYLES[p.status] || ""}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-body text-xs text-text-secondary">
                    <span className="rounded bg-bg-light px-1.5 py-0.5 font-medium">{CATEGORY_LABELS[p.category] || p.category}</span>
                    {p.author_name && <span>by {p.author_name}</span>}
                    {p.published_at && <span>Published {formatDate(p.published_at)}</span>}
                    {!p.published_at && <span>Updated {formatDate(p.updated_at)}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/admin/blog/${p.id}/edit`}
                    className="rounded-lg border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors"
                  >
                    Edit
                  </a>
                  {p.status === "draft" && (
                    <>
                      <button
                        onClick={() => updateStatus(p.id, "published")}
                        className="rounded-lg bg-accent px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => deletePost(p.id, p.title)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-body text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {p.status === "published" && (
                    <button
                      onClick={() => updateStatus(p.id, "archived")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  {p.status === "archived" && (
                    <>
                      <button
                        onClick={() => updateStatus(p.id, "draft")}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 font-body text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        To Draft
                      </button>
                      <button
                        onClick={() => updateStatus(p.id, "published")}
                        className="rounded-lg bg-accent px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
                      >
                        Republish
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staff info */}
        {staffProfile && (
          <p className="mt-8 text-center font-body text-xs text-text-secondary">
            Logged in as {staffProfile.full_name} ({staffProfile.role})
          </p>
        )}
      </div>
    </>
  );
}
