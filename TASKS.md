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
- [x] Commit Phase 5E to Git

## Phase 5F: Availability and Booking Conflict Handling

- [x] In Availability Management, detect when a slot is already booked (Phase 5F)
- [x] Show patient/booking summary on booked slots (Phase 5F)
- [x] Prevent silent blocking of booked slots (Phase 5F)
- [x] Add View Booking action for booked slots (Phase 5F)
- [x] Add Reschedule Patient action from booked slots (Phase 5F)
- [x] Allow admin to choose a new available slot (Phase 5F)
- [x] After rescheduling, block the original slot with the selected reason (Phase 5F)
- [x] Update booking date/time to the new slot (Phase 5F)
- [x] Mark the new slot as booked (Phase 5F)
- [x] Show clear success/error messages (Phase 5F)
- [x] Add placeholder for patient notification later (Phase 5F)
- [x] Run npm run build successfully (Phase 5F)
- [x] Commit Phase 5F to Git

## Phase 6: Patient Records and Treatment History

### Phase 6A: Patient Records Database
- [x] Plan patient history data structure (Phase 6A)
- [x] Decide how to identify returning patients: phone primary, email secondary (Phase 6A)
- [x] Create patients table with phone unique constraint (Phase 6A)
- [x] Create patient_visits table linked to patient_id and booking_id (Phase 6A)
- [x] Add nullable patient_id FK to bookings (Phase 6A)
- [x] Update TypeScript database types: Patient, PatientVisit, Booking.patient_id, AvailableSlot flags (Phase 6A)
- [x] Add service_role permissions for patients and patient_visits (Phase 6A)
- [x] Run npm run build successfully (Phase 6A)
- [x] Commit Phase 6A to Git

### Phase 6B: Patient Records Admin UI
- [x] Create /app/admin/patients/page.tsx with auth guard (Phase 6B)
- [x] Create GET /api/admin/patients route with search and detail modes (Phase 6B)
- [x] Add patient search by name, phone, or email (Phase 6B)
- [x] Show patient list with name, phone, email, created_at (Phase 6B)
- [x] Show patient detail: profile, linked bookings, visit history (Phase 6B)
- [x] Show empty states for no patients, no bookings, no visits (Phase 6B)
- [x] Add Patients link in admin dashboard header (Phase 6B)
- [x] Protect patient records inside admin only (Phase 6B)
- [x] Run npm run build successfully (Phase 6B)
- [x] Commit Phase 6B to Git

### Phase 6C: Visit Notes and Treatment Updates
- [x] Create POST /api/admin/patients/visits route (Phase 6C)
- [x] Add "Add Visit" form in patient detail with all fields (Phase 6C)
- [x] Allow doctor/admin to add visit date, complaint, notes, medicines, follow-up, condition (Phase 6C)
- [x] Link new visit to correct patient_id (Phase 6C)
- [x] Show success/error messages on save (Phase 6C)
- [x] Refresh patient detail after saving visit (Phase 6C)
- [x] Run npm run build successfully (Phase 6C)
- [x] Commit Phase 6C to Git

### Phase 6D: Connect Booking Flow to Patient Records

- [x] Update booking creation to auto-match/create patient by phone (Phase 6D)
- [x] Use email as secondary optional match field (Phase 6D)
- [x] Save patient_id into bookings (Phase 6D)
- [x] Create backfill SQL migration 003_backfill_patient_bookings.sql (Phase 6D)
- [x] Show New Patient / Returning Patient indicator in admin bookings table (Phase 6D)
- [x] Show previous visit count in table and detail modal (Phase 6D)
- [x] Booking history already linked via patient_id in patient detail view (Phase 6D)
- [x] Create POST /api/admin/bookings/[id]/checkup linking visit to booking_id (Phase 6D)
- [x] Add Start Checkup action for confirmed bookings in detail modal (Phase 6D)
- [x] Clean booking table with single View action per row (Phase 6D)
- [x] Move all booking actions into View Details modal (Phase 6D)
- [x] Status-specific actions: Pending (Confirm, Cancel, Reschedule), Confirmed (Start Checkup, Reschedule, Cancel), Completed (View Patient Record), Cancelled (Restore, Reschedule on fail) (Phase 6D)
- [x] Add Save Visit and Save Visit & Complete Appointment buttons in checkup modal (Phase 6D)
- [x] Save Visit & Complete creates visit record and marks booking completed (Phase 6D)
- [x] Admin dashboard mobile-friendly and accessible (Phase 6D)
- [x] Run npm run build successfully (Phase 6D)
- [ ] Commit Phase 6D to Git

### Phase 6D-fix: Booking-linked Checkup Workflow

- [x] View Patient Record opens the exact patient automatically
- [x] Dashboard View Details shows Start Checkup only if no visit exists for that booking
- [x] If a visit already exists for the booking, show Continue Checkup
- [x] Continue Checkup loads existing visit details for editing
- [x] Save Visit updates existing booking-linked visit instead of creating duplicates
- [x] Save Visit keeps booking status confirmed
- [x] Save Visit & Complete updates visit and marks booking completed
- [x] Patient Records page shows active bookings for each patient
- [x] Patient Records page allows Start/Continue Checkup from active booking
- [x] Patient Records Add Visit remains for general/manual history entries
- [x] Allow doctor/admin to edit an existing visit record from Patient Records
- [x] Allow doctor/admin to edit a booking-linked visit after appointment is completed
- [x] Editing a completed visit should not change booking status
- [x] Show last updated date/time for visit records where available
- [x] Run npm run build successfully
- [x] Commit Phase 6D-fix to Git

