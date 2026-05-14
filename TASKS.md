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

### Phase 6F: Ayurveda Education Page

- [x] Create CONTENT_AYURVEDA.md with final Ayurveda education content
- [x] Add Ayurveda image to `/public/images/ayurveda/doshas-chart.png`
- [x] Add homepage preview section: Understanding Ayurveda
- [x] Place Ayurveda homepage preview after About and before Services
- [x] Create public `/ayurveda` page
- [x] Use the full content from `CONTENT_AYURVEDA.md`
- [x] Add the doshas chart image after the "Understanding the Three Doshas" section
- [x] Use Next.js Image for the doshas chart
- [x] Add clear image alt text: "Ayurveda five elements and three doshas chart"
- [x] Structure long content into readable sections, cards, and accordions
- [x] Explain Ayurveda, five elements, three Doshas, Prakriti, and Vikriti clearly
- [x] Add CTA button to book an Ayurvedic consultation
- [x] Keep design calm, readable, accessible, and easy for all age groups
- [x] Keep homepage preview short and link to `/ayurveda`
- [x] Run npm run build successfully
- [x] Commit Phase 6F to Git

### Phase 6G: Legal Pages

- [x] Create /privacy-policy page
- [x] Create /terms-and-conditions page
- [x] Add Privacy Policy content from PrivacypolicyandTerms.md
- [x] Add Terms and Conditions content from PrivacypolicyandTerms.md
- [x] Add clinic information (Laxmi Narayan Ayurveda Pharma)
- [x] Link both pages from Footer
- [x] Add metadata for both pages
- [x] Run npm run build successfully
- [x] Commit Phase 6G to Git

### Phase 6H: Booking and Patient Record Workflow Improvements

- [x] Add cancellation reason support when cancelling a booking
- [x] Add cancellation reason presets and optional custom reason
- [x] Store cancellation reason on the booking record
- [x] Store cancelled_at timestamp where useful
- [x] Show cancellation reason in Cancelled tab and booking details
- [x] Show cancellation reason inside patient booking history
- [x] Add manual patient search inside duplicate review area
- [x] Allow doctor/admin to search by name, phone, email, or date of birth
- [x] Allow doctor/admin to manually compare patient records before merging
- [x] Allow doctor/admin to keep records separate if they are not the same person
- [x] Improve duplicate review wording so it is clear these are suggestions only
- [x] Run npm run build successfully
- [ ] Commit Phase 6H to Git

### Phase 6I: Walk-in Patient Registration and Visit Records

- [x] Add "Add Patient" button inside `/admin/patients`
- [x] Allow admin/doctor to create a patient manually
- [x] Include patient profile fields:
  - name
  - phone
  - email optional
  - date of birth optional
  - General Patient Notes
  - Identity / Contact Notes
  - identity_status if needed
- [x] Add "Add Walk-in Visit" option
- [x] Allow doctor/admin to search existing patient before creating a new one
- [x] Allow doctor/admin to create a new patient and add visit record in one flow
- [x] Walk-in visits should save into `patient_visits`
- [x] Walk-in visits should have `booking_id = null`
- [x] Do not require appointment booking for walk-in visits
- [x] Show walk-in visits clearly in Visit History
- [x] Allow editing walk-in visit records
- [x] Keep patient identity duplicate warnings/manual merge available
- [x] Run npm run build successfully
- [x] Commit Phase 6I to Git

## Phase 7: Staff Profiles, Doctor Reference, Roles, and Permissions

### Phase 7A: Staff Profiles Database

- [x] Create staff_profiles table linked to Supabase Auth users
- [x] Add role field with owner, doctor, receptionist, inventory_manager, content_editor
- [x] Add is_active field
- [x] Add updated_at trigger
- [x] Add service_role permissions
- [x] Add doctor_id and doctor_name_snapshot to patient_visits
- [x] Create safe migration SQL
- [x] Backfill current logged-in admin as owner manually or via SQL
- [x] Update TypeScript database types
- [x] Run npm run build successfully
- [x] Commit Phase 7A to Git

### Phase 7B: Staff Profile Helper and Role Guards

- [x] Create helper to get current staff profile
- [x] Add role guard utility
- [x] Redirect inactive staff users away from admin pages
- [x] Protect /admin/patients based on role
- [x] Protect /admin/availability based on role
- [x] Protect staff/settings pages for owner only
- [x] Keep current owner login working
- [x] Show clear access denied message where needed
- [x] Run npm run build successfully
- [x] Commit Phase 7B to Git

### Phase 7C: Admin Staff Management

- [x] Create /admin/staff or /admin/settings/staff page
- [x] Owner can view staff list
- [x] Owner can create/invite staff user
- [x] Owner can assign role
- [x] Owner can activate/deactivate staff
- [x] Owner can update staff full name and role
- [x] Prevent non-owner users from accessing staff management
- [x] Add clear warnings when changing roles
- [x] Run npm run build successfully
- [x] Commit Phase 7C to Git

### Phase 7D: Doctor Reference in Patient Visits

- [x] When doctor/admin saves a visit, attach current staff profile as doctor_id where appropriate
- [x] Store doctor_name_snapshot on patient_visits
- [x] Show “Treated by” doctor name in patient visit history
- [x] Show doctor name in booking-linked checkup records
- [x] For old visits without doctor reference, show “Not recorded”
- [x] Keep walk-in visits and booking-linked visits working
- [x] Run npm run build successfully
- [x] Commit Phase 7D to Git


