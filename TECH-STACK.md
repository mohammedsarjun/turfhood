# TurfHood - Tech Stack

## Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server rendering, layout system, and React 19 application structure |
| Language | TypeScript | Shared, type-safe contracts across the entire monorepo |
| Styling | Tailwind CSS | Utility-first styling without a separate component framework |
| Forms and validation | React Hook Form + Zod | Typed form state and schema validation |
| Data fetching | TanStack Query (React Query) | Server-state caching, background refetching, and mutation management |
| Icons | Lucide React | Consistent, tree-shakeable icon set |

## Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js | Same TypeScript ecosystem as the frontend |
| Framework | Express | Lightweight HTTP routing and middleware composition |
| Language | TypeScript | Type-safe domain and application boundaries |
| Architecture | Clean Architecture monolith | Business rules remain independent of Express, Mongoose, and third-party services |
| Dependency injection | tsyringe | Infrastructure implementations can be swapped without modifying use cases |

## Database and Storage

| Layer | Choice | Why |
|---|---|---|
| Database | MongoDB | Flexible document storage for application data |
| ODM | Mongoose | Schema validation, indexes, and typed persistence models |
| Media storage | Cloudinary | Hosted image uploads and delivery for turf and court images |

## Authentication and Integrations

| Integration | Purpose |
|---|---|
| Resend | Sends email-based OTP and booking confirmation emails |
| Google OAuth | Google account sign-in and registration |
| Discord OAuth | Discord account sign-in and registration |
| PayU | Payment gateway for court bookings and Open Session participation fees |
| JWT | Access token, refresh token, and temporary session token lifecycle |
| Socket.IO | Real-time in-app notification delivery |

Authentication supports email OTP via Resend, Google OAuth, and Discord OAuth. Phone-based OTP is not part of the current implementation.

## Testing and Quality

| Area | Choice |
|---|---|
| Frontend tests | Jest + Testing Library |
| Backend tests | Mocha + Chai + Supertest |
| Type checking | TypeScript strict mode (`tsc --noEmit`) |
| Linting | ESLint |
| Formatting | Prettier |

## Deployment Shape

TurfHood is a monolith. Clean Architecture keeps domain logic isolated from infrastructure, so individual capabilities can be extracted into separate services later if operational scale justifies it.
