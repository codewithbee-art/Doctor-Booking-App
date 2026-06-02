# Project Brief: Nepali Doctor Website

## Goal

Build a professional, production-ready website for a Nepali medical practice using Next.js 14, TypeScript, Tailwind CSS, Supabase, Resend, Stripe, and Vercel.

The site will include:

1. Public homepage
2. Patient booking system with BS/AD date support
3. Admin login
4. Admin dashboard
5. Booking management
6. Visiting specialists schedule
7. Medicine shop
8. Cart and checkout
9. Blog
10. Email notifications
11. Vercel deployment

## Tech Stack

- Framework: Next.js 14 App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Supabase PostgreSQL
- Auth: Supabase Auth for admin only
- Email: Resend
- Payment: Stripe
- Deployment: Vercel
- Fonts: Playfair Display and Source Sans 3

## Design System

### 60% White

- Background: #ffffff
- Light Gray: #f8fafc
- Off White: #f1f5f9

### 30% Blue

- Primary Blue: #1e40af
- Medium Blue: #3b82f6
- Light Blue: #dbeafe
- Dark Blue: #1e3a8a

### 10% Green

- Accent Green: #16a34a
- Hover Green: #15803d
- Success Green: #22c55e

## Design Rules

- Use white and light gray for most backgrounds.
- Use blue for headings, navbar, footer, links, and important structure.
- Use green only for CTA buttons such as Book Appointment, Submit, Add to Cart, and Buy Now.
- Navbar and footer must use dark blue.
- Body text should use dark gray.
- The website must be responsive, accessible, clean, and professional.

## UI/UX Accessibility Rules

This website is for patients of all age groups, including older users, so the design must be clear, calm, and easy to use.

### Typography
- Use only the approved fonts:
  - Playfair Display for main headings only
  - Source Sans 3 for body text, buttons, forms, navigation, and all readable content
- Do not use decorative, handwritten, futuristic, comic, or overly stylized fonts.
- Prioritize readability over style.
- Body text must be at least 16px.
- Important text should use 18px or larger where appropriate.
- Line height must be comfortable, around 1.6 for paragraphs.
- Avoid thin font weights for important text.
- Use strong contrast between text and background.

### Navigation
- Navigation must be simple and obvious.
- Buttons must look clearly clickable.
- Forms must have clear labels, not placeholder-only labels.
- Important actions like Book Appointment must be easy to find.
- Avoid hidden interactions that older users may not understand.

### Visual Style
- Keep the design professional, calm, medical, and trustworthy.
- Do not use flashy animations, excessive gradients, neon colors, or complex visual effects.
- Use generous spacing and clear section separation.
- Icons should support understanding, not decorate randomly.

## Build Strategy

This project must be built in phases.

Do not build everything at once.

Each phase must:
- Keep existing working code safe
- Avoid modifying unrelated files
- Pass TypeScript checks
- Pass build checks
- Update this file with progress
- Update TASKS.md

## Current Status

Phase 1: Complete (1C — homepage UI polished with hover states, icons, improved cards, focus-visible styles)  
Phase 2: Complete (2C — health check route; schema + seed SQL run successfully in Supabase)  
Phase 3: Complete (3E — booking form connected to real API; end-to-end booking flow working; BS/AD toggle maintained)  
Phase 4: Complete (admin login/logout; protected dashboard; Supabase Auth)  
Phase 5: Complete (5A API, 5B dashboard UI, 5C status updates, 5D availability, 5E rescheduling, 5F booking conflict handling)  
Phase 6: Complete (6A database, 6B admin patients UI, 6C visit notes, 6D booking-patient linking + checkup flow, 6D-fix booking-linked checkup workflow, 6E patient identity + record merge, 6E-fix patient identity safety, 6F Ayurveda education page, 6G Privacy policy and Terms of Service, 6H Booking and Patient Record Workflow Improvements, 6I Walk-in Patient Registration and Visit Records)
Phase 7: Complete (7A Staff Profiles, 7B Doctor Reference, 7C Roles, and Permissions)
Phase 8: Complete (8 Real BS/AD Calendar Support)
Phase 9: Complete (Visiting Specialists)
Phase 9A: Complete (Specialist Detail Page)
Phase 9B: Complete (Specialist Public Booking Flow)
Phase 9C: Complete (Specialist Booking Admin Management — admin page, checkup modal, date range filter, dashboard Specialist filter tab)
Phase 9D: Complete (Specialist Walk-in Queue)
Phase 9E: Complete (Specialist Walk-in Checkup Integration)
Phase 10A: Complete Blog Database and Admin Blog Management
Phase 10B: Complete Public Blog Pages, SEO, and Sharing
Phase 11: Complete Private Counselling Booking
Phase 12A: Complete Product Catalogue and Admin Product Management
Phase 12B-1: Complete Cart and Order Request Foundation
Phase 12B-2: Complete Admin Order Management and Stock Workflow
Phase 12C: Complete Shop Analytics and Stock Insights

