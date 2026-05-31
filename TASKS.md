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

- [x] Add optional profile/detail fields to `visiting_specialists`:
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
- [x] Create safe Supabase migration for the new specialist fields
- [x] Update TypeScript database types
- [x] Update admin specialist form to edit optional profile/detail fields
- [x] Add visit location field to admin specialist form
- [x] Add public note and preparation note fields to admin specialist form
- [x] Add languages spoken field to admin specialist form
- [x] Add optional gender field to admin specialist form
- [x] Add optional license/registration number field to admin specialist form
- [x] Add consultation mode field: In-person, Online, or Both
- [x] Add display order field for manual ordering
- [x] Allow admin to paste specialist photo URL
- [x] Add Supabase Storage support for specialist image uploads if practical
- [x] Create or document Supabase Storage bucket for specialist images
- [x] Allow admin to upload specialist photo from computer if storage is ready
- [x] Store final image URL in `profile_image_url`
- [x] Show initials/avatar placeholder when no image is provided
- [x] Create public `/specialists/[id]` detail page
- [x] Add View Profile button on specialist cards
- [x] Show visit location on public specialist cards
- [x] Show consultation mode on public specialist cards
- [x] Show consultation fee or Free Consultation clearly
- [x] Show specialist visit date in BS and AD
- [x] Detail page should show doctor photo/avatar, profile details, visit location, fee/free, BS/AD date, time, treatment areas, public note, and preparation note
- [x] Keep inactive specialists hidden publicly
- [x] Add placeholder CTA: Specialist booking coming soon
- [x] Keep specialist booking for Phase 9B
- [x] Run npm run build successfully
- [x] Commit Phase 9A to Git

### Phase 9A-fix: Specialist Image Upload

- [x] Create Supabase Storage bucket for specialist images
- [x] Add image upload button to admin specialist form
- [x] Allow admin to upload doctor photo from computer
- [x] Upload image to Supabase Storage using safe server-side/API logic
- [x] Save public image URL into `profile_image_url`
- [x] Keep manual image URL input as fallback
- [x] Show upload preview in admin form
- [x] Validate image file type and size
- [x] Show initials/avatar placeholder when no image is available
- [x] Ensure uploaded image appears on `/specialists` cards
- [x] Ensure uploaded image appears on `/specialists/[id]` detail page
- [x] Run npm run build successfully
- [x] Commit Phase 9A-fix to Git

### Phase 9B: Specialist Public Booking Flow ✅

- [x] Add specialist-specific booking route, for example `/specialists/[id]/book`
- [x] Add Book Specialist button on active specialist cards
- [x] Add Book Specialist button on specialist detail page
- [x] Specialist booking form should show selected specialist details:
  - specialist name
  - specialization
  - treatment type
  - visit date in BS and AD
  - available time window
  - visit location
  - consultation fee or Free Consultation
  - consultation mode
  - preparation note where useful
- [x] Specialist booking should use the specialist visit date automatically
- [x] Prevent patient from selecting a different date for that specialist visit
- [x] Add specialist slot generation from `available_from`, `available_to`, and slot duration
- [x] Add `slot_duration_minutes` to `visiting_specialists`, default 30 minutes
- [x] Add optional `max_patients` to `visiting_specialists`
- [x] Update admin specialist form to set slot duration
- [x] Update admin specialist form to set optional max patients
- [x] Allow patient to choose an available specialist time slot
- [x] Prevent double booking of the same specialist, date, and time (normalized HH:mm ↔ HH:mm:ss)
- [x] Allow different specialists to be booked at the same time
- [x] Allow regular doctor and specialist bookings at the same time
- [x] Prevent booking inactive specialists
- [x] Prevent booking past specialist visit dates
- [x] Prevent booking when specialist max patients limit is reached
- [x] Link specialist booking to `specialist_id` in `bookings`
- [x] Save `booking_type` as `specialist`
- [x] Save specialist appointment date/time into `bookings`
- [x] Save `appointment_date_bs` and `appointment_date_ad` correctly
- [x] Create specialist booking API or extend booking API safely
- [x] Create specialist slots API if needed
- [x] Keep patient creation/linking logic working for specialist bookings
- [x] Keep patient identity safety rules working for specialist bookings
- [x] Show clear success and error messages
- [x] Keep regular booking flow working separately
- [x] Show Specialist/Regular badge in admin dashboard (desktop + mobile)
- [x] Show specialist details in dashboard booking detail modal
- [x] Show specialist badge and name in patient records booking history
- [x] Show specialist label in patient booking detail modal
- [x] Run npm run build successfully
- [x] Commit Phase 9B to Git

