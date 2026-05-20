-- =====================================================================
-- Phase 10A: Blog Posts table
-- Run this migration in Supabase SQL Editor.
-- =====================================================================

-- Create blog post status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blog_status') THEN
    CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END$$;

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  excerpt       text,
  content       text NOT NULL DEFAULT '',
  cover_image_url text,
  cover_image_alt text,
  category      text NOT NULL DEFAULT 'general',
  tags          text[] DEFAULT '{}',
  author_name   text,
  reviewed_by   text,
  status        blog_status NOT NULL DEFAULT 'draft',
  published_at  timestamptz,
  reading_time  text,
  medical_disclaimer text,
  seo_title     text,
  seo_description text,
  is_featured   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);

-- Index on published_at for ordering
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC NULLS LAST);

-- Index on is_featured for quick featured lookup
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts (is_featured) WHERE is_featured = true;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- RLS: disable for now (admin-only via service role key)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