Current:
- Phase 13A: Manual Payment Settings and Receipt/Invoice System

Upcoming:
- Phase 13B: Email Notifications with Resend
- Phase 13C: OpenGraph Metadata and Final Content Polish
- Phase 14: Advanced Role Access and Specialist Permissions
- Phase 15: Supabase Grants and RLS Audit
- Phase 16: Final QA, Accessibility, SEO, and Deployment

## Phase Plan

### Phase 1: Foundation

- Set up Next.js project structure
- Configure Tailwind CSS
- Add fonts
- Add global layout
- Add Navbar
- Add Footer
- Build homepage skeleton
- Homepage UI polish

### Phase 2: Supabase Setup

- Supabase schema
- Seed slots
- Supabase clients
- Environment variables
- Supabase health check

### Phase 3: Public Booking System

- Booking page UI
- BS/AD calendar toggle placeholder
- Real available slots API
- Connect booking page to real slots
- Create booking API
- Save appointments to Supabase
- Mark booked slots unavailable

### Phase 4: Admin Authentication

- Admin login
- Supabase Auth email/password
- Protected admin dashboard
- Logout

### Phase 5: Admin Booking Dashboard and Availability

#### Phase 5A: Admin Bookings API

- GET bookings API
- Return admin booking data safely

#### Phase 5B: Admin Booking Dashboard UI

- Dashboard layout
- Booking stats
- Bookings table
- Filters
- Search

#### Phase 5C: Booking Status Workflow

- Status update API
- Optimistic UI updates
- Completed filter tab
- Correct status action logic
- Cancel releases slot
- Restore re-books slot
- View Details modal

#### Phase 5D: Admin Availability Management

- Block/unblock individual slots
- Block full days
- Add blocked reason
- Show blocked slots in admin
- Hide blocked slots from public booking page

#### Phase 5E: Admin Rescheduling

- Reschedule pending and confirmed bookings
- Conditional reschedule for cancelled bookings after restore failure
- Free old slot
- Book new slot
- Update appointment date/time

#### Phase 5F: Availability and Booking Conflict Handling

- Detect booked slots inside Availability Management
- Show patient summary on booked slots
- Prevent silent blocking of booked slots
- View booked patient details
- Reschedule patient directly from booked slot
- Block original slot after rescheduling

### Phase 6: Patient Records and Treatment History

#### Phase 6A: Patient Records Database

- Create patients table
- Create patient_visits table
- Link bookings to patients
- Match returning patients primarily by phone number
- Use email as secondary identifier
- Update TypeScript database types

#### Phase 6B: Patient Records Admin UI

- Admin patient records page
- Search patients by name, phone, or email
- Show patient profile
- Show booking and visit history
- Protect patient records inside admin only

#### Phase 6C: Visit Notes and Treatment Updates

- Add doctor visit notes
- Add prescribed medicines
- Add treatment duration
- Add follow-up instructions
- Update patient condition/history

#### Phase 6D: Connect Booking Flow to Patient Records

- Automatically create or match patient records when a booking is made
- Match returning patients primarily by phone number
- Use email as an optional secondary identifier
- Save patient_id on each booking
- Backfill existing bookings into patient records where possible
- Show New Patient / Returning Patient indicators in the admin booking dashboard
- Show previous visit count for returning patients
- Link booking history and treatment history under each patient profile
- Allow doctor/admin to start a checkup from a confirmed booking
- Link visit notes to both patient_id and booking_id where applicable
- Add Save Visit and Save Visit & Complete Appointment workflow
- Keep the booking table clean by showing only a primary View action
- Move booking actions into the View Details panel to avoid clutter, especially on mobile
- Keep all patient records and checkup workflows admin-only

#### Phase 6D-fix: Booking-linked Checkup Workflow

- Improve the checkup workflow so each booking normally has one linked visit/checkup record
- Make "View Patient Record" open the exact patient record automatically
- Show "Start Checkup" only when a confirmed booking has no linked visit record
- Show "Continue Checkup" when a booking already has a linked visit record
- Load existing visit details when continuing a checkup
- Make "Save Visit" update the existing booking-linked visit instead of creating duplicate visits
- Keep booking status as confirmed when using "Save Visit"
- Make "Save Visit & Complete Appointment" update the visit record and mark the booking as completed
- Show active bookings inside each patient record
- Allow Start/Continue Checkup from the patient record page
- Keep "Add Visit" inside Patient Records for general/manual history entries
- Allow doctor/admin to edit an existing visit record from Patient Records
- Allow doctor/admin to edit a booking-linked visit after an appointment is completed
- Editing a completed visit should not change the booking status
- Show last updated date/time for visit records where available
- Keep all checkup and patient history workflows admin-only

