This is the full master idea for reference only. Do not build everything at once. Follow PROJECT_BRIEF.md and TASKS.md phase by phase.

Nepali Doctor Website + Advanced Booking System — Complete Build Prompt to build the full project from scratch.

MASTER PROMPT
Build me a complete, production-ready doctor website for a Nepali medical practice with advanced features: BS/AD dual calendar booking system, email notifications, specialist visitor scheduling, medicine e-commerce shop, and blog. The project must be fully deployable on Vercel with zero manual backend configuration. This should be one of the best-designed medical websites in the world — professional, human-friendly, with exceptional UI/UX.

TECH STACK

Framework: Next.js 14 (App Router) with TypeScript
Styling: Tailwind CSS
Database: Supabase (PostgreSQL) — use @supabase/supabase-js
Auth: Supabase Auth (email/password for admin only)
Email: Resend API (for booking confirmations and notifications to doctor)
Calendar: Custom BS/AD converter library (create from scratch or use nepali-date-converter)
Payments: Stripe (for medicine shop checkout)
Deployment: Vercel-ready (use environment variables)
Fonts: Google Fonts — use a refined medical/professional pairing like Playfair Display for headings and Source Sans 3 for body text


PROJECT STRUCTURE
Create the following file structure:
/app
  /page.tsx                          ← Public homepage
  /booking/page.tsx                  ← Patient booking page (BS/AD calendar)
  /shop/page.tsx                     ← Medicine shop listing
  /shop/[productId]/page.tsx         ← Individual product page
  /cart/page.tsx                     ← Shopping cart
  /checkout/page.tsx                 ← Checkout page
  /blog/page.tsx                     ← Blog listing page
  /blog/[slug]/page.tsx              ← Individual blog post
  /specialists/page.tsx              ← Visiting specialists schedule
  /admin/login/page.tsx              ← Doctor login page
  /admin/dashboard/page.tsx          ← Admin dashboard overview
  /admin/bookings/page.tsx           ← Manage bookings
  /admin/specialists/page.tsx        ← Manage visiting specialists
  /admin/shop/page.tsx               ← Manage medicine inventory
  /admin/blog/page.tsx               ← Manage blog posts
  /admin/blog/new/page.tsx           ← Create new blog post
  /admin/blog/edit/[id]/page.tsx    ← Edit blog post
  /api/bookings/route.ts             ← Create booking (POST), get all (GET)
  /api/bookings/[id]/route.ts        ← Update booking status (PATCH)
  /api/slots/route.ts                ← Get available time slots
  /api/specialists/route.ts          ← CRUD for visiting specialists
  /api/products/route.ts             ← CRUD for medicine products
  /api/blog/route.ts                 ← CRUD for blog posts
  /api/send-booking-email/route.ts   ← Send email notification to doctor
  /api/checkout/route.ts             ← Process Stripe payment
/components
  /Navbar.tsx
  /HeroSection.tsx
  /AboutSection.tsx
  /ServicesSection.tsx
  /SpecialistsSection.tsx
  /ShopPreview.tsx
  /BlogPreview.tsx
  /BookingForm.tsx
  /BSADCalendar.tsx                  ← Custom BS/AD dual calendar
  /TimeSlotPicker.tsx
  /BookingTable.tsx
  /SpecialistCard.tsx
  /ProductCard.tsx
  /CartItem.tsx
  /BlogCard.tsx
  /RichTextEditor.tsx                ← For blog post creation
  /Footer.tsx
/lib
  /supabase.ts                       ← Supabase client
  /supabaseAdmin.ts                  ← Supabase admin client (server-side)
  /nepaliDateConverter.ts            ← BS/AD date conversion utilities
  /stripe.ts                         ← Stripe client
  /resend.ts                         ← Resend email client
/utils
  /dateHelpers.ts
  /emailTemplates.ts

