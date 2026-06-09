import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/*  Site-wide branding + SEO constants                                 */
/* ------------------------------------------------------------------ */

export const SITE_NAME = "Dr. Bishnu Acharya";
export const SITE_TAGLINE = "Ayurvedic General Physician & Family Care";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const DEFAULT_DESCRIPTION =
  "Dr. Bishnu Acharya — Ayurvedic General Physician & Family Care. Book doctor appointments and specialist consultations, request private counselling, order medicine, and read trusted health articles.";

/** Default social-share image (local, reliable). */
export const DEFAULT_OG_IMAGE = "/Images/HeroImage.jpeg";

/* ------------------------------------------------------------------ */
/*  Metadata builder                                                   */
/* ------------------------------------------------------------------ */

interface BuildMetadataOptions {
  title: string;
  description?: string;
  /** Absolute or root-relative image path. Falls back to default OG image. */
  image?: string | null;
  /** Path beginning with "/" for canonical URL. */
  path?: string;
  /** When true, the page title is used as-is (no template suffix). */
  absoluteTitle?: boolean;
  /** OpenGraph type. Defaults to "website". */
  type?: "website" | "article";
}

/**
 * Build a consistent Metadata object for a page, including OpenGraph and
 * Twitter card data. Safely falls back to the default share image.
 */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  path,
  absoluteTitle = false,
  type = "website",
}: BuildMetadataOptions): Metadata {
  const ogImage = image && image.trim().length > 0 ? image : DEFAULT_OG_IMAGE;
  const canonical = path ? `${SITE_URL}${path}` : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      type,
      siteName: SITE_NAME,
      ...(canonical ? { url: canonical } : {}),
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