### Phase 9C: Specialist Booking Admin Management

- [x] Add Specialist Bookings link in admin navigation
- [x] Create dedicated admin specialist bookings page, for example `/admin/specialist-bookings`
- [x] Main admin dashboard should continue showing specialist bookings with clear Specialist badge and specialist name
- [x] Keep regular booking dashboard workflow working separately
- [x] Keep regular booking status actions working
- [x] Specialist bookings page should automatically group bookings by specialist doctor
- [x] Show specialist summary card/section for each doctor:
  - specialist name
  - specialization
  - treatment type
  - visit date in BS and AD
  - visit location
  - available time window
  - consultation fee or Free Consultation
  - total bookings
  - pending count
  - confirmed count
  - completed count
  - cancelled count
- [x] Inside each specialist group, show patient booking list ordered by appointment time
- [x] Add filters:
  - specialist doctor
  - date
  - status
  - search patient by name or phone
- [x] Show specialist badge/label in admin specialist booking table and booking details
- [x] Show specialist name in admin specialist booking table and details
- [x] Show specialist specialization and treatment type in admin booking details
- [x] Show specialist visit location in admin booking details
- [x] Show specialist consultation fee or Free Consultation in admin booking details
- [x] Specialist bookings should support pending, confirmed, cancelled, and completed statuses
- [x] Specialist bookings should support cancellation reason
- [x] Allow admin to confirm specialist booking
- [x] Allow admin to cancel specialist booking with reason
- [x] Allow admin to complete specialist booking
- [x] Allow admin to restore cancelled specialist booking if the time slot is still available
- [x] If restore fails because the specialist time slot is taken, allow reschedule
- [x] Allow specialist booking reschedule to choose another available time from the same specialist visit/session
- [x] Prevent rescheduling into an already booked specialist time slot
- [x] Allow admin to view linked patient record from specialist booking
- [x] Allow doctor/admin to start checkup from specialist booking where appropriate
- [x] Allow doctor/admin to continue checkup from specialist booking if a visit record already exists
- [x] Save specialist visit/checkup notes into patient history
- [x] Show specialist-linked visit records clearly in Visit History
- [x] Keep doctor reference on specialist visit records
- [x] Show specialist booking details in patient records and booking history
- [x] Show specialist name/type/location in patient booking history
- [x] Patient Records should clearly show specialist bookings and specialist-linked visits
- [x] Keep walk-in visit workflow working
- [x] Prevent admin actions on inactive/deleted specialist records from breaking old bookings
- [x] Old specialist bookings should remain readable even if the specialist is later deactivated
- [x] Do not fully build specialist walk-in patients in this phase
- [x] Add placeholder/future task note for specialist walk-in patients if needed
- [x] Show clear success and error messages
- [x] Run npm run build successfully
- [x] Commit Phase 9C to Git

### Phase 9D: Specialist Walk-in Queue

- [x] Add universal “Add Specialist Walk-in” button on `/admin/specialist-bookings`
- [x] Add “Add Walk-in Patient” button inside each specialist doctor group
- [x] Use one shared specialist walk-in modal/form for both entry points
- [x] If opened from universal button, allow admin to select specialist visit from a dropdown
- [x] If opened from specialist group button, pre-select that specialist visit automatically
- [x] Specialist walk-ins should always belong to one selected specialist visit
- [x] Specialist walk-ins should go directly into the selected specialist’s queue/group
- [x] Show selected specialist details in the walk-in form:
  - specialist name
  - specialization
  - treatment type
  - visit date in BS and AD
  - available time window
  - visit location
  - consultation fee or Free Consultation
  - consultation mode
