import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Blog — Doctor Booking",
  description:
    "Expert health tips, medical advice, and wellness articles from our experienced medical team. Stay informed about your health.",
  openGraph: {
    title: "Health Blog — Doctor Booking",
    description:
      "Expert health tips, medical advice, and wellness articles from our experienced medical team.",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
