# TurfHood - Tech Stack

## Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | Server rendering, routing, and React application structure |
| Language | TypeScript | Shared, type-safe contracts across the application |
| Styling | Tailwind CSS | Utility-first styling without a separate component framework |
| Forms and validation | React Hook Form + Zod | Typed form state and validation |

## Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js | Uses the same TypeScript ecosystem as the frontend |
| Framework | Express | Lightweight HTTP routing and middleware |
| Language | TypeScript | Type-safe domain and application boundaries |
| Architecture | Clean Architecture monolith | Separates business rules from frameworks and infrastructure |
| Dependency injection | tsyringe | Connects use cases to repository and service implementations |

## Database and Storage

| Layer | Choice | Why |
|---|---|---|
| Database | MongoDB | Document storage for application data |
| ODM | Mongoose | Schema validation, indexes, and typed persistence models |
| Media storage | Cloudinary | Hosted image uploads and delivery |

## Authentication and Integrations

| Integration | Purpose |
|---|---|
| Resend | Sends email-based OTP messages |
| Google OAuth | Google account authentication |
| JWT | Access, refresh, and temporary session tokens |
| Razorpay | Planned payment gateway for the booking phase |

Authentication currently uses email OTP through Resend and Google OAuth. Phone-based OTP is not part of the current implementation.

## Testing and Quality

| Area | Choice |
|---|---|
| Frontend tests | Jest + Testing Library |
| Backend tests | Mocha + Chai + Supertest |
| Linting | ESLint |
| Formatting | Prettier |

## Deployment Shape

TurfHood remains a monolith while the product and domain are evolving. Clean Architecture keeps domain logic isolated so individual capabilities can be extracted later if operational needs justify it.