- [x] Allow admin to search existing patient by name, phone, email, or date of birth
- [x] Allow admin to select an existing patient for specialist walk-in
- [x] Allow admin to create a new patient if no match is found
- [x] New patient form should follow the existing Patient Records Add Patient layout:
  - full name
  - phone
  - email optional
  - date of birth optional
  - General Patient Notes
  - Identity / Contact Notes
- [x] Keep patient identity safety rules working for specialist walk-ins
- [x] Add Problem / Reason for Visit field
- [x] Do not require online slot selection for specialist walk-ins
- [x] Use current time as the default walk-in time
- [x] Add optional manual time adjustment if practical
- [x] Add `booking_source` support if needed, for example:
  - online
  - walk_in
  - admin
- [x] Save specialist walk-ins as `booking_source = walk_in`
- [x] Save public specialist bookings as `booking_source = online` where useful
- [x] Add to Queue should create specialist walk-in booking only
- [x] Add to Queue should set booking status to confirmed
- [x] Create specialist walk-in booking in `bookings`
- [x] Save `booking_type = specialist`
- [x] Save selected `specialist_id`
- [x] Save selected or created `patient_id`
- [x] Save specialist visit date as appointment date
- [x] Save walk-in time as appointment time
- [x] Show walk-in source badge in Specialist Bookings admin page
- [x] Show walk-in source badge in main admin dashboard where specialist bookings appear
- [x] Show specialist walk-in details in Patient Records booking history
- [x] Inside each specialist group, show online bookings and walk-ins together, ordered by time
- [x] Cancelled specialist walk-ins should restore directly to confirmed because they do not use slot blocking
- [x] Online specialist booking restore should continue checking specialist slot availability
- [x] Keep owner/admin full access to all specialist bookings for now
- [x] Do not build specialist-specific restricted access in this phase
- [x] Keep specialist-specific restricted access for a later advanced permissions phase
- [x] Keep regular walk-in visit workflow working
- [x] Keep online specialist booking workflow working
- [x] Keep regular booking workflow working
- [x] Show clear success and error messages
- [x] Run npm run build successfully
- [x] Commit Phase 9D to Git

### Phase 9E: Specialist Walk-in Checkup Integration

- [x] Add "Add & Start Checkup" action to the specialist walk-in modal
- [x] Add & Start Checkup should create specialist walk-in booking first
- [x] Add & Start Checkup should then open the existing specialist checkup form directly
- [x] The checkup form should be linked to the specialist walk-in booking
- [x] The checkup form should pre-fill:
  - visit date
  - walk-in time where useful
  - patient problem/reason
  - specialist context
- [x] The checkup form should show specialist context clearly:
  - specialist name
  - specialization
  - treatment type
  - visit location
  - booking source: Walk-in
- [x] Save Visit should create or update a `patient_visits` record linked to the specialist walk-in booking
- [x] Save Visit should keep the specialist walk-in booking status confirmed
- [x] Save Visit & Complete should create or update the visit and mark the specialist walk-in booking completed
- [x] Continue Checkup should work for specialist walk-ins with existing visit records
- [x] Continue Checkup should load existing visit details for editing
- [x] Completed specialist walk-ins should show View/Edit Visit where appropriate
- [x] Save specialist walk-in checkup details into patient history through the existing Start/Continue Checkup flow
- [x] Clearly label specialist walk-in visits in Visit History
- [x] Show specialist name in patient Visit History where useful
- [x] Show walk-in time in patient Visit History where useful
- [x] Keep doctor reference on specialist walk-in visit records
- [x] Visit records should save `doctor_id` and `doctor_name_snapshot` from the logged-in staff profile
- [x] Specialist walk-in visit should remain linked to:
  - patient_id
  - booking_id
  - specialist booking context
- [x] Keep Add to Queue workflow working from Phase 9D
- [x] Keep Start Checkup and Continue Checkup working for online specialist bookings
- [x] Keep regular checkup workflow working
- [x] Keep regular walk-in visit workflow working
- [x] Keep patient records and visit editing working
- [x] Show clear success and error messages
- [x] Run npm run build successfully
- [x] Commit Phase 9E to Git


### Phase 10A: Blog Database and Admin Blog Management

