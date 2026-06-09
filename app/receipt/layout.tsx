import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Receipt",
  description:
    "View and print your order or booking receipt, including reference number and payment instructions.",
  // Receipts are private to the customer — keep them out of search indexes.
  robots: { index: false, follow: false },
  openGraph: {
    title: `Receipt | ${SITE_NAME}`,
    description: "View and print your order or booking receipt.",
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function ReceiptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