#### Phase 6E: Patient Identity and Record Merge

- Improve long-term patient identity handling beyond phone-only matching
- Add duplicate patient detection using phone, email, similar name, and optional date of birth
- Allow admin to manually link a booking to an existing patient
- Allow admin to update patient phone/email safely
- Allow admin to merge duplicate patient records
- Preserve all bookings and visit history when merging patient records
- Add patient identity notes, for example "Uses son's phone number"
- Normalize phone numbers before matching where possible
- Keep patient identity management admin-only

#### Phase 6E-fix: Patient Identity Safety and Duplicate Review

- Phone number must not be treated as a guaranteed patient identity
- Phone number is a contact method, not a unique patient identity
- Multiple patients may share the same phone number, for example family members using one contact number
- The system must never automatically merge patient records based on phone number alone
- The system must never silently overwrite patient name, phone, email, notes, or identity notes during booking creation
- New bookings should create or link patient records safely using a combination of phone, email, name similarity, and optional date of birth
- If the same phone number is used with a clearly different patient name, the system should keep the records separate and flag the case for admin review
- Potential duplicate or shared-contact cases should be shown clearly in admin with badges such as Possible Duplicate, Shared Phone, or Needs Review
- Duplicate detection should suggest possible matches using same phone, same email, similar name, and optional date of birth
- Admin/doctor should manually decide whether to keep records separate, link a booking to an existing patient, or merge patient records
- Manual patient merge must preserve all bookings and visit history
- Bookings must not be deleted automatically during patient merge
- If a merge creates multiple active bookings for one patient, the patient record should show a warning and allow admin to cancel or reschedule duplicate active bookings
- Patient profile should clearly separate General Patient Notes from Identity / Contact Notes
- Booking detail panels should show View Patient Record for every linked booking, not only completed bookings
- If a booking is not safely linked to a patient, the system should show Link to Patient instead
- Patient record links should open the exact patient automatically
- Active booking cards inside Patient Records should stay clean and mobile-friendly
- For confirmed active bookings inside Patient Records, show a primary Start Checkup button, or Continue Checkup if a booking-linked visit already exists
- Confirmed active bookings should also show a View button for booking details and secondary actions
- Pending, completed, and cancelled active bookings inside Patient Records should show only one primary View button
- Secondary active booking actions should appear inside the View Booking modal/panel
- The Patient Records View Booking modal/panel should not show View Patient Record because the doctor is already inside that patient record
- The Patient Records View Booking modal/panel should show status-specific actions:
  - Pending: Confirm, Cancel, Reschedule
  - Confirmed: Reschedule, Cancel
  - Completed: View/Edit Visit
  - Cancelled: Restore, and Reschedule only after restore fails
- Public booking phone validation should accept common real-world formats, including spaces, dashes, and country codes
- Phone normalization should be consistent across booking creation, patient search, and duplicate detection
- Booking-linked visits should default to the appointment date, and if a visit date differs from the booking date, both should be shown clearly
- All patient identity management must remain admin-only

#### Phase 6F: Ayurveda Education Page

- Add an educational Ayurveda section to the homepage after About and before Services
- Keep the homepage Ayurveda section short, with a clear link to the full `/ayurveda` page
- Create a dedicated public `/ayurveda` page for the full educational content
- Use `CONTENT_AYURVEDA.md` as the source of truth for Ayurveda content
- Use the image at `/public/images/ayurveda/doshas-chart.png`
- Place the doshas chart image after the “Understanding the Three Doshas” section
- Use Next.js Image with clear alt text: “Ayurveda five elements and three doshas chart”
- Explain Ayurveda as “The Science of Life” and a holistic approach to mind, body, and spirit
- Explain the five elements: Space, Air, Fire, Water, and Earth
- Explain the three Doshas: Vata, Pitta, and Kapha
- Explain Prakriti as natural constitution and Vikriti as current imbalance
- Present long content in readable sections, cards, and accordions
- Keep the design calm, professional, accessible, and easy for all age groups
- Add a consultation CTA at the bottom

### Phase 6G: Privacy policy and Terms of Service

- Add a privacy policy page
- Add a terms of service page
- Add links to these pages in the footer

#### Phase 6H: Booking and Patient Record Workflow Improvements

- Add cancellation reason support when cancelling a booking
- Add cancellation reason presets and optional custom reason
- Store cancellation reason on the booking record
- Store cancelled_at timestamp where useful
- Show cancellation reason in the Cancelled tab and booking details
- Show cancellation reason inside patient booking history
- Add manual patient search inside duplicate review area
- Allow doctor/admin to search by name, phone, email, or date of birth
- Allow doctor/admin to manually compare patient records before merging
- Allow doctor/admin to keep records separate if they are not the same person
- Improve duplicate review wording so it is clear these are suggestions only

