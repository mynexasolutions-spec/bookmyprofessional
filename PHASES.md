# BookMyProfessional — Build Phases

**Status:** all 10 phases have been implemented in code and `supabase/schema.sql` is applied to the live project (13 tables, RLS verified enforced, private storage bucket, seed data + triggers).

Legend: `- [x]` = done · `- [ ]` = not done (gap noted inline)

**Stack**
- **Supabase** — Postgres, Auth, Row Level Security, Storage, triggers. (`Realtime` / `Edge Functions` not yet used.)
- **ImageKit** — image delivery helper (`src/lib/imagekit.js`); uploads/CDN wiring still minimal.

---

## Phase 1 — Technical Foundation
- [x] Stand up the Supabase project (database, auth, storage, RLS) — applied & verified
- [x] Define full database schema + migrations (`supabase/schema.sql`, idempotent)
- [x] Build a data-access layer between frontend and Supabase (`src/lib/data/*`)
- [x] Replace mock data with server state (with mock fallbacks where tables are empty)
- [x] Secure every table with Row Level Security policies (13/13 tables)
- [x] Input validation + error handling at trust boundaries (try/catch fallbacks, admin re-checks)
- [x] Environment management (`.env`, `.env.example`)
- [ ] Automated testing (unit, integration, e2e) — none
- [ ] Deployment pipeline (Vercel / hosting) + dev/staging/prod environments
- [ ] Performance & SEO hardening (ImageKit transformations, sitemap, structured data) — only a URL helper so far
- [x] Data layer designed so a future mobile app can reuse the same Supabase backend
- [ ] Technical documentation (architecture, API, runbook) — only schema comments + this file

---

## Phase 2 — Location-Based Search (Geo)
- [x] Create `locations` table (city, region, country, lat, lng) — seeded with 5 cities
- [x] Add `latitude` / `longitude` columns to professional profiles
- [ ] Integrate a geocoding / autocomplete provider — city list only, no provider
- [x] Replace the static `locations` array with DB-backed options
- [ ] Radius / "near me" search (PostGIS) — city match + JS haversine only
- [ ] Browser geolocation auto-detect — deliberately skipped
- [x] Persist the customer's default location to their profile
- [x] Sort directory results by distance when a location is set

---

## Phase 3 — Authentication & Sessions
- [x] Set up Supabase Auth (email + password, email confirmation)
- [x] Secure password storage and reset flow (mock screen removed)
- [ ] OAuth providers (Google, Apple, LinkedIn) — buttons show a "not enabled" toast
- [x] `profiles` table linked to `auth.users` with a `role` column + signup trigger
- [x] Persist sessions (Supabase session + refresh token)
- [x] Protect routes with middleware (`/dashboard`, `/vendor`, `/admin`)
- [x] Server-side role checks (admin page gate + admin API routes)
- [x] Row Level Security policies per role
- [x] Wire `login`, `signup`, `logout` to real Supabase calls
- [x] Session expiry / "remember me" handling (Supabase default)

---

## Phase 4 — Professional Onboarding, Verification & Admin Approval
- [x] Real document upload (ID proof, license, insurance) to private Storage bucket
- [x] Remove auto-verify logic
- [x] Create `documents` table (owner, type, file path, status, reviewer, timestamps)
- [x] Add `verification_status` (`pending` | `approved` | `rejected`) on professionals
- [x] Default new professionals to `pending` and hide them from the public directory
- [x] Build admin review queue (approve / reject) — in the admin panel
- [ ] Notify the professional on approval / rejection — no email channel yet
- [x] Restrict document access to owner + admin
- [ ] Profile completeness gating before submission for review

---

## Phase 5 — Professional Directory (Real Data + Availability Filter)
- [x] Create `professionals` + `services` tables (categories = distinct query, no separate table)
- [ ] Migrate `INITIAL_PROFESSIONALS` seed data into Supabase — not seeded yet (directory uses the mock fallback)
- [ ] Server-side queries + pagination — filtering is still client-side
- [x] Add an **availability** filter (by day / time slot)
- [ ] Category & service management (admin CRUD) — not built
- [ ] Full-text search with relevance ranking — client-side substring match
- [x] Profile detail pages backed by real records
- [ ] Cache / paginate results for performance
- [x] Keep only approved + active professionals in public results

