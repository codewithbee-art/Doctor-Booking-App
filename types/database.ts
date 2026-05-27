// =============================================================
// TypeScript types matching the Supabase database schema.
// Keep this file in sync with /supabase/schema.sql.
// =============================================================

// ----- visiting_specialists ----------------------------------------
export type ConsultationMode = "in_person" | "online" | "both";
export type SpecialistGender = "male" | "female" | "other";

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
  bio: string | null;
  qualifications: string | null;
  experience: string | null;
  work_history: string | null;
  treatment_areas: string | null;
  profile_image_url: string | null;
  visit_location: string | null;
  public_note: string | null;
  preparation_note: string | null;
  languages: string | null;
  gender: SpecialistGender | null;
  license_number: string | null;
  consultation_mode: ConsultationMode | null;
  display_order: number;
  slot_duration_minutes: number;
  max_patients: number | null;
  created_at: string;
  updated_at: string;
}

// ----- staff_profiles ---------------------------------------------
export type StaffRole = "owner" | "doctor" | "receptionist" | "inventory_manager" | "content_editor";

export interface StaffProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----- patients ---------------------------------------------------
export type PatientIdentityStatus = "normal" | "possible_duplicate" | "shared_contact" | "needs_review";

export interface Patient {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  date_of_birth: string | null; // ISO date string (YYYY-MM-DD)
  notes: string | null;
  identity_notes: string | null;
  identity_status: PatientIdentityStatus;
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
  doctor_id: string | null;
  doctor_name_snapshot: string | null;
  created_at: string;
  updated_at: string;
}

// ----- bookings ----------------------------------------------------
export type BookingType = "regular" | "specialist" | "counselling";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type CounsellingConsultationMode = "phone" | "video" | "in_person";
export type CounsellingPrivacyPreference = "private" | "normal";
export type CounsellingPaymentPreference = "pay_now" | "pay_later" | "pay_on_visit";
export type CounsellingPaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

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
  cancellation_reason: string | null;
  cancelled_at: string | null;
  consultation_mode: CounsellingConsultationMode | null;
  privacy_preference: CounsellingPrivacyPreference | null;
  payment_preference: CounsellingPaymentPreference | null;
  payment_status: CounsellingPaymentStatus | null;
  counselling_reason: string | null;
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
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "hidden";

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  image_alt: string | null;
  stock_quantity: number;
  stock_status: StockStatus;
  is_active: boolean;
  is_featured: boolean;
  requires_consultation: boolean;
  allow_delivery: boolean;
  allow_pickup: boolean;
  usage_instructions: string | null;
  ingredients: string | null;
  warnings: string | null;
  created_at: string;
  updated_at: string;
}

// ----- blog_posts --------------------------------------------------
export type BlogStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  tags: string[];
  author_name: string | null;
  reviewed_by: string | null;
  status: BlogStatus;
  published_at: string | null;
  reading_time: string | null;
  medical_disclaimer: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
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
      staff_profiles: {
        Row: StaffProfile;
        Insert: Omit<StaffProfile, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StaffProfile, "id" | "created_at" | "updated_at">>;
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
