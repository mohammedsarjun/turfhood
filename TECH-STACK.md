TurfHub - Tech Stack

Frontend

LayerChoiceWhyFrameworkNext.js (App Router)SSR/SEO for public turf listings, file-based routing fits distinct user areas (customer/owner/admin)LanguageTypeScriptType safety across a schema this large (20+ collections) is not optionalComponent libraryMaterial UI (MUI)Fast, accessible, pre-built complex components (data tables for owner/admin dashboards, date pickers for slot selection, modals)Styling utilityTailwind CSSRapid custom layout/spacing for one-off layout needs

Backend

LayerChoiceWhyRuntimeNode.jsMatches team's JS/TS skillset, non-blocking I/O suits notification/scheduled-job-heavy domainFrameworkExpressMinimal, well-understood, plenty of middleware ecosystem (auth, rate limiting)LanguageTypeScriptSame reasoning as frontend — this schema has heavy referential integrity to get rightArchitectureClean Architecture (monolith)Domain (bookings, slots, payments, open sessions) is complex enough to benefit from separating business rules from framework/DB details, without the operational overhead of microservicesDeployment shapeMonolithSingle team, single deploy cadence — see note below on future extraction

Database

LayerChoiceWhyDatabaseMongoDBGiven schema — document model fits the referenced-not-embedded design already decided (turf_images, bookings, payments, etc. all separate collections with ObjectId references)ODMMongooseSchema validation + TypeScript types across a 20+ collection domain

Auth & Integrations


OTP: Phone-based, via Twilio (also the WhatsApp Business API provider)
JWT: Access token issuance + role claims (customer/turf_owner/admin)
Payments: Razorpay (primary), plus internal wallet as a payment source
WhatsApp Business API (via Twilio): Booking confirmations, cancellations/refunds, reminders, two-way replies (Phase 4)


Scheduled Jobs

Two recurring background jobs are core to the domain and need a scheduler (e.g. node-cron, or a managed queue like BullMQ if load grows):


Nightly slot generation — reads pricing_rules + availability_overrides per court, generates slots for a rolling window (14–30 days)
Open Session auto-cancel — checks autoCancelAt (48hrs before slot start) and auto-cancels unfilled sessions, releasing the slot and triggering refunds/notifications


Note on "Monolith" vs future extraction

Clean Architecture inside a monolith is a deliberate choice: it keeps deployment simple now (one repo, one process, one team) while keeping domain logic (bookings, slots, payments, open sessions) decoupled from Express/Mongoose. If the platform later needs to split out, say, the booking/slot engine into its own service, the domain layer can move with minimal rewrite, because it never depended on Express or Mongoose directly in the first place.