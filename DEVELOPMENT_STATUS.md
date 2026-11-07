# Ranzom Solar CRM — Development Plan

## Current architecture

- **Framework:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- **Navigation:** `src/app/(app)` contains the authenticated-workspace layout; `/[module]` currently renders the shared pending-module screen for unfinished navigation items.
- **UI system:** Shared components live in `src/components`; Dashboard and Enquiries are the reference screens and should retain their current layout and interactions.
- **Dashboard:** `src/features/dashboard/dashboard-view.tsx` calculates metrics and charts from the client-side Zustand store.
- **Enquiries:** `src/features/enquiries` has a Zod/React Hook Form form, searchable/sortable table, CSV export, filters, Kanban view, detail route and delete confirmation.
- **Data:** `src/types/index.ts` defines the current frontend model; `src/data/seed.ts` builds fictional demo records; `src/store/data-store.ts` hydrates and mutates client state through `src/services/repository.ts`, currently backed by browser localStorage.
- **Backend/authentication:** PostgreSQL/Prisma schema and initial migration are in place. Auth.js credentials sign-in, hashed passwords, role checks and an active-account route guard are implemented. The Customers module reads and writes database records; no PostgreSQL connection is configured in this workspace.
- **Other modules:** Customers, Contacts, Follow-ups, Site Surveys, Quotations, Orders, Installations, Inventory, Invoices, Payments, Service & Warranty, Reports and Settings are not yet implemented as complete workflows.

## Implementation checklist

1. [x] Inspect the existing project, routes, UI, data models and incomplete modules.
2. [x] Record the actual architecture and stage plan here.
3. [x] Create the PostgreSQL/Prisma relational schema, including financial, stock, document, settings and audit relationships.
4. [x] Implement Auth.js credentials sign-in, persistent users, administrator bootstrap and server-side role authorization.
5. [ ] Complete Customers, Contacts, Follow-ups and the existing Enquiries persistence workflow.
6. [ ] Complete Site Surveys and Quotations, including price calculations and printable output.
7. [ ] Complete Orders and Installations with duplicate-conversion safeguards and task tracking.
8. [ ] Complete Invoices, Payments and Receipts with decimal arithmetic and transactional allocation.
9. [ ] Complete Inventory and Service/Warranty with auditable stock movements.
10. [ ] Complete Reports, Settings, notifications and role-restricted administration.
11. [ ] Run lint, TypeScript, production build and focused workflow tests; fix regressions.
12. [ ] Document environment setup, database migrations, authentication and deployment.

## Data integrity and delivery rules

- PostgreSQL is the source of truth for business records; localStorage remains only for non-sensitive UI preferences.
- Validate all writes on the server and enforce role permissions there.
- Use database transactions and unique/idempotency constraints for financial actions, order conversion and stock changes.
- Store monetary values as database decimals. Compute totals and balances on the server.
- Keep demo seed records separate from production data.
- Do not mark an unfinished feature as operational. Preserve the existing Dashboard and Enquiries UX while migrating their data source.
- Store uploaded-file metadata in PostgreSQL and use a configurable server-side object-storage provider for file contents.

## Current status

The existing demo Dashboard and Enquiries UI remains in place. The Prisma model/migration and Auth.js foundation are implemented and build-verified. The Customers list, profile, create/edit and archive workflow is the first backend-backed module in progress. Database-backed runtime checks require a configured PostgreSQL connection; no database URL is present in this workspace.
