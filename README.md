# Ranzom CRM

Ranzom CRM is a flexible customer and business management workspace by Ranzom Tech. Its sample workflows cover leads, customers, contacts, follow-ups, tasks, proposals, orders, projects, inventory, invoices, payments and support cases.

## Stack

- Next.js 16 App Router, React 19 and TypeScript
- PostgreSQL with Prisma ORM 8 for application queries and schema contracts
- Auth.js credentials sign-in with bcrypt password hashes
- Zod validation, Tailwind CSS 4 and selectable gradient palettes
- Fictional sample records in browser storage for the other CRM workflows

## Local setup

Use Node.js 22.18+ (or 24.11+) and a reachable PostgreSQL database.

1. Install dependencies and create a private environment file:

   ```bash
   npm install
   cp .env.example .env
   ```

2. Set `DATABASE_URL` to your PostgreSQL connection string and generate a strong random `AUTH_SECRET` (for example, `openssl rand -base64 32`). Both are required at runtime; do not use a `NEXT_PUBLIC_` prefix. To skip sign-in in local development, set `DEMO_MODE=true`. This grants a local demo super-admin and redirects `/login` to the dashboard. The bypass only works with the development server and is ignored in production.

3. Emit the Prisma contract, then initialize an empty database and provision an administrator. Only initialize a database that is confirmed empty:

   ```bash
   npm run db:contract
   npm run db:init -- --dry-run
   npm run db:init
   npm run db:create-admin
   ```

   The provisioning script prompts for the admin details and hashes the password. To provide a custom account non-interactively, set `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` in the private `.env` file before running `npm run db:create-admin`; use a password of at least 12 characters. These variables are only used by the provisioning command, not by login. Remove `ADMIN_PASSWORD` from `.env` after the account is provisioned. Demo mode does not require provisioning an administrator. Do not commit `.env` or share its contents. For an existing database, do not run `db:init` or `db:migrate` until its schema has been inspected and adopted.

4. Start Next.js:

   ```bash
   npm run dev
   ```

With `DEMO_MODE=true`, open the app without signing in. Otherwise, sign in at `/login` with the administrator email and password that you provisioned. There are no built-in credentials.

## Deployment

Configure `DATABASE_URL` and `AUTH_SECRET` as server-only Vercel environment variables for every environment where the application runs. Before changing an existing production database, verify its schema against the emitted contract and adopt its current state; do not apply the generated initial migration blindly. The checked-in `migrations/app` initial migration was planned from an empty database and has not been applied.

```bash
npm run db:verify
```

Once the database state is confirmed and the required migration path is prepared, apply it with `npm run db:migrate`. Then provision the administrator against that database with `npm run db:create-admin`. If the production `User` table is missing, the schema must be initialized before creating the administrator or sign-in will not work.

Authentication protects the workspace and role-gates customer changes, but this starter does not yet implement tenant isolation. Do not treat it as a multi-tenant SaaS or store sensitive customer data across multiple businesses without adding tenant-scoped data access.

## Database commands

- `npm run db:contract` emits the typed Prisma 8 contract.
- `npm run db:init` initializes a confirmed-empty database.
- `npm run db:verify` checks the database marker and schema against the contract.
- `npm run db:migrate` applies planned Prisma 8 migrations.
- `npm run db:create-admin` provisions or resets an administrator.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

See [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) for the current implementation and persistence boundaries.