- [x] Create `blog_posts` table
- [x] Add safe Supabase migration for blog posts
- [x] Add fields:
  - id
  - title
  - slug
  - excerpt
  - content
  - cover_image_url
  - cover_image_alt
  - category
  - tags
  - author_name
  - reviewed_by
  - status
  - published_at
  - reading_time
  - medical_disclaimer
  - seo_title
  - seo_description
  - is_featured
  - created_at
  - updated_at
- [x] Add status values:
  - draft
  - published
  - archived
- [x] Update TypeScript database types
- [x] Create admin blog page `/admin/blog`
- [x] Add Blog link to admin navigation or dashboard area where appropriate
- [x] Admin can view all blog posts:
  - draft
  - published
  - archived
- [x] Create new blog page `/admin/blog/new`
- [x] Create edit blog page `/admin/blog/[id]/edit`
- [x] Add blog form fields:
  - title
  - slug
  - excerpt
  - category
  - tags
  - cover image URL
  - cover image alt text
  - author name optional
  - reviewed by optional
  - status
  - published date/time
  - reading time
  - medical disclaimer
  - SEO title
  - SEO description
  - featured toggle
  - content
- [x] Auto-generate slug from title
- [x] Allow admin to manually edit slug
- [x] Validate slug uniqueness
- [x] Add one Reading Time field
- [x] If Reading Time is empty, calculate reading time automatically from content
- [x] If admin enters Reading Time, display the admin-entered value
- [x] Add default medical disclaimer if admin leaves disclaimer empty
- [x] Allow admin to replace the default medical disclaimer with custom text
- [x] Add optional author name field
- [x] Add optional reviewed by field
- [x] Add is_featured flag
- [x] Only one blog post should be featured at a time
- [x] If admin marks a post as featured, automatically remove featured status from other posts
- [x] Use same-size blog cards for featured and normal posts
- [x] Featured posts should show a Featured badge only, not a separate large layout
- [x] Add Markdown content editor with live preview
- [x] Support Markdown formatting:
  - headings
  - bold
  - italic
  - bullet lists
  - numbered lists
  - links
  - quotes
  - paragraphs
- [x] Render Markdown safely
- [x] Do not add comments, likes, ratings, or public user accounts
- [x] Add cover image upload from computer using Supabase Storage if practical
- [x] Create or document `blog-images` Supabase Storage bucket if upload is added
- [x] Keep cover image URL input as fallback
- [x] Show cover image preview in admin form
- [x] Validate image file type and size if upload is added
- [x] Admin can create draft post
- [x] Admin can publish post
- [x] Admin can archive post
- [x] Admin can edit existing post
- [x] Admin can delete post only if safe, otherwise prefer archive
- [x] Show clear success and error messages
- [x] Run npm run build successfully
- [x] Commit Phase 10A to Git

### Phase 10B: Public Blog Pages, SEO, and Sharing

- [x] Create public blog listing page `/blog`
- [x] Create public blog detail page `/blog/[slug]`
- [x] Create reusable blog cards
- [x] Public pages should show only published posts
- [x] Blog listing should show all posts in same-size cards
- [x] Blog listing should support search
- [x] Blog listing should support category filtering
- [x] Blog listing should show Featured badge on featured post cards
- [x] Homepage blog preview should show 3 posts total:
  - newest featured published post first, if available
  - then newest published posts
  - if no featured post exists, show 3 newest published posts
- [x] Homepage blog preview should use same-size cards
- [x] Blog cards should show:
  - cover image or placeholder
  - category badge
  - featured badge if applicable
  - title
  - excerpt
  - author if available
  - reading time
  - published date
  - Read More link/button
- [x] Add smooth hover animation on blog cards:
  - subtle shadow increase
  - slight lift effect
  - smooth transition
- [x] Add hover animation on blog cover images:
  - slight zoom-in effect
  - no layout shift
  - rounded corners maintained
- [x] Blog detail page should use professional article layout
- [x] On large screens, blog detail page should show:
  - main article content on the left
  - recent posts sidebar on the right
- [x] On mobile, recent posts should move below the article
- [x] Blog detail page should show:
  - title
  - category
  - author name if available
  - reviewed by if available
  - published date
  - reading time
  - cover image
  - article content
  - medical disclaimer
  - share buttons
  - copy link button
  - related articles
  - booking CTA
