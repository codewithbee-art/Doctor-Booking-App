import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildMetadata } from "@/lib/seo";

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("name, short_description, description, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .neq("stock_status", "hidden")
    .single();

  if (!product) {
    return buildMetadata({
      title: "Product Not Found",
      description: "The product you are looking for is no longer available.",
      path: `/shop/${slug}`,
    });
  }

  const description =
    product.short_description ||
    (product.description ? product.description.slice(0, 160) : "") ||
    `${product.name} — available from Dr. Bishnu Acharya's medicine shop.`;

  return buildMetadata({
    title: product.name,
    description,
    image: product.image_url || null,
    path: `/shop/${slug}`,
  });
}

export default function ProductLayout({ children }: Props) {
  return children;
}
