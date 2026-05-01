-- =============================================================
-- Nepali Doctor Website — Supabase Database Schema
-- =============================================================
-- Run this file in the Supabase SQL Editor in one go.
-- Tables are ordered so foreign key references never point
-- to a table that has not yet been created.
-- =============================================================

-- ----- Helper: updated_at trigger function --------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- 1. visiting_specialists  (referenced by bookings)
-- =============================================================
create table visiting_specialists (
  id uuid default gen_random_uuid() primary key,
  specialist_name text not null,
  specialization text not null,
  treatment_type text not null,
  visit_date_bs text not null,
  visit_date_ad date not null,
  available_from time not null,
  available_to time not null,
  consultation_fee numeric(10,2) check (consultation_fee >= 0),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index: look up specialists by visit date
create index idx_specialists_visit_date on visiting_specialists (visit_date_ad);

-- Trigger: auto-update updated_at
create trigger trg_visiting_specialists_updated_at
  before update on visiting_specialists
  for each row execute function update_updated_at();

-- =============================================================
-- 2. bookings
-- =============================================================
create table bookings (
  id uuid default gen_random_uuid() primary key,
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  problem text not null,
  appointment_date_bs text not null,
  appointment_date_ad date not null,
  appointment_time time not null,
  booking_type text default 'regular'
    check (booking_type in ('regular', 'specialist')),
  specialist_id uuid references visiting_specialists(id) on delete set null,
  status text default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index: look up bookings by date and status quickly
create index idx_bookings_date on bookings (appointment_date_ad);
create index idx_bookings_status on bookings (status);

-- Trigger: auto-update updated_at
create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- =============================================================
-- 3. available_slots
-- =============================================================
create table available_slots (
  id uuid default gen_random_uuid() primary key,
  slot_date_ad date not null,
  slot_date_bs text not null,
  slot_time time not null,
  is_booked boolean default false,
  unique (slot_date_ad, slot_time)
);

-- Index: look up slots by date
create index idx_slots_date on available_slots (slot_date_ad);

-- =============================================================
-- 4. products  (Medicine Shop)
-- =============================================================
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null
    check (category in ('pain_relief', 'antibiotics', 'vitamins', 'first_aid', 'supplements', 'other')),
  price numeric(10,2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  requires_prescription boolean default false,
  is_available boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index: filter products by category
create index idx_products_category on products (category);

-- Trigger: auto-update updated_at
create trigger trg_products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- =============================================================
-- 5. orders
-- =============================================================
create table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  customer_address text not null,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  payment_status text default 'pending'
    check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  order_status text default 'processing'
    check (order_status in ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes: look up orders by payment and order status
create index idx_orders_payment_status on orders (payment_status);
create index idx_orders_order_status on orders (order_status);

-- Trigger: auto-update updated_at
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- =============================================================
-- 6. order_items  (references orders + products)
-- =============================================================
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(10,2) not null check (price_at_purchase >= 0)
);

-- =============================================================
-- 7. blog_posts
-- =============================================================
create table blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  featured_image_url text,
  author_name text not null,
  category text not null
    check (category in ('health_tips', 'medicine_info', 'patient_stories', 'medical_news', 'general')),
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index: look up blog posts by slug
create index idx_blog_slug on blog_posts (slug);

-- Trigger: auto-update updated_at
create trigger trg_blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();
