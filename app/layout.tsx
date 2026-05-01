import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doctor Booking — Nepali Medical Practice",
  description:
    "Professional medical care with advanced booking system. Book appointments, order medicine, and read health tips from our experienced doctors.",
  keywords: [
    "doctor",
    "booking",
    "Nepal",
    "medical",
    "appointment",
    "health",
  ],
  openGraph: {
    title: "Doctor Booking — Nepali Medical Practice",
    description:
      "Professional medical care with advanced booking system. Book appointments, order medicine, and read health tips.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
