# TurfHub — Tech Stack

## Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | SSR/SEO for public turf listings, file-based routing fits distinct user areas |
| Language | TypeScript | Type safety across a schema this large (20+ collections) |
| Component library | Material UI (MUI) | Fast, accessible, pre-built complex components (data tables, date pickers, modals) |
| Styling utility | Tailwind CSS | Rapid custom layout/spacing for one-off needs |

## Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js | Matches team's JS/TS skillset, non-blocking I/O suits job-heavy domain |
| Framework | Express | Minimal, well-understood, rich middleware ecosystem |
| Language | TypeScript | Heavy referential integrity across this schema needs strict typing |
| Architecture | Clean Architecture (monolith) | Separates business rules from framework/DB details without microservices overhead |
| Deployment shape | Monolith | Single team, single deploy cadence |

## Database

| Layer | Choice | Why |
|---|---|---|
| Database | MongoDB | Fits the referenced-not-embedded design already decided in the schema |
| ODM | Mongoose | Schema validation + TypeScript types across 20+ collections |

## Auth & Integrations

| Integration | Purpose |
|---|---|
| Twilio (OTP) | Phone-based signup/login verification |
| JWT | Access token issuance + role claims (customer/turf_owner/admin) |
| Razorpay | Primary payment gateway |
| Internal Wallet | Alternate payment source, append-only transaction ledger |
| WhatsApp Business API (Twilio) | Booking confirmations, cancellations/refunds, reminders, two-way replies |

## Scheduled Jobs

| Job | Trigger | What it does |
|---|---|---|
| Nightly slot generation | Cron, nightly | Reads `pricing_rules` + `availability_overrides` per court, generates `slots` for a rolling 14–30 day window |
| Open Session auto-cancel | Cron, periodic | Checks `autoCancelAt` (48hrs before slot start), cancels unfilled sessions, releases slot, triggers refunds/notifications |
| Booking reminders | Cron, before slot start | Sends WhatsApp reminder ahead of a customer's booked slot |

## Note on Monolith vs Future Extraction

Clean Architecture inside a monolith keeps deployment simple now (one repo, one process, one team) while keeping domain logic (bookings, slots, payments, open sessions) decoupled from Express and Mongoose. If a module later needs to become its own service, the domain layer moves with minimal rewrite because it never depended on Express or Mongoose directly.
