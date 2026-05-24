import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  const { data: post } = await supabaseAdmin
    .from("blog_posts")
    .select("title, excerpt, seo_title, seo_description, cover_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return {
      title: "Article Not Found — Doctor Booking",
    };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || "";

  return {
    title: `${title} — Doctor Booking`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : {}),
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