#### Phase 6I: Walk-in Patient Registration and Visit Records

- Add walk-in patient support for patients who visit the clinic without booking an appointment online
- Add an “Add Patient” button inside `/admin/patients`
- Allow admin/doctor to manually create a patient profile
- Patient profile fields should include name, phone, optional email, optional date of birth, General Patient Notes, Identity / Contact Notes, and identity status where useful
- Add an “Add Walk-in Visit” flow for patients seen without a scheduled booking
- Allow admin/doctor to search for an existing patient before creating a new patient
- Allow admin/doctor to create a new patient and add a visit record in one flow
- Walk-in visits should be saved in `patient_visits`
- Walk-in visits should use `booking_id = null`
- Walk-in visits should not require appointment booking or available slot selection
- Walk-in visits should appear clearly in Visit History
- Walk-in visit records should remain editable
- Patient identity duplicate warnings and manual merge tools should remain available
- Keep all walk-in patient and visit features admin-only

#### Phase 6J: Staff Profiles, Doctor Reference, Roles, and Permissions

- Plan staff and admin user roles
- Create staff profiles linked to Supabase Auth users
- Add roles such as owner, doctor, receptionist, inventory manager, and content editor
- Add admin user management page
- Allow owner/super admin to invite or create staff users
- Add role-based access control for admin sections
- Add doctor reference to patient visits
- Store doctor_id and doctor_name_snapshot on visit records
- Show treated-by doctor name in patient visit history
- Add profile/settings page for admin users
- Add password change or password reset flow
- Protect sensitive patient records based on role

#### Phase 6K: Real BS/AD Calendar Support

- Implement real Nepali BS/AD calendar support for the booking system
- BS should be the default patient-facing calendar mode
- AD should remain available through a toggle
- AD date should remain the database source of truth for querying and slot logic
- BS date should be shown clearly for Nepali users and stored where useful for display/reference
- Booking, admin dashboard, patient records, availability management, and rescheduling should continue working with AD internally while showing BS/AD dates clearly to users

#### Phase 7: Staff Profiles, Doctor Reference, Roles, and Permissions

- Add staff profiles linked to Supabase Auth users
- Support roles: owner, doctor, receptionist, inventory_manager, and content_editor
- Keep the first/current admin as owner/super admin
- Add role-based access control for existing admin sections
- Owner can manage staff users and roles
- Inactive staff should not be able to use admin tools
- Add doctor reference to patient visit records
- Store both doctor_id and doctor_name_snapshot for patient visit history
- Show treated-by doctor name in patient history
- Add a staff profile/settings area
- Keep the current admin login flow working
- Keep patient records protected and visible only to allowed roles
- Implement this phase in smaller sub-phases:
  - 7A: Staff profiles database
  - 7B: Staff profile helper and role guards
  - 7C: Staff management UI
  - 7D: Doctor reference in patient visits

#### Phase 8: Real BS/AD Calendar Support

- Add real Nepali Bikram Sambat (BS) and Gregorian AD calendar support across the booking system
- Decide whether to use a reliable package such as `nepali-date-converter` or a custom BS/AD conversion utility
- Make BS the default calendar mode on the public booking page
- Keep AD calendar mode available through a clear BS/AD switch
- Show selected appointment dates in both BS and AD so Nepali patients and clinic staff can understand the date clearly
- Keep `appointment_date_ad` as the source of truth in Supabase for querying, slot matching, and date logic
- Store `appointment_date_bs` as a display/reference value in bookings
- Update available slot display so patients can choose appointment dates easily in BS while the system still uses AD internally
- Populate or calculate `slot_date_bs` for available slots where useful
- Ensure `/api/slots?date=YYYY-MM-DD` continues to use AD internally for reliability
- Update admin dashboard, patient records, booking history, rescheduling, and availability management to show BS and AD dates where helpful
- Keep all existing booking, rescheduling, availability blocking, patient records, and admin workflows working after BS/AD support is added
- Test booking, rescheduling, availability blocking, patient records, booking history, and specialist scheduling with BS/AD dates
- Keep the UI simple, readable, and accessible for patients of all age groups

### Phase 9: Visiting Specialists

- Public specialists page
- Specialist cards
- Homepage specialists preview
- Specialists API
- Admin specialists management
- Specialist CRUD

#### Phase 9A: Specialist Detail Page

