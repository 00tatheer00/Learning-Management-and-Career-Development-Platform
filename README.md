# Emerging Edge School of Technology

Educational platform with a public marketing site and role-based portals for **students**, **trainers**, and **admins**.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **MongoDB** + **Prisma**
- **NextAuth** credentials auth
- **Tailwind CSS v4**
- **Cloudinary** (payment screenshots)
- **Resend** (email, optional)
- **UltraMsg** (WhatsApp, optional)
- **Vitest** (automated tests)

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Run automated tests |
| `npm run db:push` | Sync Prisma schema to MongoDB |
| `npm run db:seed` | Seed dev users (uses `SEED_*` env in production) |

## Project Structure

```
src/
├── app/           # Pages + API routes (student / trainer / admin portals)
├── components/    # UI and portal components
├── lib/           # Auth, API, notifications, validations
└── types/
prisma/            # Schema + seed
```

## Security

- Rate limiting on login, contact, enrollment, and enrollment history (Upstash + in-memory fallback)
- Admin approve/reject restricted to super admin
- CSP and security headers in `next.config.ts`
- See `.env.example` for required environment variables

## Enrollment

`POST /api/enrollment` — multipart form with student details and payment screenshot.  
Data is stored in MongoDB via Prisma.

## CI/CD

Every push and pull request to `main` runs **GitHub Actions**:

| Step | What it does |
|------|----------------|
| **Lint** | ESLint |
| **Test** | Vitest (`npm test`) |
| **Build** | Production Next.js build |

When tests pass on a **push to `main`**, the workflow **deploys to Vercel production** (`https://school.emergingedge.tech`).

Workflow file: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

### One-time GitHub secrets (required for deploy)

In GitHub → **Settings → Secrets and variables → Actions**, add:

| Secret | How to get it |
|--------|----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create token |
| `VERCEL_ORG_ID` | Vercel project → Settings → General → **Project ID** section, or run `vercel link` locally and read `.vercel/project.json` (`orgId`) |
| `VERCEL_PROJECT_ID` | Same place → `projectId` in `.vercel/project.json` |

Vercel env vars (database, auth, Cloudinary, etc.) stay in the **Vercel dashboard** — the deploy step uses those automatically.

Production deploys from the Vercel Git hook are **skipped** (`vercel.json` `ignoreCommand`) so only GitHub Actions deploys `main` after tests pass. PR preview deploys from Vercel still work.

Full setup: see [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Build

```bash
npm run test
npm run build
npm start
```