- [x] Add share buttons:
  - WhatsApp
  - Facebook
  - Copy Link
- [x] Copy Link should show clear copied confirmation
- [x] Add recent posts sidebar on desktop
- [x] Add recent posts section below article on mobile
- [x] Add related posts section where practical
- [x] Related posts should prefer same category where possible
- [x] Add medical disclaimer to blog detail page
- [x] If post has custom medical disclaimer, show custom disclaimer
- [x] If post has no custom disclaimer, show default medical disclaimer
- [x] Add CTA from blog detail page to booking page
- [x] Add SEO metadata for blog listing page
- [x] Add SEO metadata for blog detail page
- [x] Use `seo_title` if available, otherwise use blog title
- [x] Use `seo_description` if available, otherwise use excerpt
- [x] Use cover image for OpenGraph image where available
- [x] Render Markdown content with clean typography:
  - headings
  - paragraphs
  - bullet lists
  - numbered lists
  - quotes
  - links
- [x] Keep typography readable for all age groups
- [x] Keep animations subtle and professional
- [x] Do not add comments, likes, ratings, or public user accounts
- [x] Run npm run build successfully
- [x] Commit Phase 10B to Git

## Phase 11: Private Counselling Booking

- [x] Create public private counselling page `/private-counselling`
- [x] Add homepage section/card for Private & Confidential Counselling
- [x] Place homepage private counselling section after “What We Treat” and before “Visiting Specialists”
- [x] Do not modify the existing “What We Treat” cards in this phase
- [x] Private counselling section should feel calm, respectful, and privacy-focused
- [x] Add CTA button: Book Private Counselling
- [x] CTA should open booking page with counselling mode enabled, for example `/booking?type=counselling`
- [x] Private counselling page should explain:
  - confidential consultation
  - phone/video/in-person options
  - suitable for sensitive concerns
  - patient does not need to share full details online
  - admin/doctor will handle the booking respectfully
- [x] Add private counselling option inside normal booking form
- [x] If patient checks private counselling, show counselling-specific fields
- [x] If patient comes from `/private-counselling`, counselling option should be enabled automatically
- [x] Add counselling booking fields to `bookings` if needed:
  - booking_type
  - consultation_mode
  - privacy_preference
  - payment_preference
  - payment_status
  - counselling_reason
- [x] Support `booking_type = counselling`
- [x] Consultation mode options:
  - phone
  - video
  - in_person
- [x] Privacy preference options:
  - private
  - normal
- [x] Payment preference options:
  - pay_now
  - pay_later
  - pay_on_visit
- [x] Payment status should prepare for future payment flow:
  - unpaid
  - pending
  - paid
  - failed
  - refunded
- [x] Do not build full payment gateway in this phase
- [x] If Pay Now is selected, show clear message that online payment will be handled in the payment phase or route to safe placeholder if needed
- [x] If Pay Later is selected, show message that admin will contact the patient
- [x] If Pay on Visit is selected, allow only when consultation mode is in_person
- [x] Keep normal booking flow working when counselling is not selected
- [x] Counselling form should keep details minimal and respectful
- [x] Brief concern/reason should be optional or short
- [x] Do not force patients to describe sensitive issues in detail
- [x] Save counselling bookings into the existing `bookings` table
- [x] Keep patient creation/linking and identity safety logic working
- [x] Booking success screen should clearly show:
  - Private Counselling booking type
  - consultation mode
  - payment preference
  - next step message
- [x] Show Private Counselling badge/label in admin dashboard
- [x] Add Counselling filter/tab in admin dashboard booking filters
- [x] Show counselling details in booking detail modal:
  - consultation mode
  - privacy preference
  - payment preference
  - payment status
  - brief concern/reason
- [x] Keep sensitive counselling details visually separated from normal booking details
- [x] Show counselling booking details in Patient Records booking history where appropriate
- [x] Keep doctor/admin checkup workflow working for counselling bookings
- [x] Counselling bookings should support normal booking statuses:
  - pending
  - confirmed
  - cancelled
  - completed
- [x] Counselling bookings should support cancellation reason
- [x] Add clear success and error messages
- [x] Run npm run build successfully
- [x] Commit Phase 11 to Git