- Add a public specialist detail page at `/specialists/[id]`
- Allow patients to read more about a visiting specialist before booking
- Add specialist profile details such as bio, qualifications, experience, work history, treatment areas, languages spoken, gender, license/registration number, consultation mode, visit location, public note, preparation note, and optional profile image
- Add `display_order` so specialists can be manually ordered in public listings
- Use simple numeric display order first; drag-and-drop ordering can be added later as a polish improvement
- Allow admin to paste a specialist photo URL and optionally upload a specialist photo from the computer if Supabase Storage is configured
- Store the final image URL in `profile_image_url`
- Show a professional initials/avatar placeholder when no doctor image is available
- Add visit location so patients know where the specialist will be available
- Show preparation notes so patients know what to bring or how to prepare
- Show languages spoken so patients can choose a comfortable doctor
- Add View Profile button on specialist cards
- Show specialist visit date clearly in BS and AD
- Show consultation fee or Free Consultation clearly
- Keep inactive specialists hidden from public pages
- Add a “Specialist booking coming soon” CTA until Phase 9B is built
- Keep booking specialist appointments for Phase 9B

#### Phase 9B: Specialist Public Booking Flow

- Allow patients to book appointments with active visiting specialists
- Add a specialist-specific booking route, such as `/specialists/[id]/book`
- Add Book Specialist buttons on active specialist cards and specialist detail pages
- Specialist booking should show the selected specialist’s name, specialization, treatment type, visit date in BS and AD, available time window, visit location, consultation mode, consultation fee/free status, and preparation note where useful
- Specialist booking should use the specialist visit date automatically and should not allow the patient to select a different date
- Specialist bookings should not use the global regular `available_slots` table
- Specialist time slots should be generated from the specialist’s `available_from`, `available_to`, and `slot_duration_minutes`
- Add `slot_duration_minutes` to specialist visits, with 30 minutes as the default
- Add optional `max_patients` to specialist visits for daily/session capacity control
- Prevent double booking for the same specialist, date, and time
- Allow different specialists to be booked at the same time
- Allow regular doctor bookings and specialist bookings at the same time
- Prevent booking inactive specialists
- Prevent booking past specialist visit dates
- Prevent booking when the specialist maximum patient limit is reached
- Specialist bookings should save `booking_type = specialist` and the selected `specialist_id`
- Specialist bookings should save appointment date/time, `appointment_date_ad`, and `appointment_date_bs` correctly
- Specialist booking should reuse the existing patient creation/linking and patient identity safety logic
- Regular booking flow must continue working separately

#### Phase 9C: Specialist Booking Admin Management

- Add a dedicated admin specialist bookings page, such as `/admin/specialist-bookings`
- Main admin dashboard should continue showing specialist bookings with clear Specialist badges and specialist names
- Specialist bookings should be grouped automatically by specialist doctor
- Each specialist group should show doctor details, visit date in BS and AD, location, available time window, consultation fee/free status, and booking counts by status
- Admin should be able to filter specialist bookings by specialist doctor, date, status, and patient name/phone
- Specialist bookings should support the normal appointment workflow: pending, confirmed, cancelled, and completed
- Specialist bookings should support cancellation reasons
- Admin should be able to confirm, cancel, complete, restore, and reschedule specialist bookings where appropriate
- Specialist rescheduling should use available times from the same specialist visit/session and must prevent double booking
- Admin should be able to open the linked patient record from a specialist booking
- Doctor/admin should be able to start or continue checkup from a specialist booking
- Specialist visit/checkup notes should be saved into patient history
- Patient records should clearly show specialist appointment details in booking history
- Visit History should clearly identify specialist-linked visit records
- Doctor reference should continue working for specialist visit records
- Regular booking dashboard workflow, walk-in workflow, patient records, and standard status actions must continue working
- Old specialist bookings should remain readable even if the specialist is later deactivated or removed
- Specialist walk-in patients and specialist-only staff access should be handled in a later phase

#### Phase 9D: Specialist Walk-in Queue

- Allow admin to add walk-in patients under a specific specialist visit
- Add both a universal “Add Specialist Walk-in” action and specialist-group-level “Add Walk-in Patient” action
- Use one shared specialist walk-in modal/form so the workflow stays consistent
- The universal button should allow admin to choose the specialist visit from a dropdown
- The specialist-group button should pre-select that specialist visit automatically
- Specialist walk-ins should always belong to one selected specialist visit
- Specialist walk-ins should appear directly under the selected specialist’s queue/group
- The walk-in form should show selected specialist details including specialist name, specialization, treatment type, BS/AD visit date, available time window, visit location, consultation fee/free status, and consultation mode
- Admin should be able to search existing patients by name, phone, email, or date of birth
- Admin should be able to select an existing patient or create a new patient if no match is found
- The new patient form should follow the existing Patient Records Add Patient layout with full name, phone, optional email, optional date of birth, General Patient Notes, and Identity / Contact Notes
- Patient identity safety rules should continue working for specialist walk-ins
- Specialist walk-ins should include a Problem / Reason for Visit field
- Specialist walk-ins should not require online slot selection
- The system should use the current time as the default walk-in time, with optional manual time adjustment if practical
- If `booking_source` is added, specialist walk-ins should use `booking_source = walk_in`
- Public specialist bookings may use `booking_source = online` where useful
- Add to Queue should create a confirmed specialist walk-in booking without clinical notes
- Specialist walk-in bookings should be saved in the `bookings` table with `booking_type = specialist`, selected `specialist_id`, selected or created `patient_id`, specialist visit date, and walk-in time
- Specialist walk-ins should be clearly labelled in Specialist Bookings, Dashboard, and Patient Records booking history
- Online specialist bookings and walk-ins should appear together inside the selected specialist group, ordered by time
- Cancelled specialist walk-ins should restore directly to confirmed because they do not use slot blocking
- Online specialist booking restore should continue checking specialist slot availability
- Owner/admin should keep full access to all specialist bookings for now
- Specialist-specific restricted access should be handled later in an advanced permissions phase
- Regular walk-in visits, online specialist bookings, and regular bookings should continue working


