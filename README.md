# TurfHood

Marketplace platform for booking sports turfs & courts, with split-cost Open Sessions and automated WhatsApp notifications.

## Docs

| Doc | Purpose |
|---|---|
| [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) | What we're building, for whom, and the roadmap |
| [TECH_STACK.md](./TECH_STACK.md) | Stack choices and why |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder structure, module design, data model mapping |



## Stack at a glance

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Material UI, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Clean Architecture, Monolith |
| Database | MongoDB + Mongoose |
| Payments | Razorpay + internal Wallet |
| Notifications | WhatsApp Business API (Twilio) |

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20.x or later |
| MongoDB | Local instance or Atlas connection string |
| npm | 10.x or later |

### Installation

```bash
git clone https://github.com/mohammedsarjun/turfhood.git
cd turfhood
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `.env` (backend), then fill in the values.

### Run locally

```bash
npm run dev
```

## Project Status

| Phase | Focus | Status |
|---|---|---|
| Phase 1 | Foundation, Auth, Turf/Court Setup | 🔲 Not started |
| Phase 2 | Slot Engine, Booking Flow, Payments | 🔲 Not started |
| Phase 3 | Open Sessions, Owner Ops, Turf Approval | 🔲 Not started |
| Phase 4 | Admin Tools, Polish, Hardening | 🔲 Not started |

## License

This project is licensed under the MIT License.