## Phase 12: Medicine Shop

### Phase 12A: Product Catalogue and Admin Product Management

- [x] Create `products` table
- [x] Add safe Supabase migration for products
- [x] Include explicit Supabase GRANT statements for the new `products` table
- [x] Enable RLS on `products`
- [x] Add RLS policies for `products`:
  - anon can read only active public products
  - authenticated can read only active public products unless using server-side admin API
  - service_role can manage all products
- [x] Do not expose hidden/inactive products to public users
- [x] Add product fields:
  - id
  - name
  - slug
  - short_description
  - description
  - category
  - price
  - sale_price
  - image_url
  - image_alt
  - stock_quantity
  - stock_status
  - is_active
  - is_featured
  - requires_consultation
  - allow_delivery
  - allow_pickup
  - usage_instructions
  - ingredients
  - warnings
  - created_at
  - updated_at
- [x] Add stock status values:
  - in_stock
  - low_stock
  - out_of_stock
  - hidden
- [x] Update TypeScript database types
- [x] Create admin shop page `/admin/shop`
- [x] Add Shop link to admin navigation or dashboard area where appropriate
- [x] Admin can view all products:
  - active
  - inactive
  - out of stock
  - hidden
- [x] Create new product page or modal
- [x] Create edit product page or modal
- [x] Admin can create product
- [x] Admin can edit product
- [x] Admin can archive/deactivate product
- [x] Admin can mark product active/inactive
- [x] Admin can mark product as featured
- [x] Admin can update stock quantity manually
- [x] Admin can update stock status manually
- [x] Admin can set product as consultation-required
- [x] Admin can control delivery/pickup availability:
  - allow delivery
  - allow pickup
- [x] Add product image URL field
- [x] Add product image upload from computer using Supabase Storage if practical
- [x] Use Supabase Storage bucket named `product-images` if upload is added
- [x] Keep image URL input as fallback
- [x] Show product image preview in admin form
- [x] Validate image file type and size if upload is added
- [x] Auto-generate slug from product name
- [x] Allow admin to manually edit slug
- [x] Validate slug uniqueness
- [x] Create public shop page `/shop`
- [x] Create public product detail page `/shop/[slug]`
- [x] Create reusable product cards
- [x] Public shop should show only active products
- [x] Hidden/inactive products should not appear publicly
- [x] Product cards should show:
  - image or placeholder
  - name
  - category
  - short description
  - price
  - sale price if available
  - stock status
  - consultation-required badge if needed
  - pickup/delivery availability where useful
  - View Details button
- [x] Product detail page should show:
  - product image
  - name
  - category
  - price and sale price if available
  - stock status
  - full description
  - usage instructions
  - ingredients
  - warnings/precautions
  - consultation-required notice if needed
  - pickup/delivery availability
- [x] Add product search on `/shop`
- [x] Add category filter on `/shop`
- [x] Add stock/availability filter where practical
- [x] Add featured products support
- [x] Homepage “Order Medicine Online” section should show real featured products if practical
- [x] If homepage products are not wired in this phase, keep existing placeholder safely and note it as follow-up
- [x] Add medicine safety disclaimer on shop/product pages
- [x] Avoid strong medical claims such as “cures” or “guaranteed result”
- [x] Do not build cart in Phase 12A
- [x] Do not build order submission in Phase 12A
- [x] Do not build payment in Phase 12A
- [x] Do not build analytics in Phase 12A
- [x] Show clear success and error messages
- [x] Run npm run build successfully
- [x] Commit Phase 12A to Git

### Phase 12B-1: Cart and Order Request Foundation

- [x] Create `orders` table
- [x] Create `order_items` table
- [x] Add safe Supabase migration for orders and order items
- [x] Include explicit Supabase GRANT statements for the new `orders` and `order_items` tables
- [x] Enable RLS on `orders` and `order_items`
- [x] Add RLS policies for `orders` and `order_items`:
  - service_role can manage all orders and order items
  - public users should not directly read private order/customer data
  - public order creation should happen through secure server-side API routes