#### Phase 9E: Specialist Walk-in Checkup Integration

- Add an “Add & Start Checkup” action to the specialist walk-in workflow
- Add & Start Checkup should create the specialist walk-in booking and then open the existing specialist checkup form directly
- The checkup form should be linked to the specialist walk-in booking
- The checkup form should pre-fill visit date, walk-in time where useful, patient problem/reason, and specialist context
- The checkup form should clearly show specialist name, specialization, treatment type, visit location, and booking source as Walk-in
- Save Visit should create or update a patient visit record linked to the specialist walk-in booking while keeping the booking confirmed
- Save Visit & Complete should create or update the visit and mark the specialist walk-in booking completed
- Continue Checkup should work for specialist walk-ins with existing visit records
- Completed specialist walk-ins should allow View/Edit Visit where appropriate
- Specialist walk-in checkup details should be saved into the same patient history system
- Visit History should clearly label specialist walk-in visits
- Patient Visit History should show specialist name and walk-in time where useful
- Doctor reference should continue working for specialist walk-in visit records using `doctor_id` and `doctor_name_snapshot`
- Specialist walk-in visit records should remain linked to the patient, booking, and specialist booking context
- Add to Queue workflow from Phase 9D should continue working
- Online specialist booking checkups, regular checkups, regular walk-ins, patient records, and visit editing should continue working

#### Phase 10A: Blog Database and Admin Blog Management

- Add a professional blog system for health education, Ayurveda knowledge, clinic news, specialist advice, and SEO content
- Create a `blog_posts` table with fields for title, slug, excerpt, content, cover image, cover image alt text, category, tags, author, reviewed by, status, published date, reading time, medical disclaimer, SEO title, SEO description, featured flag, created date, and updated date
- Support draft, published, and archived blog post statuses
- Create admin blog management pages for viewing, creating, editing, publishing, and archiving blog posts
- Use a Markdown content editor with live preview instead of a full rich text toolbar
- Support safe Markdown formatting for headings, bold text, italic text, bullet lists, numbered lists, links, quotes, and paragraphs
- Add one Reading Time field; if left empty, reading time should be calculated automatically from the content, and if filled, the admin-entered value should be shown
- Add optional author name and reviewed by fields to build trust for health content
- Add a default medical disclaimer, while allowing admin to replace it with a custom disclaimer per post
- Add a featured flag, but keep featured posts the same card size as normal posts
- Only one blog post should be featured at a time; marking a post as featured should remove featured status from other posts
- Add cover image URL support and cover image upload support using Supabase Storage if practical
- Keep cover image URL as a fallback even if upload is added
- Do not build comments, likes, ratings, or public user accounts in this phase

#### Phase 10B: Public Blog Pages, SEO, and Sharing

- Create public blog listing page at `/blog`
- Create public blog detail page at `/blog/[slug]`
- Show only published blog posts publicly
- Blog listing should show same-size blog cards with cover image, category badge, featured badge where applicable, title, excerpt, author if available, reading time, published date, and Read More link
- Add search and category filtering to the blog listing page
- Homepage blog preview should show three posts total: the newest featured published post first if available, then newest published posts; if no featured post exists, show the three newest published posts
- Featured posts should use an attractive Featured badge only and should not use a different large layout
- Blog cards should have subtle professional hover animations such as slight lift, stronger shadow, and image zoom without layout shift
- Blog detail page should use a professional article layout with article content on the left and recent posts sidebar on the right on large screens
- On mobile, the blog detail page should move recent posts below the article
- Blog detail pages should show title, category, author if available, reviewed by if available, published date, reading time, cover image, article content, medical disclaimer, share buttons, related posts, and booking CTA
- Add WhatsApp, Facebook, and Copy Link sharing
- Copy Link should show a clear copied confirmation
- Add recent posts and related posts to help users discover more health content
- Add CTA from blog articles to the booking page
- Add SEO metadata and OpenGraph data for blog listing and detail pages
- Use SEO title and SEO description where available, otherwise fall back to blog title and excerpt
- Use cover image for OpenGraph image where available
- Render Markdown content with clean readable typography for headings, paragraphs, lists, quotes, and links
- Keep the public blog design clean, readable, mobile responsive, and professional
- Do not build comments, likes, ratings, or public user accounts in this phase

