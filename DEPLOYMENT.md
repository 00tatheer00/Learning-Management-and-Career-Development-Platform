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
| `AUTH_URL` | Yes | `http://localhost:3000` or production URL |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting |

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

## 6. Deploy to Vercel

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

## 7. Custom domain on Vercel

1. Vercel project → Settings → Domains
2. Add `school.emergingedge.com` (or your domain)
3. Update DNS at your registrar:
   - Type `CNAME` → `cname.vercel-dns.com`
4. Update `AUTH_URL` env var to `https://school.emergingedge.com`
5. Redeploy

---

## 8. Security checklist (production)

- [ ] Change all demo passwords (`admin123`, etc.) or remove demo accounts
- [ ] Set strong `AUTH_SECRET` (never commit to git)
- [ ] Enable Upstash rate limiting
- [ ] MongoDB user has minimum required permissions
- [ ] Cloudinary uploads folder is not public (use authenticated URLs for admin)
- [ ] `AUTH_URL` matches your exact production domain (with https)

---

## 9. Demo accounts (change in production!)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eest.com | admin123 |
| Trainer | trainer@eest.com | trainer123 |
| Student | student@eest.com | student123 |

---

## 10. Useful commands

```bash
npm run db:push    # Sync Prisma schema to MongoDB
npm run db:seed    # Create demo users
npm run build      # Production build test
```
