import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import PublicShell from "@/components/PublicShell";
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Dr. Bishnu Acharya",
    "Ayurvedic doctor",
    "doctor booking",
    "specialist booking",
    "private counselling",
    "medicine shop",
    "health articles",
    "Nepal",
    "Kathmandu",
    "family care",
  ],
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <PublicShell>{children}</PublicShell>
        </CartProvider>
      </body>
    </html>
  );
}