## Phase 8: Real BS/AD Calendar Support

- [x] Add real Nepali BS date conversion utility
- [x] Decide whether to use a package like `nepali-date-converter` or custom converter
- [x] Make BS the default calendar mode on the booking page
- [x] Keep AD calendar switch available
- [x] Show selected appointment date in both BS and AD
- [x] Store appointment_date_ad as the source of truth in Supabase
- [x] Store appointment_date_bs as display/reference value in bookings
- [x] Update available slot display so patients can choose dates easily in BS
- [x] Populate or calculate slot_date_bs for available slots where needed
- [x] Make sure `/api/slots?date=YYYY-MM-DD` still uses AD internally
- [x] Make admin dashboard show both BS and AD dates where useful
- [x] Make patient records and booking history show both BS and AD dates where useful
- [x] Test booking, rescheduling, availability blocking, and specialist scheduling with BS/AD dates
- [x] Run npm run build successfully
- [x] Commit Phase 8 to Git

## Phase 9: Visiting Specialists

- [x] Create public specialists page
- [x] Create specialist cards
- [x] Add homepage specialists preview
- [x] Create specialists API
- [x] Create admin specialists page
- [x] Add specialist CRUD
- [x] Show specialist visit dates in BS and AD
- [x] Allow admin to activate/deactivate specialist visits
- [x] Run npm run build successfully
- [x] Commit Phase 9 to Git

### Phase 9A: Specialist Detail Page

- [ ] Add optional profile/detail fields to `visiting_specialists`:
  - bio
  - qualifications
  - experience
  - work_history
  - treatment_areas
  - profile_image_url
  - visit_location
  - public_note
  - preparation_note
  - languages
  - gender
  - license_number
  - consultation_mode
  - display_order
- [ ] Create safe Supabase migration for the new specialist fields
- [ ] Update TypeScript database types
- [ ] Update admin specialist form to edit optional profile/detail fields
- [ ] Add visit location field to admin specialist form
- [ ] Add public note and preparation note fields to admin specialist form
- [ ] Add languages spoken field to admin specialist form
- [ ] Add optional gender field to admin specialist form
- [ ] Add optional license/registration number field to admin specialist form
- [ ] Add consultation mode field: In-person, Online, or Both
- [ ] Add display order field for manual ordering
- [ ] Allow admin to paste specialist photo URL
- [ ] Add Supabase Storage support for specialist image uploads if practical
- [ ] Create or document Supabase Storage bucket for specialist images
- [ ] Allow admin to upload specialist photo from computer if storage is ready
- [ ] Store final image URL in `profile_image_url`
- [ ] Show initials/avatar placeholder when no image is provided
- [ ] Create public `/specialists/[id]` detail page
- [ ] Add View Profile button on specialist cards
- [ ] Show visit location on public specialist cards
- [ ] Show consultation mode on public specialist cards
- [ ] Show consultation fee or Free Consultation clearly
- [ ] Show specialist visit date in BS and AD
- [ ] Detail page should show doctor photo/avatar, profile details, visit location, fee/free, BS/AD date, time, treatment areas, public note, and preparation note
- [ ] Keep inactive specialists hidden publicly
- [ ] Add placeholder CTA: Specialist booking coming soon
- [ ] Keep specialist booking for Phase 9B
- [ ] Run npm run build successfully
- [ ] Commit Phase 9A to Git

### Phase 9A-fix: Specialist Image Upload

- [ ] Create Supabase Storage bucket for specialist images
- [ ] Add image upload button to admin specialist form
- [ ] Allow admin to upload doctor photo from computer
- [ ] Upload image to Supabase Storage using safe server-side/API logic
- [ ] Save public image URL into `profile_image_url`
- [ ] Keep manual image URL input as fallback
- [ ] Show upload preview in admin form
- [ ] Validate image file type and size
- [ ] Show initials/avatar placeholder when no image is available
- [ ] Ensure uploaded image appears on `/specialists` cards
- [ ] Ensure uploaded image appears on `/specialists/[id]` detail page
- [ ] Run npm run build successfully
- [ ] Commit Phase 9A-fix to Git

### Phase 9B: Specialist Booking Flow

- [ ] Add Book Specialist button on active specialist cards/detail page
- [ ] Allow patient to book a selected specialist
- [ ] Link specialist booking to `specialist_id` in bookings
- [ ] Save `booking_type` as specialist
- [ ] Show specialist name/type in booking form
- [ ] Show specialist bookings clearly in admin dashboard
- [ ] Show specialist booking details in patient records
- [ ] Prevent booking inactive specialists
- [ ] Keep regular booking flow working
- [ ] Run npm run build successfully
- [ ] Commit Phase 9B to Git

## Phase 10: Blog

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
- [ ] Commit Phase 10 to Git

## Phase 11: Medicine Shop

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
- [ ] Commit Phase 11 to Git

## Phase 12: Checkout, Emails, Deployment

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


### Admin Mobile Navigation Polish

- [ ] Add mobile-friendly admin navigation menu
- [ ] Show quick links to Dashboard, Patients, Availability, Staff, and future admin sections
- [ ] Keep Logout visible but separate from navigation
- [ ] Ensure admin navigation works well on small screens
- [ ] Run npm run build successfully
- [ ] Commit admin mobile navigation polish to Git