SUPABASE DATABASE SCHEMA
Create these SQL tables. Include the raw SQL so I can run it in the Supabase SQL editor:
Table 1: bookings
sqlcreate table bookings (
  id uuid default gen_random_uuid() primary key,
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  problem text not null,
  appointment_date_bs text not null,
  appointment_date_ad date not null,
  appointment_time time not null,
  booking_type text default 'regular' check (booking_type in ('regular', 'specialist')),
  specialist_id uuid references visiting_specialists(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamp with time zone default now()
);
Table 2: available_slots
sqlcreate table available_slots (
  id uuid default gen_random_uuid() primary key,
  slot_date_ad date not null,
  slot_date_bs text not null,
  slot_time time not null,
  is_booked boolean default false,
  unique(slot_date_ad, slot_time)
);
Table 3: visiting_specialists
sqlcreate table visiting_specialists (
  id uuid default gen_random_uuid() primary key,
  specialist_name text not null,
  specialization text not null,
  treatment_type text not null,
  visit_date_bs text not null,
  visit_date_ad date not null,
  available_from time not null,
  available_to time not null,
  consultation_fee numeric(10,2),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);
Table 4: products (Medicine Shop)
sqlcreate table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null check (category in ('pain_relief', 'antibiotics', 'vitamins', 'first_aid', 'supplements', 'other')),
  price numeric(10,2) not null,
  stock_quantity integer not null default 0,
  image_url text,
  requires_prescription boolean default false,
  is_available boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
Table 5: orders
sqlcreate table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  customer_address text not null,
  total_amount numeric(10,2) not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  order_status text default 'processing' check (order_status in ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default now()
);
Table 6: order_items
sqlcreate table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  price_at_purchase numeric(10,2) not null
);
Table 7: blog_posts
sqlcreate table blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  featured_image_url text,
  author_name text not null,
  category text not null check (category in ('health_tips', 'medicine_info', 'patient_stories', 'medical_news', 'general')),
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
Seed SQL for Available Slots (Next 30 days, Sunday-Saturday):
sql-- This will generate slots for the next 30 days from 9:00 AM to 5:00 PM in 30-minute increments
INSERT INTO available_slots (slot_date_ad, slot_date_bs, slot_time, is_booked)
SELECT 
  date_val::date as slot_date_ad,
  -- BS date will be calculated and inserted by the application
  '' as slot_date_bs,
  time_val::time as slot_time,
  false as is_booked
FROM 
  generate_series(
    current_date,
    current_date + interval '30 days',
    interval '1 day'
  ) as date_val,
  generate_series(
    '09:00'::time,
    '17:00'::time,
    interval '30 minutes'
  ) as time_val
WHERE 
  time_val < '17:00'::time;
Note: The BS dates in available_slots will be populated by the application using the Nepali date converter on first load.

