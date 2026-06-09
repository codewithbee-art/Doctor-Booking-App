import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Visiting Specialists",
  description:
    "Meet our visiting specialists and book consultations with experienced doctors across a range of specializations. View visit dates, locations, and consultation details.",
  path: "/specialists",
});

export default function SpecialistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