#### Phase 11: Private Counselling Booking

- Add a dedicated public private counselling page at `/private-counselling`
- Add a homepage section/card for Private & Confidential Counselling
- Place the homepage private counselling section after “What We Treat” and before “Visiting Specialists”
- Do not modify the existing “What We Treat” cards in this phase
- Use the existing booking system instead of creating a separate booking engine
- Add a private counselling option inside the normal booking form
- When patients arrive from the private counselling page, the booking form should automatically enable counselling mode
- Counselling mode should show extra fields for consultation method, privacy preference, payment preference, and brief concern/reason
- Consultation method should support phone call, video call, and in-person
- Privacy preference should allow patients to request minimal/private details
- Payment preference should prepare for pay now, pay later, or pay on visit
- Full payment gateway integration should be handled later in the checkout/payment phase
- Counselling bookings should be saved in the existing `bookings` table using `booking_type = counselling`
- Counselling booking details should be clearly labelled in the admin dashboard and patient records
- Admin dashboard should include a Counselling filter/tab
- Booking detail views should show consultation mode, privacy preference, payment preference, payment status, and brief concern/reason
- Booking success screen should show a clear next-step message depending on payment preference
- The normal booking flow must continue working for patients who do not select counselling
- The counselling form should be respectful, privacy-focused, and should not force patients to describe sensitive issues in detail
- Doctor/admin checkup workflow should continue working for counselling bookings

#### Phase 12A: Product Catalogue and Admin Product Management

- Build the medicine shop foundation with a product catalogue and admin product management
- Create a `products` table with product details, pricing, stock, image, consultation requirement, delivery/pickup availability, and active/featured status
- Include explicit Supabase GRANT statements and RLS policies for the products table because Supabase Data API access now requires explicit grants for new tables
- Public users should see only active public products
- Hidden or inactive products should not be exposed publicly
- Admin should be able to create, edit, activate/deactivate, feature, and manage stock for products
- Product images should support image URL and upload from computer using Supabase Storage if practical
- Public shop page should be available at `/shop`
- Public product detail pages should be available at `/shop/[slug]`
- Product detail pages are important for user trust, SEO, usage instructions, ingredients, warnings, and consultation-required information
- Product cards should show image, name, category, short description, price, sale price where available, stock status, consultation-required badge, and View Details button
- Shop should support product search and category filtering
- Medicine safety disclaimers should appear on shop/product pages
- Avoid strong medical claims such as “cures” or “guaranteed result”
- Cart, order submission, payment, and analytics should not be built in Phase 12A

#### Phase 12B-1: Cart and Order Request Foundation

- Add cart functionality using localStorage so cart items persist in the same browser until the customer submits or clears the cart
- Create `orders` and `order_items` tables with explicit Supabase GRANT statements and RLS policies to protect customer/order data
- Public users should not directly read customer names, phone numbers, addresses, order contents, or payment details
- Order requests should be submitted through secure server-side API routes
- Cart page should allow customers to update quantity, remove products, and choose collect from shop or home delivery
- Delivery address should only be required for home delivery
- Pickup should show clinic/shop location and opening hours where available
- Products can control whether delivery or pickup is allowed
- If any cart item cannot be delivered, home delivery should be disabled with a clear explanation
- If any cart item requires consultation, order should be marked as needs review and admin/doctor should confirm before sale
- Save order-level details in `orders` and product snapshots in `order_items`
- Stock should not reduce in this phase; stock reduction will happen when admin confirms orders in Phase 12B-2
- Full payment gateway should not be built in Phase 12B-1

#### Phase 12B-2: Admin Order Management and Stock Workflow

- Admin should have an order history page to view orders, customer details, order items, fulfillment method, payment status, and order status
- Admin should be able to confirm, cancel, mark ready for pickup, mark out for delivery, and complete orders
- Stock should reduce when admin confirms an order, not when the customer first submits it
- Stock should restore if a confirmed order is cancelled
- Admin should still be able to manually update stock from product management
- Do not build a separate customer CRM page in this phase; order history acts as the first version of customer records
- Full payment gateway should not be built in Phase 12B-2

#### Phase 12C: Shop Analytics and Stock Insights

- Add shop analytics and stock insights for admin decision-making
- Analytics should use confirmed/completed order data where appropriate
- Show summary cards for total orders, pending orders, completed orders, total sales value, low stock products, out-of-stock products, and consultation-required order requests
- Show best-selling products and slow-moving products
- Show low-stock and out-of-stock alerts
- Show sales trends by day, week, month, and year where practical
- Show category performance, pickup vs delivery breakdown, and consultation-required product request count
- Add date range filters such as today, this week, this month, this year, and custom range if practical
- Use lightweight charts where practical
- Keep analytics efficient by avoiding loading unnecessary full order details when summary data is enough
- Payment gateway should not be built in Phase 12C

