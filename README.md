# Prayaas — Biodata Portal

Simple **Next.js** app for collecting matrimony biodata and UPI payment screenshots, plus an **admin dashboard** for verification.

## Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS  
- **API:** Route handlers (`/api/*`)  
- **Database:** PostgreSQL via **Prisma ORM** (v6)  
- **Auth:** Auth.js / NextAuth v5 (credentials, JWT)  
- **Uploads:** Local folder `data/uploads` (see hosting note below)

## Quick start (local)

1. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL` to a PostgreSQL connection string (see `docker-compose.yml` for a local example).

2. **Install & database**

   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed
   ```

3. **Run**

   ```bash
   npm run dev
   ```

- Public form: [http://localhost:3000](http://localhost:3000)  
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
- Default seed admin (change in `.env` before `db:seed`): see `.env.example`

### Local PostgreSQL with Docker

```bash
docker compose up -d
```

Use:

`DATABASE_URL="postgresql://matrimony:matrimony@localhost:5433/matrimony"`

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL (`postgresql://…`) |
| `AUTH_SECRET` | Yes in production | Random string; use `openssl rand -base64 32` |
| `ADMIN_EMAIL` | For seeding | Email for the admin user |
| `ADMIN_PASSWORD` | For seeding | Password hashed on seed |
| `NEXT_PUBLIC_COMMUNITY_NAME` | No | Shown on the public page |
| `NEXT_PUBLIC_UPI_ID` | No | UPI ID displayed to applicants |
| `NEXT_PUBLIC_REGISTRATION_FEE_INR` | No | Amount in rupees (e.g. `501`) |
| `NEXT_PUBLIC_UPI_QR_IMAGE` | No | Path or URL to QR image (default `/upi-qr.svg`) |

Replace `public/upi-qr.svg` with your real UPI QR, or point `NEXT_PUBLIC_UPI_QR_IMAGE` at a hosted image.

## API (summary)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/submissions` | Public multipart submit (fields + biodata + payment file) |
| `POST` | `/api/upload` | Optional single-file upload (`kind`, `file`) |
| `GET` | `/api/admin/submissions` | List submissions (auth) query: `q`, `gender`, `status`, `dateFrom`, `dateTo` |
| `PATCH` | `/api/admin/submissions/:id` | Body: `{ "paymentStatus": "Pending" \| "Verified" \| "Rejected" }` |
| `*` | `/api/auth/*` | NextAuth routes |

Uploaded files are **not** publicly accessible; admins open them via `/api/admin/files/biodata/…` and `/api/admin/files/payment/…` (session required).

## Deployment

### Vercel + managed Postgres (Neon, Supabase, Railway, etc.)

1. Create a PostgreSQL database and set `DATABASE_URL` in the Vercel project.  
2. Set `AUTH_SECRET` and other vars from `.env.example`.  
3. Build command: `prisma generate && next build` (default `postinstall` already runs `prisma generate`).  
4. Run migrations once against the remote DB:

   ```bash
   DATABASE_URL="postgresql://…from host…" npx prisma migrate deploy
   ```

5. Seed admin (from your machine or CI):

   ```bash
   DATABASE_URL="…" ADMIN_EMAIL="…" ADMIN_PASSWORD="…" npm run db:seed
   ```

### File storage on serverless (important)

Vercel’s filesystem is **ephemeral**; uploads under `data/uploads` will not persist across invocations. For production on Vercel you should:

- use **Vercel Blob**, **S3-compatible storage**, **Supabase Storage**, or **Cloudinary**, and  
- adjust the upload layer (replace `lib/storage.ts` / submission handler) to write and read from that backend.

Running the app on a **VPS or Railway** with a persistent disk is the smallest change if you want to keep the current filesystem approach.

### HTTPS

Use the platform’s TLS (e.g. Vercel default). Do not serve admin or uploads over plain HTTP in production.

## Project layout

- `app/page.tsx` — Public biodata + payment flow  
- `app/admin/` — Login + submissions table  
- `app/api/` — Submissions, uploads, admin APIs, NextAuth  
- `lib/storage.ts` — File validation and local storage keys  
- `lib/auth.ts` — NextAuth configuration  
- `prisma/schema.prisma` — `submissions`, `admin_users`  
- `prisma/migrations/` — SQL migrations  

## License

Private / community use — adjust as needed.
