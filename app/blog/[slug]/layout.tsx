import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildMetadata, DEFAULT_DESCRIPTION } from "@/lib/seo";

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
    return buildMetadata({
      title: "Article Not Found",
      description: "The article you are looking for could not be found.",
      path: `/blog/${slug}`,
    });
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || DEFAULT_DESCRIPTION;

  return buildMetadata({
    title,
    description,
    image: post.cover_image_url || null,
    path: `/blog/${slug}`,
    type: "article",
  });
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