#### Phase 12D: Admin Layout and Settings Shell

- Refactor the admin area into a scalable admin layout before building manual payments and email settings
- Remove the public website navbar from admin pages so the admin area feels like a dedicated internal system
- Replace the crowded admin top navigation row with a reusable sidebar navigation
- Sidebar navigation should include Dashboard, Patients, Bookings, Availability, Specialists, Specialist Bookings, Blog, Shop, Orders, Staff, and Settings
- Admin pages should have a consistent page header area for title, description, and page-specific actions
- Desktop admin layout should use a sidebar, with optional collapsible/icon-only behaviour where practical
- Mobile admin layout should use a drawer menu that overlays the page and does not push content down
- Admin email/account information and Logout should live in the sidebar/footer area
- Create a `/admin/settings` shell with tabs for Clinic Info, Payment Methods, Email Settings, Admin Notifications, Shop Settings, SEO / Metadata, Security & Account, and System Settings
- Settings tabs should be placeholders in this phase so Phase 13 can build Payment Methods and Email Settings cleanly
- Do not build payment settings, email settings, password reset/change password, or role permissions in Phase 12D
- Do not change database schema in Phase 12D
- Existing admin features and protected routes must continue working

#### Phase 13A: Manual Payment Settings and Receipt/Invoice System

- Replace direct online payment gateway integration with a manual payment workflow for the first production-ready version
- Do not integrate eSewa, Khalti, or card payment gateway in this phase because gateway fees, onboarding, settlement, and delivery-fee uncertainty make manual payment safer for launch
- Create admin-managed payment methods so the doctor/admin can add bank accounts, wallet details, QR codes, and payment instructions without editing code
- Support multiple enabled payment methods at the same time, such as one bank account and one wallet/QR option
- New receipts and invoices should show all currently enabled payment methods
- Old receipts and invoices should preserve a payment method snapshot from the time the order or booking was created, so later payment setting changes do not alter old payment instructions
- Add clear order and booking reference numbers for payment remarks, such as ORD, REG, SPEC, and PRIV references
- Patients should be instructed to include their order or booking reference number in bank/wallet payment remarks
- Payment should only be considered confirmed after doctor/admin verification
- Admin should be able to manually update payment status, payment notes, paid amount, and payment reference where practical
- Shop order receipts should include customer details, product details, quantities, prices, subtotal, delivery fee where applicable, estimated/final total, payment status, and payment instructions
- Booking receipts should include patient details, appointment details, service/booking type, payment status, and payment instructions
- Delivery orders should instruct patients not to pay until admin confirms delivery fee and final total
- Consultation-required medicine orders should instruct patients not to pay until consultation review and admin confirmation
- Receipts should be printable/downloadable from the confirmation screen and accessible from admin order/booking details
- Do not build online payment gateway in this phase
- Do not deploy to Vercel in this phase

#### Phase 13B: Email Notifications with Resend

- Add Resend email service setup for order and booking notifications
- Send confirmation emails to customers/patients when an email address is provided
- Send notification emails to doctor/admin for new shop orders and bookings
- Email content should include the order or booking reference number, relevant order/appointment details, payment status, manual payment instructions, enabled payment method snapshot where relevant, and clinic contact details
- Private counselling emails should avoid exposing unnecessary sensitive details
- Email failure should not block order or booking creation
- Email errors should be logged safely without exposing sensitive customer/patient details
- The admin should still see all orders and bookings even if email delivery fails

#### Phase 13C: OpenGraph Metadata and Final Content Polish

- Add or improve OpenGraph metadata for public pages including homepage, shop, product detail pages, blog listing, blog detail pages, and specialist pages where appropriate
- Add page titles and descriptions where missing
- Improve alt text and basic accessibility on touched pages where practical
- Keep this as a lightweight content/metadata polish phase
- Do not run the final deployment accessibility audit in this phase
- Do not deploy to Vercel in this phase

#### Phase 15: Supabase Grants and RLS Audit

- Audit all existing Supabase public schema tables for the newer Supabase Data API grant behaviour
- Add explicit GRANT statements to existing tables so the app remains compatible with Supabase’s upcoming grant enforcement
- Categorize tables as public-readable, admin-only/private, or mixed public/private before applying grants
- Public-readable tables should only expose safe public content through RLS policies
- Patient, booking, staff, order, and clinical data must not be exposed to anonymous users
- Service role access should remain available for trusted server-side API routes
- Verify RLS policies protect private data
- Test public booking, admin dashboard, patient records, specialist booking, blog, and shop after applying grants
- Review Supabase Security Advisor before deployment