- [x] Do not expose customer names, phone numbers, addresses, order contents, or payment details to anonymous users
- [x] Add `orders` fields:
  - id
  - order_number
  - customer_name
  - customer_phone
  - customer_email
  - fulfillment_method
  - delivery_address
  - delivery_notes
  - order_status
  - payment_preference
  - payment_status
  - subtotal
  - delivery_fee
  - total
  - has_consultation_items
  - notes
  - created_at
  - updated_at
- [x] Add `order_items` fields:
  - id
  - order_id
  - product_id
  - product_name_snapshot
  - quantity
  - unit_price
  - subtotal
  - requires_consultation_snapshot
  - allow_delivery_snapshot
  - allow_pickup_snapshot
  - created_at
- [x] Add fulfillment method options:
  - pickup
  - delivery
- [x] Add order status options:
  - pending
  - needs_review
  - confirmed
  - ready_for_pickup
  - out_for_delivery
  - completed
  - cancelled
- [x] Add payment preference options:
  - pay_later
  - pay_on_pickup
  - pay_on_delivery
  - pay_now_later_phase
- [x] Add payment status options:
  - unpaid
  - pending
  - paid
  - failed
  - refunded
- [x] Update TypeScript database types
- [x] Add cart functionality using localStorage
- [x] Cart should persist if user leaves and returns in the same browser
- [x] Clear cart after successful order request
- [x] Add Add to Cart button on product cards/detail pages
- [x] Add quantity selector
- [x] Prevent adding out-of-stock products where appropriate
- [x] Show consultation-required warning before/after adding relevant products
- [x] Create cart page `/cart`
- [x] Cart page should show:
  - product image
  - product name
  - quantity
  - unit price
  - subtotal
  - remove item
  - update quantity
  - order total
- [x] Cart page should allow customer to choose:
  - collect from shop
  - home delivery
- [x] If collect from shop is selected:
  - show pickup location
  - show opening hours where available
  - delivery address should not be required
- [x] If home delivery is selected:
  - require delivery address
  - allow delivery notes
- [x] If any cart item has `allow_delivery = false`, disable home delivery and explain why
- [x] If any cart item has `allow_pickup = false`, disable pickup and explain why
- [x] If any cart item requires consultation:
  - show clear consultation-required warning
  - order status should become `needs_review` or similar
  - explain that admin/doctor will review before confirming
- [x] Submit order request through server-side API
- [x] Do not build full payment gateway in this phase
- [x] Save order into `orders`
- [x] Save line items into `order_items`
- [x] Save product name/price/flags snapshots into `order_items`
- [x] Do not reduce stock in Phase 12B-1
- [x] Stock reduction should happen later in Phase 12B-2 when admin confirms an order
- [x] Show clear order request success message
- [x] Run npm run build successfully
- [x] Commit Phase 12B-1 to Git

### Phase 12B-2: Admin Order Management and Stock Workflow

- [x] Create admin orders page `/admin/orders` or `/admin/shop/orders`
- [x] Admin can view order history
- [x] Admin can view order details
- [x] Admin can filter orders by:
  - status
  - fulfillment method
  - payment status
  - date
  - customer name/phone
- [x] Admin can update order status
- [x] Admin can confirm order
- [x] Admin can cancel order with reason if practical
- [x] Admin can mark order ready for pickup
- [x] Admin can mark order out for delivery
- [x] Admin can mark order completed
- [x] Stock should reduce automatically when admin confirms an order
- [x] Stock should not reduce when order is only pending
- [x] Stock should restore if a confirmed order is cancelled
- [x] Admin can still manually update stock quantity from product management
- [x] Keep customer details visible in order history
- [x] Do not build separate customer CRM page in this phase
- [x] Use order history as first version of customer record
- [x] Show returning customer count by phone if practical
- [x] Homepage “Order Medicine Online” Add to Cart buttons should work if homepage products are wired
- [x] Do not build full payment gateway in this phase
- [x] Run npm run build successfully
- [x] Commit Phase 12B-2 to Git

### Phase 12C: Shop Analytics and Stock Insights

- [x] Create admin shop analytics page `/admin/shop/analytics` or section inside admin shop
- [x] Use completed/confirmed order data for analytics
- [x] Show key summary cards:
  - total orders
  - pending orders
  - completed orders
  - total sales value
  - low stock products
  - out of stock products
  - consultation-required order requests
