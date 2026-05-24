"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard, { BlogCardPost } from "@/components/BlogCard";

export default function BlogPreview() {
  const [posts, setPosts] = useState<BlogCardPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/blog?homepage=true", { cache: "no-store" });
        const json = await res.json();
        if (res.ok) setPosts(json.posts ?? []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Health Tips &amp; Insights
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-white overflow-hidden">
                <div className="h-48 bg-bg-off" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 rounded bg-bg-off" />
                  <div className="h-5 w-3/4 rounded bg-bg-off" />
                  <div className="h-4 w-full rounded bg-bg-off" />
                  <div className="h-4 w-2/3 rounded bg-bg-off" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Health Tips &amp; Insights
          </h2>
          <div className="rounded-2xl border border-border bg-bg-light p-12 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-border" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
            </svg>
            <p className="font-body text-base text-text-secondary">Health articles coming soon. Check back for expert medical tips!</p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-block rounded-lg border-2 border-primary px-8 py-3 font-body text-base font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Visit Blog
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Health Tips &amp; Insights
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-block rounded-lg border-2 border-primary px-8 py-3 font-body text-base font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
