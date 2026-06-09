import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Medicine Shop",
  description:
    "Browse Ayurvedic medicines, supplements, and health products from Dr. Bishnu Acharya's practice. Order online for clinic pickup or home delivery.",
  path: "/shop",
});

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
