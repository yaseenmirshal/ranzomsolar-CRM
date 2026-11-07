# Ranzom Solar CRM

Ranzom Solar CRM is an existing Next.js App Router application for solar sales, projects, finance and service workflows. The Dashboard and Enquiries remain the visual reference; new modules should reuse the established UI components and brand styling.

## Stack

- Next.js 16 App Router, React 19 and TypeScript
- PostgreSQL with Prisma ORM
- Auth.js credentials sign-in with hashed passwords
- Zod validation and server-side authorization
- Tailwind CSS 4

## Local setup

Use Node.js 22+ and a reachable PostgreSQL database.

1. Install dependencies and create a private environment file:

   ```bash
   npm install
   cp .env.example .env
   ```

2. Set `DATABASE_URL` to your PostgreSQL connection string, generate `AUTH_SECRET` with `openssl rand -base64 32`, and set `AUTH_URL` to the local app URL. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters) and `ADMIN_NAME` for the initial administrator.

3. Generate the Prisma client, create the database tables, and bootstrap the administrator:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:create-admin
   ```

4. Start Next.js:

   ```bash
   npm run dev
   ```

`.env` is ignored by Git. Never put database credentials, password hashes, or Auth.js secrets in `NEXT_PUBLIC_` variables.

## Database commands

- `npm run db:generate` regenerates the Prisma client.
- `npm run db:migrate` creates/applies a development migration.
- `npm run db:deploy` applies checked-in migrations in a deployment environment.
- `npm run db:studio` opens Prisma Studio.
- `npm run db:create-admin` creates or resets the configured super-admin account.

For production, configure `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` in the hosting provider's server-only environment settings, and run `npm run db:deploy` as part of deployment.

## Current implementation status

The Prisma schema, initial PostgreSQL migration, Auth.js sign-in and role-checking foundation are in place. The Customers list, profile, create/edit and archive workflow is the first module being migrated to database persistence. Dashboard, Enquiries and the remaining modules have not yet been migrated from their demo/localStorage implementation; do not treat those records as production data. See [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) for the module plan and current status.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```
