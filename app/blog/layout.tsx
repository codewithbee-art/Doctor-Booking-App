import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Health Articles",
  description:
    "Expert health tips, Ayurvedic guidance, and wellness articles from Dr. Bishnu Acharya's medical practice. Stay informed about your health.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
