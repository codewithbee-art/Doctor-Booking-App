# Project Tasks

## Phase 1: Foundation

- [x] Create Next.js 14 App Router project
- [x] Install and configure Tailwind CSS
- [x] Configure TypeScript
- [x] Add Playfair Display font
- [x] Add Source Sans 3 font
- [x] Configure global styles
- [x] Configure Tailwind color system
- [x] Commit Phase 1A to Git
- [x] Create Navbar component
- [x] Create Footer component
- [x] Create homepage skeleton
- [x] Add responsive layout
- [x] Run npm run build successfully
- [x] Commit Phase 1B to Git
- [x] Polish homepage UI (Phase 1C)
- [x] Add hover states, icons, focus-visible styles
- [x] Improve section rhythm and card design
- [x] Run npm run build successfully
- [x] Commit Phase 1C to Git

## Phase 2: Supabase Setup

- [x] Create /supabase/schema.sql with all 7 tables (Phase 2A)
- [x] Create /supabase/seed-slots.sql (Phase 2A)
- [x] Create /supabase/README.md with setup instructions (Phase 2A)
- [x] Create .env.example with required env vars (Phase 2A)
- [x] Run npm run build successfully (Phase 2A)
- [x] Commit Phase 2A to Git
- [x] Create /types/database.ts with TypeScript types (Phase 2B)
- [x] Create /lib/supabase.ts — browser client (Phase 2B)
- [x] Create /lib/supabaseAdmin.ts — server-side admin client (Phase 2B)
- [x] Create /lib/supabaseServer.ts — server-side auth client (Phase 2B)
- [x] Update .env.example with clear PUBLIC/SECRET labels (Phase 2B)
- [x] Install @supabase/supabase-js (Phase 2B)
- [x] Run npm run build successfully (Phase 2B)
- [x] Commit Phase 2B to Git
- [x] Create Supabase project and run SQL (manual)
- [x] Fix seed-slots.sql (CROSS JOIN + ON CONFLICT)
- [x] Add real environment variables to .env.local (manual)
- [x] Create /api/health/supabase route (Phase 2C)
- [x] Run npm run build successfully (Phase 2C)
- [x] Commit Phase 2C to Git
- [x] Test Supabase connection via health check (manual)

## Phase 3: Public Booking System

- [x] Create /app/booking/page.tsx (Phase 3A)
- [x] Create /components/BSADCalendar.tsx (Phase 3A)
- [x] Create /components/TimeSlotPicker.tsx (Phase 3A)
- [x] Create /components/BookingForm.tsx (Phase 3A)
- [x] Add two-step booking UI with mock slots (Phase 3A)
- [x] Add form validation UI (Phase 3A)
- [x] Add success confirmation UI (Phase 3A)
- [x] Run npm run build successfully (Phase 3A)
- [x] Add BS/AD calendar toggle (Phase 3A-fix)
- [x] Run npm run build successfully (Phase 3A-fix)
- [x] Commit Phase 3A to Git
- [x] Create /api/slots route (Phase 3B)
- [x] Run npm run build successfully (Phase 3B)
- [x] Commit Phase 3B to Git
- [x] Connect booking page to real slots API (Phase 3C)
- [x] Run npm run build successfully (Phase 3C)
- [x] Commit Phase 3C to Git
- [x] Create POST /api/bookings route (Phase 3D)
- [x] Fix Database type compatibility with Supabase JS v2.105 (Phase 3D)
- [x] Run npm run build successfully (Phase 3D)
- [x] Commit Phase 3D to Git

- [x] Connect booking form submit to POST /api/bookings (Phase 3E)
- [x] Show booking submission loading state (Phase 3E)
- [x] Show real success confirmation after booking succeeds (Phase 3E)
- [x] Refresh slot list after successful booking (Phase 3E)
- [x] Prevent duplicate form submissions (Phase 3E)
- [x] Run npm run build successfully (Phase 3E)
- [x] Commit Phase 3E to Git


## Phase 4: Admin Authentication

- [x] Create /app/admin/login/page.tsx (Phase 4)
- [x] Create /app/admin/dashboard/page.tsx (Phase 4)
- [x] Add Supabase Auth email/password login (Phase 4)
- [x] Protect /admin/dashboard (redirect to login) (Phase 4)
- [x] Add logout button (Phase 4)
- [x] Run npm run build successfully (Phase 4)
- [x] Commit Phase 4 to Git

## Phase 5: Admin Booking Dashboard

- [x] Add GET /api/bookings route (Phase 5A)
- [x] Run npm run build successfully (Phase 5A)
- [x] Commit Phase 5A to Git
- [x] Create dashboard layout (Phase 5B)
- [x] Add booking stats (Phase 5B)
- [x] Add bookings table (Phase 5B)
- [x] Add filters (Phase 5B)
- [x] Add search (Phase 5B)
- [x] Run npm run build successfully (Phase 5B)
- [x] Commit Phase 5B to Git
- [x] Add status update API (Phase 5C)
- [x] Add optimistic UI update (Phase 5C)
- [x] Run npm run build successfully (Phase 5C)
- [x] Add Completed filter tab (Phase 5C-fix)
- [x] Fix booking list order to date ASC, time ASC (Phase 5C-fix)
- [x] Improve action button logic per status (Phase 5C-fix)
- [x] Add slot release on cancel and re-book on restore (Phase 5C-fix)
- [x] Add View Details modal (Phase 5C-fix)
- [x] Run npm run build successfully (Phase 5C-fix)
- [x] Commit Phase 5C to Git

