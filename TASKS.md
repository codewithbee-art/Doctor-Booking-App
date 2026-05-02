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
- [ ] Add real environment variables to .env.local (manual)
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
- [ ] Commit Phase 3B to Git
- [ ] Connect real Supabase slots (Phase 4)
- [ ] Connect real booking insert API (Phase 4)
- [ ] Run npm run build successfully (Phase 4)
- [ ] Commit Phase 4 to Git

## Phase 4: Booking API

- [ ] Create /api/slots route
- [ ] Create /api/bookings route
- [ ] Validate booking data
- [ ] Insert booking into Supabase
- [ ] Mark selected slot as booked
- [ ] Prevent double booking
- [ ] Run npm run build successfully
- [ ] Commit Phase 4 to Git

## Phase 5: Admin Authentication

- [ ] Create admin login page
- [ ] Connect Supabase Auth
- [ ] Protect admin routes
- [ ] Add logout
- [ ] Run npm run build successfully
- [ ] Commit Phase 5 to Git

## Phase 6: Admin Booking Dashboard

- [ ] Create dashboard layout
- [ ] Add booking stats
- [ ] Add bookings table
- [ ] Add filters
- [ ] Add search
- [ ] Add status update API
- [ ] Add optimistic UI update
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
- [ ] Add product CRUD
- [ ] Run npm run build successfully
- [ ] Commit Phase 9 to Git

## Phase 10: Checkout, Emails, Deployment

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