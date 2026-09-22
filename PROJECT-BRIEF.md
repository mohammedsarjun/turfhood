# TurfHood - Project Brief

## What is TurfHood?

TurfHood is a full-stack sports platform for discovering and booking turfs and courts, with Open Sessions that help players find and connect with strangers to form a group and play together.

| User | Role |
|---|---|
| Customer | Finds turfs, books slots, creates or joins Open Sessions, pays, cancels, and manages bookings and refunds |
| Turf Owner | Lists and manages turfs and courts, pricing, availability, bookings, and earnings |
| Admin | Verifies turf-owner applications, manages users and catalogs, oversees the platform, and handles escalated refunds |

## Problem It Solves

The central problem is not only making turf booking digital. Many people want to play a sport but cannot form a complete team because friends are unavailable or they do not know enough nearby players. Existing booking flows assume that the customer already has a group.

TurfHood solves this through **Open Sessions**: a player can create a public game session, and other people who do not know the host can discover it, join the group, and play together. Turf discovery, booking, participant management, and cost sharing come together in one flow.

| Problem | TurfHood's Solution |
|---|---|
| Players cannot assemble a full group | Open Sessions connect hosts with other players looking for a game |
| Strangers have no structured way to organize | Each session provides a shared place, time, sport, capacity, and participation flow |
| Turf booking is fragmented and manual | Search, availability, booking, and payment are brought into one application |
| Unfilled capacity makes games expensive or impossible | Additional participants share the session cost, and sessions cancel automatically if minimum players are not met |

## Core Features by User

| Customer | Turf Owner | Admin |
|---|---|---|
| Email OTP, Google, and Discord authentication | Turf onboarding and verification workflow | Application approval and rejection |
| Search and filter turfs by city, sport, and amenity | Turf and court management (add, edit, images) | User management |
| Favorite turfs | Pricing, slot overrides, and availability | Sports type and amenity catalog management |
| Create or join an Open Session | View and manage bookings | Commission rate configuration |
| Book courts with time-slot selection | Revenue and earnings analytics | Escalated refund management |
| Secure checkout via PayU | Payout / withdrawal request submission | Withdrawal request review |
| Cancel bookings per cancellation policy | Turf suspension and status awareness | Platform revenue overview |
| View refund status and history | | |
| In-app notifications | | Notifications dispatched on key events |
| Profile and password management | | |

## Implemented Modules

| Module | Area |
|---|---|
| Authentication | Email OTP, Google OAuth, Discord OAuth, JWT access/refresh tokens, password reset |
| User | Accounts, roles, profiles, phone, auth providers |
| Turf | Turf records, images, status, suspension, discovery, and detail views |
| Court | Court setup, slot configuration, day-type pricing, and schedule overrides |
| Booking | Slot reservation hold, PayU payment flow, confirmation, cancellation, and refunds |
| Open Session | Creation, discovery, joining, fill detection, automatic cancellation on unfilled sessions |
| Favorites | Customer turf favouriting |
| Notification | In-app notifications with deduplication |
| Commission | Admin-configurable platform commission rate |
| Payout | Turf owner withdrawal requests and admin review |
| Review | Turf review storage (infrastructure ready) |
| Admin | Admin authentication, dashboard stats, user management, and refund handling |
| Location | Country, state, and city catalog for discovery and filtering |

## Success Criteria

| # | Criteria | Status |
|---|---|---|
| 1 | Users can authenticate with email OTP, Google, or Discord | ✅ Implemented |
| 2 | Owners can manage turfs, courts, pricing, and availability | ✅ Implemented |
| 3 | Customers can book, pay, cancel, and receive eligible refunds | ✅ Implemented |
| 4 | The system prevents double-booking at the database level | ✅ Implemented |
| 5 | Players can create, discover, and join Open Sessions with strangers | ✅ Implemented |
| 6 | Open Sessions fill correctly or cancel and refund if minimum players are not met | ✅ Implemented |
| 7 | Owners can track earnings and request payouts | ✅ Implemented |
| 8 | Admins can manage applications, catalogs, users, refunds, and platform operations | ✅ Implemented |
