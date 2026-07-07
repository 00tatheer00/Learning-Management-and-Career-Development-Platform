# Production Deployment Guide — EEST Platform

Stack: **Vercel** (frontend + API) · **MongoDB Atlas** (database) · **NextAuth** (auth) · **Cloudinary** (uploads) · **Prisma** (ORM)

---

## 1. MongoDB Atlas (free)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a **free M0 cluster**
3. Database Access → Add user (username + strong password)
4. Network Access → Add IP `0.0.0.0/0` (allow from anywhere — required for Vercel)
5. Connect → Drivers → copy connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/eest?retryWrites=true&w=majority
   ```

---

## 2. Cloudinary (free)

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. Payment screenshots upload to folder `eest/payment-screenshots`
4. Profile photos upload to folder `eest/profile-photos`

---

## 2b. Resend (approval emails)

1. Create account at [resend.com](https://resend.com)
2. **Domains** → Add `emergingedge.tech`
3. Add the DNS records Resend shows (SPF, DKIM) in Hostinger DNS for `emergingedge.tech`
4. Wait until status is **Verified**
5. Copy API key → `RESEND_API_KEY`
6. Set on Vercel:
   - `EMAIL_FROM` = `EEST <noreply@emergingedge.tech>`
   - `EMAIL_REPLY_TO` = `eeschooltech@gmail.com` (optional)
7. **Gmail cannot be used as sender.** Until the domain is verified, emails will fail.

---

## 2c. UltraMsg (approval WhatsApp)

1. Create account at [ultramsg.com](https://ultramsg.com)
2. Create an instance → copy **Instance ID** and **Token**
3. Scan QR in UltraMsg dashboard to link your WhatsApp number
4. Set `ULTRAMSG_INSTANCE_ID` and `ULTRAMSG_TOKEN` in env vars
5. API docs: [Send chat message](https://docs.ultramsg.com/api/post/messages/chat)

---

## 3. Upstash Redis (optional, recommended for rate limiting)

1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database → copy REST URL and token
3. Without this, rate limiting is disabled (still works, less secure)

---

## 4. Environment variables

Copy `.env.example` to `.env.local` for local dev.

Generate auth secret:
```bash
openssl rand -base64 32
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB Atlas connection string |
| `AUTH_SECRET` | Yes | 32+ char random string |
| `NEXTAUTH_SECRET` | Yes (Vercel) | Same value as `AUTH_SECRET` |
| `NEXTAUTH_URL` | Yes (Vercel) | `https://school.emergingedge.tech` (exact production URL) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting |
| `RESEND_API_KEY` | Yes (approval emails) | [resend.com](https://resend.com) API key |
| `EMAIL_FROM` | Yes (approval emails) | Verified sender: `EEST <noreply@emergingedge.tech>` |
| `EMAIL_REPLY_TO` | No | Reply address, e.g. `eeschooltech@gmail.com` |
| `ULTRAMSG_INSTANCE_ID` | Yes (approval WhatsApp) | UltraMsg instance ID, e.g. `instance181496` |
| `ULTRAMSG_TOKEN` | Yes (approval WhatsApp) | UltraMsg API token |
| `PORTAL_PASSWORD_SECRET` | Yes (production) | Encrypts stored portal passwords (use a value different from `NEXTAUTH_SECRET`) |

When admin approves a student, the platform sends a designed congratulations email and WhatsApp message with portal login URL and credentials.

---

## 5. Local setup

```bash
npm install
cp .env.example .env.local
# Fill in all values in .env.local

npx prisma db push
npm run db:seed
npm run dev
```

---

---

## 6. CI/CD (GitHub Actions + Vercel)

### CI — every push & PR to `main`

`.github/workflows/ci-cd.yml` runs:

1. `npm run lint`
2. `npm test`
3. `npm run build`

If any step fails, the PR is blocked and production deploy does not run.

### CD — deploy after tests pass

On **push to `main`** only, after CI succeeds, GitHub Actions deploys to Vercel production using:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Add these in **GitHub → Repository → Settings → Secrets and variables → Actions**.

**Get IDs locally** (after `npx vercel link`):

```bash
cat .vercel/project.json
# { "orgId": "team_...", "projectId": "prj_..." }
```

**Create token:** [vercel.com/account/tokens](https://vercel.com/account/tokens)

### Avoid double production deploys

`vercel.json` includes `ignoreCommand` so Vercel’s Git integration **skips** production builds on `main`. GitHub Actions is the only production deploy path. Preview deploys for branches/PRs still use Vercel as usual.

### Optional: require CI before merge

GitHub → **Settings → Branches → Branch protection** on `main`:

- Require status check: **Lint, Test & Build**
- Require pull request reviews (optional)

---

## 7. Deploy to Vercel (first time)

1. Push code to GitHub
2. [vercel.com](https://vercel.com) → Import repository
3. Add **all environment variables** from section 4
4. Deploy

Vercel runs `prisma generate` automatically via `postinstall`.

After first deploy, run seed once (locally pointed at production DB, or via Vercel CLI):
```bash
npm run db:seed
```

---

## 8. Custom domain on Vercel

1. Vercel project → Settings → Domains
2. Add `school.emergingedge.tech` (or your domain)
3. Update DNS at your registrar:
   - Type `CNAME` → Vercel DNS value (e.g. `xxx.vercel-dns.com`)
4. Set `NEXTAUTH_URL` to `https://school.emergingedge.tech`
5. Redeploy

---

## 9. Security checklist (production)

- [ ] GitHub Actions secrets set (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- [ ] `PORTAL_PASSWORD_SECRET` set on Vercel (separate from `NEXTAUTH_SECRET`)
- [ ] Set strong `AUTH_SECRET` (never commit to git)
- [ ] Enable Upstash rate limiting
- [ ] MongoDB user has minimum required permissions
- [ ] Cloudinary uploads folder is not public (use authenticated URLs for admin)
- [ ] `NEXTAUTH_URL` matches your exact production domain (with https)

---

## 10. Demo accounts (change in production!)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eest.com | admin@321 |
| Trainer (Web) | tatheer@eest.com | tatheer@321 |
| Trainer (App) | talha@eest.com | talha@321 |
| Student | student@eest.com | student123 |

---

## 11. Useful commands

```bash
npm run db:push    # Sync Prisma schema to MongoDB
npm run db:seed    # Create demo users
npm run build      # Production build test
```
