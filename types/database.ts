// =============================================================
// TypeScript types matching the Supabase database schema.
// Keep this file in sync with /supabase/schema.sql.
// =============================================================

// ----- visiting_specialists ----------------------------------------
export interface VisitingSpecialist {
  id: string;
  specialist_name: string;
  specialization: string;
  treatment_type: string;
  visit_date_bs: string;
  visit_date_ad: string; // ISO date string (YYYY-MM-DD)
  available_from: string; // HH:MM:SS
  available_to: string; // HH:MM:SS
  consultation_fee: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----- patients ---------------------------------------------------
export interface Patient {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  date_of_birth: string | null; // ISO date string (YYYY-MM-DD)
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ----- patient_visits ---------------------------------------------
export interface PatientVisit {
  id: string;
  patient_id: string;
  booking_id: string | null;
  visit_date_ad: string; // ISO date string
  visit_date_bs: string;
  chief_complaint: string | null;
  visit_notes: string | null;
  prescribed_medicines: string | null;
  follow_up_instructions: string | null;
  condition_summary: string | null;
  created_at: string;
  updated_at: string;
}

// ----- bookings ----------------------------------------------------
export type BookingType = "regular" | "specialist";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  patient_id: string | null; // linked after admin review; null for public bookings
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  problem: string;
  appointment_date_bs: string;
  appointment_date_ad: string; // ISO date string
  appointment_time: string; // HH:MM:SS
  booking_type: BookingType;
  specialist_id: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

// ----- available_slots ---------------------------------------------
export interface AvailableSlot {
  id: string;
  slot_date_ad: string; // ISO date string
  slot_date_bs: string;
  slot_time: string; // HH:MM:SS
  is_booked: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
}

// ----- products ----------------------------------------------------
export type ProductCategory =
  | "pain_relief"
  | "antibiotics"
  | "vitamins"
  | "first_aid"
  | "supplements"
  | "other";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  requires_prescription: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// ----- orders ------------------------------------------------------
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type OrderStatus =
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
}

// ----- order_items -------------------------------------------------
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
}

// ----- blog_posts --------------------------------------------------
export type BlogCategory =
  | "health_tips"
  | "medicine_info"
  | "patient_stories"
  | "medical_news"
  | "general";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  category: BlogCategory;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ----- Supabase Database type map ----------------------------------
// Used with createClient<Database> for type-safe queries.
export interface Database {
  public: {
    Tables: {
      visiting_specialists: {
        Row: VisitingSpecialist;
        Insert: Omit<VisitingSpecialist, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<VisitingSpecialist, "id" | "created_at" | "updated_at">>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Patient, "id" | "created_at" | "updated_at">>;
      };
      patient_visits: {
        Row: PatientVisit;
        Insert: Omit<PatientVisit, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PatientVisit, "id" | "created_at" | "updated_at">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Booking, "id" | "created_at" | "updated_at">>;
      };
      available_slots: {
        Row: AvailableSlot;
        Insert: Omit<AvailableSlot, "id"> & { id?: string };
        Update: Partial<Omit<AvailableSlot, "id">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id"> & { id?: string };
        Update: Partial<Omit<OrderItem, "id">>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