PAGE 1: PUBLIC HOMEPAGE (/)
Build a world-class homepage with exceptional UI/UX. Every section should feel professional, human-friendly, and easy to navigate.
1. Navbar (Blue background - #1e3a8a, sticky)

Doctor's name/logo on the left
Desktop navigation: Home | About | Services | Specialists | Shop | Blog | Book Appointment
Mobile: Hamburger menu with smooth slide-in drawer
"Book Now" button (GREEN accent - #16a34a) with subtle hover lift animation
Language toggle for Nepali/English (small flag icons)

2. Hero Section (White background with subtle blue geometric pattern overlay)

Full-width, two-column layout (desktop) / stacked (mobile)
LEFT SIDE:

Doctor's name in large Playfair Display font (blue - #1e40af)
Specialization: "General Physician & Family Care" (smaller, gray)
Tagline: "स्वास्थ्य हाम्रो प्राथमिकता हो | Your Health, Our Priority" (bilingual)
Two CTA buttons side by side:

"Book Appointment" (GREEN - #16a34a, primary)
"Visit Shop" (Blue outline button)


Subtle fade-in animation on page load


RIGHT SIDE:

High-quality doctor photo placeholder (use a gradient blue circle background with text "Doctor Photo" centered)
Make it easy to replace with real <Image> component
Floating badge: "15+ Years Experience" (green accent)



3. Quick Stats Bar (Light blue background - #dbeafe)

4 stat cards in a row (2x2 on mobile)
Icons + numbers + labels:

"5000+ Happy Patients"
"15 Years Experience"
"98% Satisfaction"
"24/7 Emergency"


Animated count-up on scroll into view

4. About Section (White background)

Heading: "About Dr. [Name]" (blue - #3b82f6)
Two columns:

LEFT: Professional placeholder image (doctor in clinic setting)
RIGHT:

3-4 paragraphs about education, experience, approach to patient care
"Our Mission" callout box (light blue background)
List of certifications/qualifications with checkmark icons (green)





5. Services Section (Light gray background - #f8fafc)

Heading: "What We Treat" (blue)
Grid of 6 service cards (icon, title, description):

General Checkups
Chronic Disease Management
Pediatric Care
Preventive Medicine
Health Screenings
Telemedicine Consultations


Cards: white background, blue icons, subtle shadow, hover lift effect

6. Visiting Specialists Section (White background)

Heading: "Visiting Specialists This Week" (blue)
Horizontally scrollable cards (3 visible at once, swipeable on mobile)
Each card shows:

Specialist photo placeholder
Name + Specialization
Treatment type
Visit date (BS and AD in parentheses)
Time range
"Book with Specialist" button (GREEN)


If no specialists scheduled: Show placeholder with "Check back soon for visiting specialists"

7. Medicine Shop Preview (Light gray background - #f8fafc)

Heading: "Order Medicine Online" (blue)
Subheading: "Get essential medicines delivered to your doorstep"
Grid of 4 featured products (best sellers):

Product image, name, price (NPR), "Add to Cart" button (green)


"View All Products" link (blue, arrow icon)

8. Latest Blog Posts (White background)

Heading: "Health Tips & Insights" (blue)
3 recent blog post cards:

Featured image
Category badge (blue)
Title (truncated to 2 lines)
Excerpt (truncated to 3 lines)
Author + date
"Read More" link


"View All Posts" button (blue outline)

9. How to Book Section (Light blue background - #dbeafe)

Heading: "Book Your Appointment in 3 Easy Steps"
3 large numbered steps with icons:

Choose Your Date & Time (Calendar icon)
Fill Your Details (Form icon)
Get Instant Confirmation (Check icon)


Each step has a short description
Animated on scroll (stagger effect)

10. CTA Banner (Blue background - #1e40af, white text)

Large heading: "Ready to Book Your Appointment?"
Subtext: "Available Sunday to Saturday, 9 AM - 5 PM"
Large "Book Now" button (GREEN - #16a34a)

11. Footer (Dark blue background - #1e3a8a, white text)

4 columns (stack on mobile):

Column 1: Clinic name, logo, tagline
Column 2: Quick links (Home, Services, Shop, Blog, Contact)
Column 3: Contact info (Phone, Email, Address with Nepal flag)
Column 4: Opening hours (BS dates supported)


Bottom bar: Copyright, Privacy Policy, Terms & Conditions
Social media icons (Facebook, Instagram, WhatsApp)

KEY DESIGN PRINCIPLES:

Use generous white space (60% of the visual area)
All headings and sub-headings in blue tones (30%)
Only CTAs in green (10%)
Smooth scroll behavior
Subtle fade-in animations on scroll
Mobile-first responsive design
Accessible: ARIA labels, keyboard navigation, proper heading hierarchy
Fast loading: optimized images, lazy loading


PAGE 2: BOOKING PAGE (/booking)
Build a two-step booking experience:
Step 1: Choose Date & Time

Calendar-style date picker (use react-day-picker library) showing only dates that have available slots
When a date is selected, fetch available time slots from /api/slots?date=YYYY-MM-DD
Show time slots as clickable buttons in a grid (e.g., 9:00 AM, 9:30 AM, etc.)
Booked slots are shown as greyed out and disabled
Selected slot is highlighted in accent color

Step 2: Patient Details Form

Shown after a time slot is selected
Fields:

Full Name (required, text)
Phone Number (required, tel, with validation for 10-digit format)
Problem / Reason for Visit (required, textarea, min 20 characters)


Submit button: "Confirm Booking"
On submit: POST to /api/bookings with all data
On success: Show a confirmation screen with booking summary (name, date, time) and message "We'll call you to confirm your appointment."
On error: Show inline error message


PAGE 3: ADMIN LOGIN (/admin/login)

Clean centered login form
Email and password fields
"Login" button
Uses Supabase Auth signInWithPassword()
On success, redirect to /admin/dashboard
On failure, show "Invalid credentials" error
No "sign up" option (admin account is created manually in Supabase dashboard)


PAGE 4: ADMIN DASHBOARD (/admin/dashboard)

Protected route: check Supabase session server-side using createServerComponentClient. If not logged in, redirect to /admin/login.
Header: "Dashboard — Dr. [Name]" with a "Logout" button (calls supabase.auth.signOut() then redirects to login)

Stats Row at Top:

Total Bookings, Pending, Confirmed, Cancelled — shown as 4 stat cards

Bookings Table:

Columns: #, Patient Name, Phone, Problem (truncated to 50 chars with tooltip), Date, Time, Status, Actions
Status shown as colored badge: yellow (pending), green (confirmed), red (cancelled)
Actions column: dropdown or buttons to change status to Confirmed / Cancelled
On status change: PATCH to /api/bookings/[id] and optimistically update the UI
Filter tabs above table: All | Today | Pending | Confirmed | Cancelled
Search bar to filter by patient name or phone number


API ROUTES
POST /api/bookings

Accepts: { patient_name, patient_phone, problem, appointment_date, appointment_time }
Inserts into bookings table
Also marks the corresponding slot in available_slots as is_booked = true
Returns: { success: true, booking_id }

GET /api/bookings

Returns all bookings ordered by appointment_date desc, appointment_time asc
Protected: only accessible if Supabase session exists (check via Authorization header or cookie)

GET /api/slots?date=YYYY-MM-DD

Returns all slots for the given date with is_booked status
Public route (no auth needed)


ENVIRONMENT VARIABLES
Create a .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Also create a vercel.json and add instructions for adding these as Vercel environment variables.

DESIGN SYSTEM — 60-30-10 COLOR RULE
This is a medical website for a Nepali doctor. Follow the 60-30-10 rule strictly for visual balance:
60% — WHITE (Dominant - Backgrounds & Negative Space)
Background:     #ffffff  (pure white)
Light Gray:     #f8fafc  (section backgrounds)
Off-White:      #f1f5f9  (cards, subtle contrast)
30% — BLUE (Secondary - Headers, Footers, Sidebar, Sub-headings)
Primary Blue:   #1e40af  (deep professional blue)
Medium Blue:    #3b82f6  (headings, links)
Light Blue:     #dbeafe  (backgrounds for info sections)
Dark Blue:      #1e3a8a  (footer, navbar)
10% — GREEN (Accent - CTA Buttons Only)
Accent Green:   #16a34a  (Book Appointment, Submit, Add to Cart buttons)
Hover Green:    #15803d  (button hover state)
Success Green:  #22c55e  (confirmation messages)
Supporting Colors (Not part of the 60-30-10, used sparingly)
Warning:        #f59e0b  (amber - for pending status)
Danger:         #dc2626  (red - for cancelled/error)
Text Primary:   #0f172a  (nearly black)
Text Secondary: #475569  (gray for body text)
Border:         #e2e8f0  (subtle borders)
Tailwind Config:
Apply these in tailwind.config.ts:
javascriptcolors: {
  primary: '#1e40af',
  secondary: '#3b82f6',
  accent: '#16a34a',
  'accent-hover': '#15803d',
  background: '#ffffff',
  'bg-light': '#f8fafc',
  'text-primary': '#0f172a',
  'text-secondary': '#475569',
}
Usage Rules:

All backgrounds must be white or very light gray (60%)
Headers, footers, sidebar navigation, and all sub-headings use blue tones (30%)
ONLY call-to-action buttons (Book Appointment, Submit, Buy Now, Add to Cart) use green (10%)
Never use green for headings, text, or decorative elements
The navbar and footer should have a dark blue background (#1e3a8a)
Section headings use medium blue (#3b82f6)
Body text is dark gray (#475569) on white backgrounds


FINAL DELIVERABLES
Provide:

All complete file contents, ready to copy-paste
The Supabase SQL to run in the SQL editor
A seed script for available slots
Step-by-step deployment instructions:

Create Supabase project
Run SQL schema + seed
Create admin user in Supabase Auth dashboard
Push code to GitHub
Connect GitHub repo to Vercel
Add environment variables in Vercel
Deploy



Make all code production-quality: TypeScript, proper error handling, loading states, mobile responsive, accessible (ARIA labels, keyboard navigation), and SEO-ready (meta tags, OpenGraph).

End of prompt. Start building from the project structure and work through each section in order.