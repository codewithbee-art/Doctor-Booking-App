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
Phase 5: In progress (5A–5C complete; 5D availability management done)  
Phase 6: Not started  
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

### Phase 2: Supabase Setup

- Add Supabase client files
- Add SQL schema
- Add seed SQL
- Add environment examples

### Phase 3: Public Booking System

- Build booking page
- Add date selection
- Add time slot selection
- Add patient details form
- Add booking confirmation UI

### Phase 4: Booking API

- Add slots API
- Add booking creation API
- Mark slots as booked
- Add validation and error handling

### Phase 5: Admin Authentication

- Add admin login
- Add protected admin routes
- Add logout

### Phase 6: Admin Booking Dashboard

- Show booking stats
- Show booking table
- Add filters
- Add search
- Add status update actions

### Phase 7: Visiting Specialists

- Public specialists page
- Specialists preview on homepage
- Admin specialist management

### Phase 8: Blog

- Blog listing page
- Blog detail page
- Admin blog management
- Blog editor

### Phase 9: Medicine Shop

- Product listing page
- Product detail page
- Cart
- Admin inventory management

### Phase 10: Checkout, Emails, SEO, Deployment

- Stripe checkout
- Orders
- Resend email notifications
- SEO metadata
- Final responsive polish
- Vercel deployment

## Git Workflow

After every completed phase:
- Run npm run lint
- Run npm run build
- Commit only if both pass
- Use clear commit messages like:
  - Phase 1A: initial project setup
  - Phase 1B: add layout and homepage skeleton
  - Phase 2A: add Supabase schema

  Do not commit automatically unless I ask. At the end, tell me the exact git commands to run.