### Phase 6E: Patient Identity and Record Merge

- [x] Improve long-term patient identity handling beyond phone-only matching
- [x] Add patient duplicate detection by phone, email, similar name, and optional date of birth
- [x] Allow admin to manually link a booking to an existing patient
- [x] Allow admin to update patient phone/email safely
- [x] Allow admin to merge duplicate patient records safely
- [x] Preserve all bookings and visit history when merging patient records
- [x] Add patient identity notes, for example "Uses son's phone number"
- [x] Normalize phone numbers before matching where possible
- [x] Keep patient identity management admin-only
- [x] Run npm run build successfully
- [x] Commit Phase 6E to Git

### Phase 6E-fix: Patient Identity Safety and Duplicate Review

- [x] Stop treating phone number as a guaranteed patient identity
- [x] Remove or replace the unique constraint on patients.phone if required
- [x] Allow multiple patient records to share the same phone number when appropriate
- [x] Never automatically merge patient records during booking creation
- [x] Never silently overwrite patient name, phone, email, notes, or identity notes during booking creation
- [x] When a new booking has same phone and same/similar name, allow safe linking to existing patient
- [x] When a new booking has same phone but different name, create a separate patient record or mark the booking/patient for review
- [x] Add optional date of birth support for safer patient identity checks
- [x] Add identity status support if needed, for example normal, possible_duplicate, shared_contact, needs_review
- [x] Add clear patient identity badges in admin, for example New Patient, Returning Patient, Possible Duplicate, Shared Phone, Needs Review
- [x] Fix duplicate detection so it finds patients with same phone, same email, similar name, and optional date of birth
- [x] Make duplicate detection suggest matches only, not merge automatically
- [x] Keep manual patient merge as an admin-only confirmed action
- [x] Improve merge success message to include name and phone/email, for example "Merged Lorel (9877654321) into Lorel (9877654098)"
- [x] Preserve all bookings and visit history when merging patient records
- [x] Add clear warning before merging patient records
- [x] Add General Patient Notes field to the edit patient profile form
- [x] Keep Identity / Contact Notes as a separate field
- [x] Rename labels clearly:
  - General Patient Notes
  - Identity / Contact Notes
- [x] Hide empty note sections or display them clearly without confusion
- [x] Allow View Patient Record for every booking that has a linked patient_id, not only completed bookings
- [x] If a booking is not safely linked to a patient, show Link to Patient instead of View Patient Record
- [x] Keep patient record links opening the exact patient automatically
- [x] Improve booking history display inside patient record so active bookings and full booking history are not confusing
- [x] If a patient has multiple active bookings after merge, show a clear warning
- [x] Keep active booking cards inside Patient Records clean and mobile-friendly
- [x] For confirmed active bookings inside Patient Records, show a primary Start Checkup button, or Continue Checkup if a booking-linked visit already exists
- [x] For confirmed active bookings, also show a View button for booking details and secondary actions
- [x] For pending, completed, and cancelled active bookings inside Patient Records, show only one primary View button
- [x] Move secondary active booking actions into the View Booking modal/panel
- [x] Inside the Patient Records View Booking modal/panel, do not show View Patient Record because the doctor is already inside that patient record
- [x] Inside the Patient Records View Booking modal/panel, show status-specific actions:
  - Pending: Confirm, Cancel, Reschedule
  - Confirmed: Reschedule, Cancel
  - Completed: View/Edit Visit
  - Cancelled: Restore, and Reschedule only after restore fails
- [x] Allow admin to cancel duplicate active bookings from inside Patient Records
- [x] Do not automatically delete bookings during patient merge
- [x] Public booking phone validation should accept common formats with spaces, dashes, and country codes
- [x] Normalize phone numbers consistently in booking creation, patient search, and duplicate detection
- [x] Keep patient identity management admin-only
- [x] Run npm run build successfully
- [x] Commit Phase 6E-fix to Git

## Phase 7: Visiting Specialists

- [ ] Create public specialists page
- [ ] Create specialist cards
- [ ] Add homepage specialists preview
- [ ] Create specialists API
- [ ] Create admin specialists page
- [ ] Add specialist CRUD
- [ ] Run npm run build successfully
- [ ] Commit Phase 7 to Git

## Phase 8: Blog

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

## Phase 9: Medicine Shop

- [ ] Create shop page
- [ ] Create product detail page
- [ ] Create product cards
- [ ] Create cart page
- [ ] Add cart functionality
- [ ] Create products API
- [ ] Create admin shop page
- [ ] Create sales/order history
- [ ] Add product CRUD
- [ ] Run npm run build successfully
- [ ] Commit Phase 9 to Git

## Phase 10: Checkout, Emails, Deployment

- [ ] Add payment gateway setup from nepal (esewa, khalti, direct bank card)
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

### UI/UX polish
- [ ] Improve admin patient search so formatted phone numbers like +977-98-1234-5678 match normalized stored numbers