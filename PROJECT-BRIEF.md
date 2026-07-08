# TurfHub - Project Brief

## What is TurfHub?

TurfHub is a marketplace platform for booking sports turfs and courts (football, cricket, badminton, etc.), connecting three user types:

| User | Role |
|---|---|
| Customer | Searches turfs, books slots, joins Open Sessions, pays, manages bookings, leaves reviews |
| Turf Owner | Lists/manages turfs & courts, sets pricing, manages bookings, tracks earnings, requests payouts |
| Admin | Verifies owners, moderates reviews, manages users, approves payouts, oversees analytics |

## Problem it solves

Turf/court booking today is largely manual (phone calls, WhatsApp groups, walk-ins), causing double-bookings, no-shows, and no structured way to fill unused slots.

| Problem | TurfHub's Solution |
|---|---|
| Double-bookings | Slot uniqueness (`courtId + date + startTime`) enforced at the database level |
| Empty/unfilled slots | Open Sessions — one person books, others join to split the cost |
| Manual coordination | Automated WhatsApp confirmations, cancellations, and reminders |
| Unreliable owner payouts | Structured earnings + payout request pipeline |

## Core Features by User

| Customer | Turf Owner | Admin |
|---|---|---|
| OTP signup/login | Turf/court onboarding + verification | Turf verification approve/reject |
| Search & filter turfs | Pricing rules, special-date pricing, availability overrides | User management (suspend/reactivate) |
| Book standard slot or Open Session | Bookings & slot calendar management | Review moderation |
| Pay via Razorpay/Wallet | Dashboard, analytics, earnings, payouts | Sports/Amenities catalog management |
| Manage bookings, reviews, favorites | Review visibility, customer management | Payout approve/reject |
| In-app + WhatsApp notifications | WhatsApp bot settings & delivery logs | Platform revenue analytics |
| Profile & notification preferences | — | Audit log oversight |

## Roadmap / Phasing

| Phase | Focus | Deliverable |
|---|---|---|
| **Phase 1** (Week 1) | Foundation, Auth, Turf/Court Setup | Owner can sign up, create a turf, add courts with pricing, submit for verification |
| **Phase 2** (Week 2) | Slot Engine, Booking Flow, Payments | Customer can browse, book, pay, manage bookings end-to-end, receive WhatsApp confirmations |
| **Phase 3** (Week 3) | Open Sessions, Owner Ops, Turf Approval | Open sessions work end-to-end; owners manage bookings/slots/earnings; admin approves turfs |
| **Phase 4** (Week 4) | Admin Tools, Polish, Hardening | Full admin toolset; notifications; WhatsApp two-way replies; security hardening; QA pass |

## Success Criteria

| # | Criteria |
|---|---|
| 1 | All 3 user roles can sign up/log in via phone OTP |
| 2 | Owners can fully manage turfs, courts, pricing, and availability |
| 3 | Customers can book, pay, cancel, and get refunded without manual intervention |
| 4 | Slot double-booking is impossible at the database level |
| 5 | Open Sessions fill correctly or auto-cancel with refunds at the 48-hour cutoff |
| 6 | WhatsApp messages fire correctly for confirmations, cancellations, and reminders |
| 7 | Owners can track earnings and successfully request/receive payouts |
| 8 | Admins can verify turfs, moderate reviews, manage users, and approve payouts |
| 9 | Every sensitive action is captured in the audit log |