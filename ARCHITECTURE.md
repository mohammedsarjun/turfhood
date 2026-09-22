# TurfHood - Architecture

TurfHood is a monorepo containing a Next.js frontend, an Express backend, and shared TypeScript DTOs.

```text
turfhood-project/
|-- frontend/          # Next.js application (App Router)
|-- backend/           # Express API using Clean Architecture
|-- shared/            # DTOs and types shared by frontend and backend
|-- README.md
`-- .github/
```

## Backend Architecture

The backend uses a layer-first Clean Architecture. Each business domain is represented within the relevant `domain`, `application`, `infrastructure`, and `presentation` layers.

```text
backend/src/
|-- domain/            # Entities, repository contracts, service contracts, and errors
|-- application/       # Use cases, DTOs, and business logic
|-- infrastructure/    # Mongoose models/repositories and external service adapters
|-- presentation/      # Express controllers, routes, validators, and middleware
|-- config/            # Environment config and dependency-injection container
|-- shared/            # Cross-cutting backend utilities
|-- app.ts             # Express application composition
`-- server.ts          # Process entry point
```

## Implemented Backend Modules

All modules below are fully implemented. A dash in the collection column means the module operates against another module's collection.

| Module | Responsibility | Collection(s) owned |
|---|---|---|
| `admin` | Admin authentication and initial admin seeding | — (uses `users`) |
| `user` | Accounts, roles, profiles, auth identities (Google, Discord) | `users` |
| `otp` | Email OTP issuance and verification | `otpverifications` |
| `passwordReset` | Password-reset token lifecycle | `passwordresettokens` |
| `refreshToken` | Refresh-token rotation and revocation | `refreshtokens` |
| `amenity` | Amenity catalog management | `amenities` |
| `sportsType` | Sports-type catalog management | `sportstypes` |
| `location` | Country, state, and city lookup | — |
| `turfOwnerApplication` | Turf-owner applications and admin review workflow | `turfownerapplications` |
| `turf` | Turf records, images, status, suspension, and discovery | `turfs`, `turfimages` |
| `court` | Court setup, pricing, day-type schedules, and slot overrides | `courts`, `courtoverrides` |
| `booking` | Slot reservation hold, PayU checkout, confirmation, cancellation, and automated refund reconciliation | `bookings`, `slotreservations` |
| `openSession` | Open Session creation, discovery, joining, fill detection, and auto-cancellation with participant refunds | `opensessions` |
| `commission` | Admin-configurable platform commission rate | `commissionsettings` |
| `favorite` | Customer turf favouriting | `favorites` |
| `notification` | In-app notification creation, delivery (Socket.IO), and read tracking | `notifications` |
| `payout` | Turf owner withdrawal requests and admin review | `payoutrequests` |
| `review` | Turf review storage | `reviews` |

## Dependency Rule

| Layer | Depends on |
|---|---|
| `presentation` | `application` |
| `application` | `domain` |
| `infrastructure` | Domain contracts it implements |
| `domain` | No Express, Mongoose, or third-party code |

## Frontend Structure

The frontend uses the Next.js App Router.

```text
frontend/
|-- app/               # Route entry points and layouts
|   |-- admin/         # Admin dashboard routes (protected)
|   |-- turf-portal/   # Turf owner portal routes (protected)
|   |-- open-sessions/ # Open session discovery and detail routes
|   |-- bookings/      # Customer booking management
|   |-- refunds/       # Customer refund status
|   |-- turfs/         # Public turf listing and detail pages
|   |-- favorites/     # Customer favourites
|   |-- profile/       # User profile management
|   `-- ...            # Auth routes (login, signup, otp, forgot-password)
|-- features/          # Feature-scoped UI components, hooks, and API calls
|-- components/        # Shared UI components (Header, Sidebar, etc.)
|-- lib/               # Axios instance, API route constants, auth utilities
`-- hooks/             # Shared React hooks
```

## Key Design Decisions

| Decision | Reasoning |
|---|---|
| Clean Architecture boundaries | Business rules stay independent of Express, Mongoose, and third-party services |
| Dependency injection through `tsyringe` | Infrastructure implementations can be replaced without changing use cases |
| Shared DTO package | Frontend and backend use the same request and response contracts, enforced by TypeScript |
| Separate temporary-token collections | OTP, password-reset, and refresh-token lifecycles have different expiry and revocation rules |
| Slot reservation as a separate collection | Prevents double-booking at the database level using unique compound indexes |
| Refund reconciliation as a background job | PayU refunds are asynchronous; a periodic reconciler polls status and escalates failures to admin after 3 attempts |
| Socket.IO for notifications | Real-time delivery without polling; falls back gracefully when the socket is not connected |
| Open Sessions as a first-class domain | The session fill and auto-cancellation logic is isolated in its own use case, keeping booking logic clean |
