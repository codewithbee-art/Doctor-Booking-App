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
Phase 6: Complete (6A database, 6B admin patients UI, 6C visit notes, 6D booking-patient linking + checkup flow, 6D-fix booking-linked checkup workflow, 6E patient identity + record merge, 6E-fix patient identity safety, 6F Ayurveda education page, 6G Privacy policy and Terms of Service, Current: Phase 6H Booking and Patient Record Workflow Improvements)
Phase 7: Not started
Phase 8: Not started  
Phase 9: Not started  
Phase 10: Not started  

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

#### Phase 6I: Staff Profiles, Doctor Reference, Roles, and Permissions

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


#### Phase 6J: Real BS/AD Calendar Support

- Implement real Nepali BS/AD calendar support for the booking system
- BS should be the default patient-facing calendar mode
- AD should remain available through a toggle
- AD date should remain the database source of truth for querying and slot logic
- BS date should be shown clearly for Nepali users and stored where useful for display/reference
- Booking, admin dashboard, patient records, availability management, and rescheduling should continue working with AD internally while showing BS/AD dates clearly to users

### Phase 7: Visiting Specialists

- Public specialists page
- Specialist cards
- Homepage specialists preview
- Specialists API
- Admin specialists management
- Specialist CRUD

### Phase 8: Blog

- Blog listing page
- Blog detail page
- Blog cards
- Blog API
- Admin blog management
- Create/edit blog posts
- Rich text editor
- SEO metadata

### Phase 9: Medicine Shop

- Shop page
- Product detail page
- Product cards
- Cart functionality
- Products API
- Admin shop management
- Sales/order history
- Product CRUD

### Phase 10: Checkout, Emails, SEO, Deployment

- Nepal payment gateway setup: eSewa, Khalti, or direct bank card
- Checkout API
- Orders and order items
- Resend email setup
- Booking confirmation email
- Doctor notification email
- OpenGraph metadata
- Accessibility checks
- Vercel deployment