# TurfHood - Architecture

TurfHood is a monorepo containing a Next.js frontend, an Express backend, and shared TypeScript DTOs.

```text
turfhood-project/
|-- frontend/          # Next.js application
|-- backend/           # Express API using Clean Architecture
|-- shared/            # DTOs and types shared by frontend and backend
|-- README.md
`-- .github/
```

## Backend Architecture

The backend currently uses a layer-first Clean Architecture. Each business area is represented within the relevant `domain`, `application`, `infrastructure`, and `presentation` layers.

```text
backend/src/
|-- domain/            # Entities, repository contracts, service contracts, errors
|-- application/       # Use cases, DTOs, and mappers
|-- infrastructure/    # Mongoose models/repositories and external services
|-- presentation/      # Express controllers, routes, validators, and middleware
|-- config/            # Environment and application configuration
|-- container/         # Dependency-injection registration
|-- shared/            # Cross-cutting backend utilities
|-- app.ts             # Express application composition
`-- server.ts          # Process entry point
```

## Current Backend Modules

As of now, these are the modules implemented in the project. A dash means that the module does not own a MongoDB collection.

| Module | Responsibility | Collection owned |
|---|---|---|
| `admin` | Admin authentication and initial admin setup | - (uses `users`) |
| `user` | Accounts, roles, profiles, and authentication identities | `users` |
| `otp` | Email OTP issuance and verification | `otpverifications` |
| `passwordReset` | Password-reset token lifecycle | `passwordresettokens` |
| `refreshToken` | Refresh-token rotation and revocation | `refreshtokens` |
| `amenity` | Amenity catalog management | `amenities` |
| `sportsType` | Sports-type catalog management | `sportstypes` |
| `location` | Country, state, and city lookup | - |
| `turfOwnerApplication` | Turf-owner applications and review workflow | `turfownerapplications` |
| `turf` | Approved turf records and turf images | `turfs`, `turfimages` |

Collection names above follow the current Mongoose models. Features and collections planned for later phases, including courts, slots, bookings, payments, and Open Sessions, are intentionally not listed as implemented modules.

## Dependency Rule

| Layer | Depends on |
|---|---|
| `presentation` | `application` |
| `application` | `domain` |
| `infrastructure` | Domain contracts that it implements |
| `domain` | No Express or Mongoose code |

## Frontend Structure

The frontend uses the Next.js App Router. Route entry points live in `frontend/app`, feature-specific UI and logic live in `frontend/features`, shared components live in `frontend/components`, API route definitions live in `frontend/lib/apiRoutes`, and reusable hooks live in `frontend/hooks`.

## Key Design Decisions

| Decision | Reasoning |
|---|---|
| Clean Architecture boundaries | Business rules remain independent of Express, Mongoose, and third-party services |
| Dependency injection through `tsyringe` | Infrastructure implementations can be replaced without changing use cases |
| Shared DTO package | Frontend and backend use the same request and response contracts |
| Separate temporary-token collections | OTP, password-reset, and refresh-token lifecycles have different expiry and revocation rules |
| Open Sessions as a core planned domain | The booking flow will let players create public sessions that strangers can discover and join |
