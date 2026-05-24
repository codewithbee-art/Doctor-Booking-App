"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import type { BlogPost } from "@/types/database";
import BlogCard, { BlogCardPost } from "@/components/BlogCard";

const DEFAULT_DISCLAIMER =
  "The information provided in this article is for general informational purposes only and should not be considered as medical advice. Always consult with a qualified healthcare professional before making any medical decisions.";

/* ------------------------------------------------------------------ */
/*  Markdown renderer (lightweight, no external dependency)             */
/* ------------------------------------------------------------------ */
function renderMarkdown(md: string): string {
  let html = md
    .replace(/^######\s+(.+)$/gm, '<h6 class="text-base font-bold mt-6 mb-2 text-text-primary">$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-bold mt-6 mb-2 text-text-primary">$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold mt-6 mb-2 text-text-primary">$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-text-primary">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-text-primary">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-4 text-text-primary">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline underline-offset-2 hover:text-secondary transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 py-1 my-4 text-text-secondary italic">$1</blockquote>');

  const lines = html.split("\n");
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);

    if (ulMatch) {
      if (!inUl) { result.push('<ul class="list-disc pl-6 my-4 space-y-1">'); inUl = true; }
      result.push(`<li class="font-body text-base text-text-primary leading-relaxed">${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inOl) { result.push('<ol class="list-decimal pl-6 my-4 space-y-1">'); inOl = true; }
      result.push(`<li class="font-body text-base text-text-primary leading-relaxed">${olMatch[1]}</li>`);
    } else {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("<")) {
        result.push(`<p class="font-body text-base text-text-primary leading-relaxed my-3">${trimmed}</p>`);
      } else {
        result.push(line);
      }
    }
  }
  if (inUl) result.push("</ul>");
  if (inOl) result.push("</ol>");

  return result.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCategory(cat: string): string {
  return cat.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/* ------------------------------------------------------------------ */
/*  Cover Image with fallback (uses <img> to support any external URL) */
/* ------------------------------------------------------------------ */
function CoverImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div className="mb-8 w-full overflow-hidden rounded-2xl bg-bg-off">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setErr(true)}
        className="h-64 w-full object-cover sm:h-80 md:h-96"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Share Buttons                                                       */
/* ------------------------------------------------------------------ */
function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback */ }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-body text-sm font-semibold text-text-secondary">Share:</span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 font-body text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 font-body text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </a>
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className={[
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          copied
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-border bg-bg-light text-text-secondary hover:bg-primary/10 hover:text-primary",
        ].join(" ")}
      >
        {copied ? (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.07" />
            </svg>
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar / Recent Posts Card                                         */
/* ------------------------------------------------------------------ */
function SidebarPostCard({ post }: { post: BlogCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-3 rounded-lg p-2 hover:bg-bg-light transition-colors"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-bg-off">
        {post.cover_image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt || post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-5 w-5 text-border" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-body text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        {post.published_at && (
          <p className="mt-1 font-body text-xs text-text-secondary">
            {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */
export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogCardPost[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogCardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFoundState(true);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPost(json.post);
      setRecentPosts(json.recentPosts ?? []);
      setRelatedPosts(json.relatedPosts ?? []);
    } catch {
      setNotFoundState(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (notFoundState) {
    notFound();
  }

  if (loading || !post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="ml-3 font-body text-sm text-text-secondary">Loading article…</span>
      </div>
    );
  }

  const disclaimer = post.medical_disclaimer || DEFAULT_DISCLAIMER;
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];

  return (
    <>
      {/* Main Content + Sidebar */}
      <section className="bg-white px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl lg:flex lg:gap-10">
          {/* Article */}
          <article className="mx-auto max-w-3xl flex-1 lg:mx-0">
            {/* Back to Blog button */}
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Blog
            </Link>

            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 font-body text-xs text-text-secondary" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-text-primary truncate">{post.title}</span>
            </nav>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                {formatCategory(post.category)}
              </span>
              {post.is_featured && (
                <span className="rounded-full bg-amber-100 px-3 py-1 font-body text-xs font-semibold text-amber-700">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-sm text-text-secondary">
              {post.author_name && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {post.author_name}
                </span>
              )}
              {post.reviewed_by && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reviewed by {post.reviewed_by}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                  {formatDate(post.published_at)}
                </span>
              )}
              {post.reading_time && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.reading_time}
                </span>
              )}
            </div>

            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="mt-8">
                <CoverImage src={post.cover_image_url} alt={post.cover_image_alt || post.title} />
              </div>
            )}

            {/* Rendered content */}
            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="font-body text-sm font-semibold text-text-secondary">Tags:</span>
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-bg-light px-3 py-1 font-body text-xs text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <h3 className="font-heading text-sm font-bold text-amber-800">Medical Disclaimer</h3>
                  <p className="mt-1 font-body text-sm text-amber-700 leading-relaxed">{disclaimer}</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 rounded-xl border border-border bg-bg-light p-5">
              <ShareButtons title={post.title} url={pageUrl} />
            </div>

            {/* Booking CTA */}
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <h3 className="font-heading text-xl font-bold text-text-primary">
                Need Professional Medical Advice?
              </h3>
              <p className="mt-2 font-body text-sm text-text-secondary">
                Our experienced medical team is here to help. Book an appointment today.
              </p>
              <Link
                href="/booking"
                className="mt-4 inline-block rounded-lg bg-accent px-8 py-3 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Book Appointment
              </Link>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">Related Articles</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <BlogCard key={rp.id} post={rp} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts (mobile) */}
            {recentPosts.length > 0 && (
              <div className="mt-12 lg:hidden">
                <h2 className="mb-4 font-heading text-xl font-bold text-text-primary">Recent Articles</h2>
                <div className="space-y-2">
                  {recentPosts.map((rp) => (
                    <SidebarPostCard key={rp.id} post={rp} />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar (desktop) */}
          {recentPosts.length > 0 && (
            <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-24">
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <h3 className="mb-4 font-heading text-lg font-bold text-text-primary">Recent Articles</h3>
                  <div className="space-y-2">
                    {recentPosts.map((rp) => (
                      <SidebarPostCard key={rp.id} post={rp} />
                    ))}
                  </div>
                  <Link
                    href="/blog"
                    className="mt-4 block text-center font-body text-sm font-semibold text-primary hover:text-secondary transition-colors"
                  >
                    View All Articles →
                  </Link>
                </div>

                {/* Sidebar CTA */}
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                  <h4 className="font-heading text-base font-bold text-text-primary">Book an Appointment</h4>
                  <p className="mt-1 font-body text-xs text-text-secondary">Get personalized medical care</p>
                  <Link
                    href="/booking"
                    className="mt-3 inline-block rounded-lg bg-accent px-6 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
