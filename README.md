# TurfHood

TurfHood is a sports turf and court platform centered on Open Sessions: players can create public game sessions that strangers can discover and join, making it easier to form a group and play together.

## Docs

| Doc | Purpose |
|---|---|
| [Project brief](./PROJECT-BRIEF.md) | Product problem, users, features, and roadmap |
| [Tech stack](./TECH-STACK.md) | Current technologies and integrations |
| [Architecture](./ARCHITECTURE.md) | Repository structure, backend modules, and collections |

## Stack at a Glance

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Clean Architecture |
| Database | MongoDB + Mongoose |
| Authentication | Email OTP through Resend, Google OAuth, JWT |
| Media | Cloudinary |

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20.9.0 or later |
| npm | 10 or later |
| MongoDB | Local deployment or MongoDB Atlas connection string |

Next.js 16.2.10 requires Node.js 20.9.0 or later. npm 10 or later is the supported baseline for this npm-workspaces monorepo.

### Installation

```bash
git clone https://github.com/mohammedsarjun/turfhood.git
cd turfhood
npm install
```

### Environment Variables

Copy the provided environment examples to the frontend and backend environment files, then supply the required values.

### Run Locally

Start the backend and frontend in separate terminals:

```bash
npm run dev --workspace backend
```

```bash
npm run dev --workspace frontend
```

## Project Status

| Phase | Focus | Status |
|---|---|---|
| Phase 1 | Foundation, authentication, turf-owner application, and turf setup | Completed |
| Phase 2 | Slot engine, booking flow, and payments | In progress |
| Phase 3 | Open Sessions, owner operations, and turf approval | Planned |
| Phase 4 | Admin tools, notifications, polish, and hardening | Planned |

## License

This project is licensed under the MIT License.
