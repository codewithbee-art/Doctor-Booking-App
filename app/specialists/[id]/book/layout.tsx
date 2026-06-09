import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book Specialist Appointment",
  description:
    "Book your appointment with a visiting specialist. Choose an available time slot for the specialist's visit date.",
  openGraph: {
    title: `Book Specialist Appointment | ${SITE_NAME}`,
    description:
      "Book your appointment with a visiting specialist at Dr. Bishnu Acharya's clinic.",
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function SpecialistBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
