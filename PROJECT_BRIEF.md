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
Phase 6: In progress (6A database, 6B admin patients UI — search, list, detail with bookings + visits)  
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