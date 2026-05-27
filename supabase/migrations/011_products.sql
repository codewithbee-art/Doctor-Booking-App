-- =====================================================================
-- Phase 12A: Products table for Medicine Shop
-- Run this migration in Supabase SQL Editor.
-- =====================================================================

-- Drop old placeholder shop tables if they exist.
-- Only safe before real shop/order data exists.
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.products;

-- Create stock_status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_status') THEN
    CREATE TYPE stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'hidden');
  END IF;
END$$;

-- Create products table
CREATE TABLE public.products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  short_description     text,
  description           text,
  category              text NOT NULL DEFAULT 'other',
  price                 numeric(10,2) NOT NULL DEFAULT 0,
  sale_price            numeric(10,2),
  image_url             text,
  image_alt             text,
  stock_quantity        integer NOT NULL DEFAULT 0,
  stock_status          stock_status NOT NULL DEFAULT 'in_stock',
  is_active             boolean NOT NULL DEFAULT true,
  is_featured           boolean NOT NULL DEFAULT false,
  requires_consultation boolean NOT NULL DEFAULT false,
  allow_delivery        boolean NOT NULL DEFAULT true,
  allow_pickup          boolean NOT NULL DEFAULT true,
  usage_instructions    text,
  ingredients           text,
  warnings              text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON public.products (stock_status);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_products_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_active_products" ON public.products;
CREATE POLICY "anon_read_active_products"
  ON public.products
  FOR SELECT
  TO anon
  USING (is_active = true AND stock_status != 'hidden');

DROP POLICY IF EXISTS "authenticated_read_active_products" ON public.products;
CREATE POLICY "authenticated_read_active_products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (is_active = true AND stock_status != 'hidden');

DROP POLICY IF EXISTS "service_role_full_access" ON public.products;
CREATE POLICY "service_role_full_access"
  ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================================
-- Explicit GRANT statements for Supabase Data API
-- =====================================================================
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO service_role;