"use client";

import { useState } from "react";
import Link from "next/link";

export interface BlogCardPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  author_name: string | null;
  published_at: string | null;
  reading_time: string | null;
  is_featured: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function BlogCard({ post }: { post: BlogCardPost }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-bg-off">
        {post.cover_image_url && !imgErr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt || post.title}
            onError={() => setImgErr(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 text-border"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z"
              />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-primary/90 px-2.5 py-0.5 font-body text-xs font-semibold text-white backdrop-blur-sm">
            {formatCategory(post.category)}
          </span>
          {post.is_featured && (
            <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 font-body text-xs font-semibold text-white backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 font-heading text-lg font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mb-4 flex-1 font-body text-sm text-text-secondary line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            {post.author_name && (
              <span className="font-body text-xs text-text-secondary truncate">
                {post.author_name}
              </span>
            )}
            {post.reading_time && (
              <span className="font-body text-xs text-text-secondary whitespace-nowrap">
                {post.reading_time}
              </span>
            )}
          </div>
          {post.published_at && (
            <span className="font-body text-xs text-text-secondary whitespace-nowrap">
              {formatDate(post.published_at)}
            </span>
          )}
        </div>
        <span className="mt-3 inline-flex items-center gap-1 font-body text-sm font-semibold text-primary group-hover:gap-2 transition-all">
          Read More
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
