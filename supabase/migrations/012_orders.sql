-- ================================================================
-- Phase 12B-1: Orders and Order Items
-- ================================================================

-- Enum: order_fulfillment_method
DO $$
BEGIN
  CREATE TYPE order_fulfillment_method AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum: shop_order_status
DO $$
BEGIN
  CREATE TYPE shop_order_status AS ENUM (
    'pending',
    'needs_review',
    'confirmed',
    'ready_for_pickup',
    'out_for_delivery',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum: shop_payment_preference
DO $$
BEGIN
  CREATE TYPE shop_payment_preference AS ENUM (
    'pay_later',
    'pay_on_pickup',
    'pay_on_delivery',
    'pay_now_later_phase'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum: shop_payment_status
DO $$
BEGIN
  CREATE TYPE shop_payment_status AS ENUM (
    'unpaid',
    'pending',
    'paid',
    'failed',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- Orders table
-- ================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                     uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number           text NOT NULL UNIQUE,
  customer_name          text NOT NULL,
  customer_phone         text NOT NULL,
  customer_email         text,
  fulfillment_method     order_fulfillment_method NOT NULL DEFAULT 'pickup',
  delivery_address       text,
  delivery_notes         text,
  order_status           shop_order_status NOT NULL DEFAULT 'pending',
  payment_preference     shop_payment_preference NOT NULL DEFAULT 'pay_later',
  payment_status         shop_payment_status NOT NULL DEFAULT 'unpaid',
  subtotal               numeric(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  delivery_fee           numeric(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total                  numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  has_consultation_items boolean NOT NULL DEFAULT false,
  notes                  text,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ================================================================
-- Order items table
-- ================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id                             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id                       uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id                     uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot          text NOT NULL,
  quantity                       integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price                     numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal                       numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  requires_consultation_snapshot boolean NOT NULL DEFAULT false,
  allow_delivery_snapshot        boolean NOT NULL DEFAULT true,
  allow_pickup_snapshot          boolean NOT NULL DEFAULT true,
  created_at                     timestamptz DEFAULT now()
);

-- ================================================================
-- Indexes
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ================================================================
-- Updated_at trigger
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();

-- ================================================================
-- RLS
-- ================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_manage_orders" ON public.orders;
CREATE POLICY "service_role_manage_orders"
  ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_manage_order_items" ON public.order_items;
CREATE POLICY "service_role_manage_order_items"
  ON public.order_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- Explicit GRANT statements for Supabase Data API
-- ================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO service_role;

REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE ALL ON public.orders FROM authenticated;
REVOKE ALL ON public.order_items FROM authenticated;