## Phase 5D: Admin Availability Management

- [x] Add SQL migration for blocked/unavailable slots (Phase 5D)
- [x] Update available_slots with is_blocked boolean and blocked_reason text (Phase 5D)
- [x] Update /api/slots so blocked slots are unavailable to patients (Phase 5D)
- [x] Create /api/admin/slots GET/PATCH/POST routes (Phase 5D)
- [x] Create /admin/availability page (Phase 5D)
- [x] Allow admin to block/unblock a single time slot (Phase 5D)
- [x] Allow admin to block a full day (Phase 5D)
- [x] Allow admin to add a reason for blocking (Phase 5D)
- [x] Show blocked slots clearly in admin (Phase 5D)
- [x] Make blocked slots unavailable on the public booking page (Phase 5D)
- [x] Run npm run build successfully (Phase 5D)
- [ ] Commit Phase 5D to Git

## Phase 5E: Admin Rescheduling

- [x] Add Reschedule action for pending and confirmed bookings (Phase 5E)
- [x] Allow admin to choose a new available date and time (Phase 5E)
- [x] Check selected new slot is available and not blocked (Phase 5E)
- [x] Free the old slot when rescheduling (Phase 5E)
- [x] Mark the new slot as booked (Phase 5E)
- [x] Update booking appointment_date_ad, appointment_date_bs, and appointment_time (Phase 5E)
- [x] Show clear success/error messages (Phase 5E)
- [x] Add placeholder for patient notification (Phase 5E)
- [x] Run npm run build successfully (Phase 5E)
- [x] Conditional reschedule for cancelled bookings after restore failure (Phase 5E-fix)
- [x] API: allow PUT reschedule for cancelled bookings, skip freeing old slot, set status to pending (Phase 5E-fix)
- [x] Dashboard: track restore-failed IDs, show Reschedule only after 409 restore failure (Phase 5E-fix)
- [x] Run npm run build successfully (Phase 5E-fix)
- [ ] Commit Phase 5E to Git

## Phase 5F: Availability and Booking Conflict Handling

- [ ] In Availability Management, detect when a slot is already booked
- [ ] Show patient/booking summary on booked slots
- [ ] Prevent silent blocking of booked slots
- [ ] Add View Booking action for booked slots
- [ ] Add Reschedule Patient action from booked slots
- [ ] Allow admin to choose a new available slot
- [ ] After rescheduling, block the original slot with the selected reason
- [ ] Update booking date/time to the new slot
- [ ] Mark the new slot as booked
- [ ] Show clear success/error messages
- [ ] Add placeholder for patient notification later
- [ ] Run npm run build successfully
- [ ] Commit Phase 5F to Git

## Phase 6: Patient Records and Treatment History

- [ ] Plan patient history data structure
- [ ] Decide how to identify returning patients: phone number, email, or patient profile
- [ ] Create patients table
- [ ] Create patient_visits or treatment_history table
- [ ] Link bookings to patients where possible
- [ ] Add doctor/admin view for patient history
- [ ] Show past visits, problems, notes, medicines, and treatment duration
- [ ] Allow doctor/admin to add current visit notes
- [ ] Allow doctor/admin to add prescribed medicines
- [ ] Allow doctor/admin to add follow-up instructions
- [ ] Allow doctor/admin to update patient condition/history
- [ ] Add search by patient name, phone, or email
- [ ] Protect patient records inside admin only
- [ ] Run npm run build successfully
- [ ] Commit Phase 6 to Git

## Phase 7: Visiting Specialists

- [ ] Create public specialists page
- [ ] Create specialist cards
- [ ] Add homepage specialists preview
- [ ] Create specialists API
- [ ] Create admin specialists page
- [ ] Add specialist CRUD
- [ ] Run npm run build successfully
- [ ] Commit Phase 7 to Git

## Phase 7: Blog

- [ ] Create blog listing page
- [ ] Create blog detail page
- [ ] Create blog cards
- [ ] Create blog API
- [ ] Create admin blog page
- [ ] Create new blog page
- [ ] Create edit blog page
- [ ] Add rich text editor
- [ ] Add SEO metadata
- [ ] Run npm run build successfully
- [ ] Commit Phase 8 to Git

## Phase 8: Medicine Shop

- [ ] Create shop page
- [ ] Create product detail page
- [ ] Create product cards
- [ ] Create cart page
- [ ] Add cart functionality
- [ ] Create products API
- [ ] Create admin shop page
- [ ] Add product CRUD
- [ ] Run npm run build successfully
- [ ] Commit Phase 9 to Git

## Phase 9: Checkout, Emails, Deployment

- [ ] Add Stripe setup
- [ ] Create checkout API
- [ ] Create orders
- [ ] Create order items
- [ ] Add Resend setup
- [ ] Add booking confirmation email
- [ ] Add doctor notification email
- [ ] Add OpenGraph metadata
- [ ] Add final accessibility checks
- [ ] Add Vercel deployment instructions
- [ ] Deploy to Vercel