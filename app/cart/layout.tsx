import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Your Cart",
  description:
    "Review the medicines and health products in your cart and place your order for clinic pickup or home delivery.",
  path: "/cart",
});

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
