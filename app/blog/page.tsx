"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BlogCard, { BlogCardPost } from "@/components/BlogCard";
import PageHero from "@/components/PageHero";

// Change this path to use a page-specific hero image when available
const BLOG_HERO_IMAGE = "/Images/PageHero/blog1.jpeg";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "health_tips", label: "Health Tips" },
  { value: "medicine_info", label: "Medicine Info" },
  { value: "patient_stories", label: "Patient Stories" },
  { value: "medical_news", label: "Medical News" },
  { value: "general", label: "General" },
];

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogCardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      const res = await fetch(`/api/blog?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load posts");
      setPosts(json.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      {/* Hero */}
      <PageHero
        title="Health Tips & Insights"
        subtitle="Expert health advice, medical tips, and wellness articles from our experienced medical team."
        breadcrumb={{ label: "Back to Home", href: "/" }}
        backgroundImage={BLOG_HERO_IMAGE}
      />

      {/* Filters */}
      <section className="border-b border-border bg-white px-4 py-5 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search blog posts"
            />
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={[
                  "rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  category === cat.value
                    ? "bg-primary text-white"
                    : "bg-bg-light text-text-secondary hover:bg-primary/10 hover:text-primary",
                ].join(" ")}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-bg-light px-4 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="ml-3 font-body text-sm text-text-secondary">Loading articles…</span>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-8 text-center">
              <p className="font-body text-sm font-semibold text-danger">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="py-20 text-center">
              <svg className="mx-auto mb-4 h-16 w-16 text-border" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
              </svg>
              <p className="font-heading text-xl font-bold text-text-primary">No articles found</p>
              <p className="mt-2 font-body text-sm text-text-secondary">
                {debouncedSearch || category
                  ? "Try adjusting your search or category filter."
                  : "Check back soon for health tips and insights."}
              </p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <>
              <p className="mb-6 font-body text-sm text-text-secondary">
                {posts.length} article{posts.length !== 1 ? "s" : ""}
                {category && ` in ${CATEGORIES.find((c) => c.value === category)?.label}`}
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Need Medical Advice?
          </h2>
          <p className="mt-3 font-body text-base text-text-secondary">
            Book an appointment with our experienced medical team for personalized healthcare.
          </p>
          <Link
            href="/booking"
            className="mt-6 inline-block rounded-lg bg-accent px-8 py-3 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
