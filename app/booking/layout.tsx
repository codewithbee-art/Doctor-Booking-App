import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Book an Appointment",
  description:
    "Book an appointment with Dr. Bishnu Acharya. Choose your preferred date and time using the Nepali (BS) or English (AD) calendar.",
  path: "/booking",
});

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