- [x] Show best-selling products
- [x] Show slow-moving products
- [x] Show low-stock alerts
- [x] Show out-of-stock products
- [x] Show sales trend by:
  - day
  - week
  - month
  - year where practical
- [x] Show product/category performance
- [x] Show pickup vs delivery breakdown
- [x] Show consultation-required product request count
- [x] Show top customers by phone/order count if practical
- [x] Add basic date range filter:
  - today
  - this week
  - this month
  - this year
  - custom range if practical
- [x] Add charts where practical and lightweight
- [x] Keep analytics server-side or API-backed so large order history does not slow the admin UI
- [x] Avoid loading unnecessary full order details if summary data is enough
- [x] Add clear empty states when there is not enough sales data
- [x] Do not build payment gateway in this phase
- [x] Do not modify core order logic unless analytics exposes a bug
- [x] Run npm run build successfully
- [x] Commit Phase 12C to Git

## Phase 13: Checkout, Emails, Deployment

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

#### Phase 14: Advanced Role Access and Specialist Permissions

- Review all admin roles and permissions before deployment
- Refine owner, doctor, receptionist, inventory_manager, and content_editor access
- Add specialist-specific staff access
- Link visiting specialist records to staff_profiles where needed
- Allow specialist users to access only their own specialist bookings
- Allow specialist users to view patient details needed for their own appointments
- Allow specialist users to start or continue checkup only for their own specialist patients
- Prevent specialist users from accessing unrelated admin sections
- Add final permission testing before deployment

## Phase 15: Supabase Grants and RLS Audit

- [ ] Review all existing tables in the `public` schema
- [ ] List every table and decide access category:
  - public readable
  - admin-only/private
  - mixed public/private
- [ ] Add explicit Supabase grants for every existing table
- [ ] Add `service_role` grants for server-side admin/API access where needed
- [ ] Add `anon` SELECT grants only for safe public data
- [ ] Add `authenticated` grants only where needed
- [ ] Enable or verify RLS on sensitive tables
- [ ] Verify RLS policies protect private data
- [ ] Do not expose patient, booking, staff, order, or clinical private data to anon users
- [ ] Public-readable tables may include:
  - published blog posts
  - active public products
  - active visiting specialist public profile data
  - public availability/slots if required by booking flow
- [ ] Private/admin tables include:
  - patients
  - patient_visits
  - bookings
  - staff_profiles
  - orders
  - order_items
- [ ] Check public booking flow after grants
- [ ] Check admin dashboard after grants
- [ ] Check patient records after grants
- [ ] Check specialist booking after grants
- [ ] Check blog after grants
- [ ] Check shop after grants
- [ ] Run Supabase Security Advisor and review warnings
- [ ] Run npm run build successfully
- [ ] Commit Supabase grants and RLS audit to Git


### Admin Mobile Navigation Polish

- [ ] Add mobile-friendly admin navigation menu
- [ ] Show quick links to Dashboard, Patients, Availability, Staff, and future admin sections
- [ ] Keep Logout visible but separate from navigation
- [ ] Ensure admin navigation works well on small screens
- [ ] Run npm run build successfully
- [ ] Commit admin mobile navigation polish to Git

### Admin Navigation Polish

- [ ] Redesign admin navigation so it can support more modules
- [ ] Group related links, for example Specialists and Specialist Bookings
- [ ] Add mobile-friendly admin menu
- [ ] Keep Logout separate from navigation links
- [ ] Ensure Blog, Shop, Orders, Staff, and Settings can fit cleanly
- [ ] Run npm run build successfully
- [ ] Commit admin navigation polish to Git


### Performance and Admin Data Optimization

- [ ] Add pagination or date limits to admin booking lists
- [ ] Avoid loading all historical bookings by default
- [ ] Add default filters such as Today / Upcoming
- [ ] Optimize patient search queries
- [ ] Optimize specialist booking queries
- [ ] Check repeated API calls in Network tab
- [ ] Optimize images with Next.js Image where useful
- [ ] Test production build performance with `npm run build` and `npm run start`
- [ ] Run Lighthouse check before deployment