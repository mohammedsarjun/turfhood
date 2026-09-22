# TurfHood

TurfHood is a full-stack sports turf and court booking platform centered on **Open Sessions**: players can create public game sessions that strangers can discover and join, making it easy to form a group, share the cost, and play together.

## Docs

| Doc | Purpose |
|---|---|
| [Project brief](./PROJECT-BRIEF.md) | Product problem, users, features, and implemented modules |
| [Tech stack](./TECH-STACK.md) | Technologies, integrations, and tooling |
| [Architecture](./ARCHITECTURE.md) | Repository structure, backend modules, collections, and design decisions |

## Stack at a Glance

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query |
| Backend | Node.js, Express, TypeScript, Clean Architecture |
| Database | MongoDB + Mongoose |
| Authentication | Email OTP (Resend), Google OAuth, Discord OAuth, JWT |
| Payments | PayU |
| Media | Cloudinary |
| Real-time | Socket.IO |

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20.9.0 or later |
| npm | 10 or later |
| MongoDB | Local instance or MongoDB Atlas connection string |

### Installation

```bash
git clone https://github.com/mohammedsarjun/turfhood.git
cd turfhood
npm install
```

### Environment Variables

Copy the provided environment examples to the frontend and backend directories and supply the required values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Run Locally

Start the backend and frontend in separate terminals:

```bash
npm run dev --workspace backend
```

```bash
npm run dev --workspace frontend
```

## Project Status

All planned phases are complete. The platform is fully implemented and production-ready.

| Phase | Focus | Status |
|---|---|---|
| Phase 1 | Foundation, authentication, turf-owner application, and turf setup | ✅ Completed |
| Phase 2 | Slot engine, court management, booking flow, and PayU payments | ✅ Completed |
| Phase 3 | Open Sessions, owner operations, revenue analytics, and payouts | ✅ Completed |
| Phase 4 | Admin tools, notifications, refund reconciliation, and platform hardening | ✅ Completed |

## License

This project is licensed under the MIT License.