---

## Phase 6 — Booking & Scheduling Engine
- [x] Create `bookings` table (customer, professional, service, slot, address, status, payment link)
- [x] Availability stored per professional (`professionals.availability` jsonb — no separate table)
- [ ] Slot generation from working hours — only taken-slot lookup so far
- [x] Prevent double-booking at the database level (`unique(professional_id, date, time_slot)`)
- [x] Move booking creation to the data layer / server path
- [ ] Enforce booking status transitions server-side — RLS allows involved parties to update freely
- [ ] Handle timezone correctly for date/time slots
- [ ] Cancellation window + policy rules
- [x] Trigger booking notifications (native DB trigger)
- [ ] Booking history, filters, receipts — history + filters done; PDF receipt still a toast

---

## Phase 7 — Payment Gateway & Payouts
- [ ] Integrate a payment provider (Stripe / PayPal) — `chargeProvider()` is a stub, no keys
- [ ] Move payment intent + capture into a Supabase Edge Function
- [x] Escrow-style hold → release on completion (payment status transitions)
- [x] Create `payments`, `payouts`, and commission records (+ `settings.commission` seed)
- [ ] Real refund / cancellation handling — status change only, no money movement
- [x] Professional earnings + payout request flow against real balances
- [ ] Webhook handling for payment success / failure / refund
- [ ] Generate real PDF invoices / receipts
- [ ] Admin commission configuration UI — value lives in `settings`, no UI
- [ ] Currency, tax/VAT, and failed-payment retries

---

## Phase 8 — Ratings, Reviews & Moderation
- [x] Create `reviews` table (booking, customer, professional, rating, text, status)
- [x] Only allow a review for a completed booking
- [x] Prevent duplicate reviews per booking (`unique(booking_id)`)
- [x] Compute and store aggregate rating (DB trigger `refresh_pro_rating`)
- [x] Admin moderation (approve / hide)
- [ ] Reporting / flagging of abusive reviews
- [x] Show only approved reviews publicly
- [x] Persist rating breakdown (star sub-scores)

---

## Phase 9 — Admin Panel
- [x] Create `/admin` protected by an env-based admin session (`ADMIN_ID` / `ADMIN_PASSWORD` + signed cookie via `ADMIN_SESSION_SECRET`; middleware redirects to `/admin/login`)
- [ ] Customer management — list only (no suspend / delete)
- [ ] Professional / vendor management — list only
- [x] Document verification queue
- [ ] Category & service management (CRUD)
- [ ] Booking management + overrides — list only
- [ ] Payment, refund & commission management — payout Mark Paid / Reject only
- [x] Review moderation
- [x] Reports & analytics dashboard (basic counts; no charts)
- [x] Audit log of admin actions

---

## Phase 10 — Notifications & Communication
- [ ] Email notifications — `sendEmail()` is a no-op stub, no provider key
- [ ] Transactional email provider integration
- [ ] Scheduled reminders (cron / pg_cron) before appointments
- [x] In-app notification center backed by a `notifications` table (+ bell menu)
- [ ] Realtime status updates — fetch on mount/open only
- [ ] Customer ↔ professional messaging
- [ ] Optional SMS / WhatsApp integration
- [ ] Notification preferences per user
- [ ] Admin broadcast / announcement tool

---

## Remaining work at a glance
- **Needs external keys/accounts:** payment provider (Phase 7), transactional email (Phase 10), OAuth (Phase 3).
- **Not built yet:** automated tests, deploy pipeline, real seed of professionals, server-side filtering/pagination, category CRUD, messaging, Realtime.
- **Deliberate simplifications** are marked with `ponytail:` comments in the code, each naming the ceiling and upgrade path.

## Build order
`1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10`, finishing with testing, deployment, and docs.
