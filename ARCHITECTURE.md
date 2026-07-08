# TurfHood - Architecture

Monorepo with the frontend and backend in a single repository.

```
turfhood/
├── frontend/          # Next.js app
├── backend/           # Express + Clean Architecture
├── shared/            # Shared TypeScript types (DTOs used by both sides)
├── README.md
└── .github/
```


## Backend Modules

Modules-first, clean-architecture-layers-inside-each-module (not one flat layer split across the whole app — this schema spans too many distinct domains for that).

| Module | Collections Owned |
|---|---|
| `auth` | `otp_verifications` |
| `user` | `users` |
| `turf` | `turfs`, `turf_images` |
| `court` | `courts`, `court_images`, `pricing_rules`, `special_date_pricing`, `availability_overrides` |
| `catalog` | `sports_types`, `amenities` |
| `verification` | `turf_owner_verifications` |
| `slot` | `slots` |
| `booking` | `bookings` |
| `open-session` | `open_sessions`, `open_session_participants` |
| `payment` | `payments` |
| `refund` | `refunds` |
| `wallet` | `wallets`, `wallet_transactions` |
| `review` | `reviews` |
| `favorite` | `favorites` |
| `notification` | `notifications` + WhatsApp provider (called by other modules) |
| `payout` | `owner_payout_accounts`, `owner_earnings`, `payouts` |
| `admin` | `audit_logs`, user suspension, review moderation actions |

## Standard Shape of Every Module

```
modules/<name>/
├── domain/
│   ├── entities/          # Plain TS types/classes — no framework code
│   └── repositories/      # Interfaces only (e.g. ITurfRepository)
├── application/
│   ├── use-cases/         # Business logic — depends on domain interfaces
│   └── dtos/
├── infrastructure/
│   ├── models/             # Mongoose schemas
│   ├── repositories/        # Implements domain interfaces
│   └── services/            # External integrations (Twilio, Razorpay)
└── presentation/
    ├── controllers/
    ├── routes/
    └── validators/
```

## Dependency Rule

| Layer | Depends on |
|---|---|
| `presentation` | `application` |
| `application` | `domain` |
| `infrastructure` | `domain` (implements its interfaces) |
| `domain` | Nothing — no Express, no Mongoose |

## Backend Root Structure

```
backend/
├── src/
│   ├── modules/           # see module table above
│   ├── shared/
│   │   ├── errors/
│   │   ├── middlewares/    # authMiddleware, roleMiddleware, errorHandler, rateLimiter
│   │   ├── jobs/           # scheduled job runner
│   │   ├── utils/
│   │   └── config/         # env.ts, database.ts
│   ├── app.ts              # mounts all module routes
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Cross-Cutting Concerns

| Concern | Pattern | Who calls it |
|---|---|---|
| Notifications | `INotificationProvider` interface in `notification` module | `booking`, `refund`, `open-session`, `verification` use cases |
| Audit logging | `IAuditLogger` interface in `shared/`, implemented in `admin` module | Any use case performing a sensitive action (approval, refund, payout, suspension) |
| Scheduled jobs | Live in `shared/jobs/`, call into module use cases | `slot`, `open-session`, `notification` modules |

## Frontend Route Map

| Route Group | Example Routes | Purpose |
|---|---|---|
| `(auth)` | `/login`, `/signup` | OTP authentication |
| `(customer)` | `/home`, `/search`, `/turfs/[turfId]`, `/checkout`, `/bookings`, `/open-sessions`, `/wallet`, `/favorites`, `/profile` | Customer-facing app |
| `(owner)` | `/my-turfs`, `/turfs/new`, `/bookings`, `/slots`, `/dashboard`, `/revenue`, `/payouts/request`, `/whatsapp-settings` | Turf owner management |
| `(admin)` | `/dashboard`, `/turfs`, `/users`, `/reviews`, `/catalog`, `/payouts` | Platform administration |

## Frontend Root Structure

```
frontend/
├── src/
│   ├── app/                # routes — see table above
│   ├── components/
│   │   ├── ui/              # generic reusable (MUI + Tailwind)
│   │   └── features/        # auth, turf, court, booking, open-session, wallet, review, whatsapp
│   ├── lib/
│   │   ├── api/              # one client file per backend module
│   │   ├── auth/
│   │   └── theme.ts           # MUI theme (shared design tokens)
│   ├── hooks/
│   └── types/                # mirrors shared/ DTOs
├── tailwind.config.ts
└── package.json
```

## Key Design Decisions

| Decision | Reasoning |
|---|---|
| Slot lifecycle lives in `slot` module only | `booking` module calls into it rather than mutating slot state directly |
| Open Session cost split computed once, at creation | `costPerPlayer = totalCost / maxPlayers` and `autoCancelAt` (48hr cutoff) — not recalculated elsewhere |
| Payment, Refund, Wallet are separate modules | Lifecycles differ: one payment → many refunds; wallet balance changes only via append-only `wallet_transactions` ledger |
| Turf visibility check lives in `turf` module | Public only when `status: approved` AND linked `turf_owner_verifications.status: approved` — not a frontend-only check |
| Role-based middleware is shared, not duplicated | Lives in `shared/middlewares/`, applied per-route in each module |
| WhatsApp isolated behind `INotificationProvider` | Confirmations (Phase 2), reminders (Phase 3), two-way replies (Phase 4) all extend one provider |