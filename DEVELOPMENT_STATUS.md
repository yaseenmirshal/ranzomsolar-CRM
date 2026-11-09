# Ranzom CRM — Development Status

## Product direction

This project is a general-purpose CRM workspace branded for Ranzom Tech. The visible workflows use generic lead, customer, task, proposal and project language rather than a single-industry process.

## Current architecture

- **Framework:** Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4.
- **Navigation:** `src/app/(app)` contains the shared workspace. The navigation labels are business-neutral; some internal route and model names remain from the original template to preserve existing behavior.
- **Dashboard and sample workflows:** `src/data/seed.ts` supplies fictional generic sample records. Zustand persists these workflows in browser storage.
- **Customers:** The Customers module reads and writes PostgreSQL records through Prisma and requires `DATABASE_URL`.
- **Authentication:** Auth.js credentials sign-in uses Prisma users and bcrypt password hashes. The shared workspace requires an active user; customer writes are protected by role checks.

## Data and security boundaries

- Configure and validate production authentication, migrations, and the initial administrator before entering real customer information.
- Customer records are database-backed; other CRM workflows currently use fictional browser-stored sample data.
- The database schema retains its existing structure to avoid an unrequested schema migration. The visible customer categories map the existing database values to generic Individual and Organization labels.
- Tenant isolation is not implemented. Do not treat this project as a multi-tenant SaaS without tenant-scoped data access and authorization.

## Validation

Run `npm run lint`, `npx tsc --noEmit` and `npm run build` after code changes. Database-backed runtime checks require a configured PostgreSQL connection.
