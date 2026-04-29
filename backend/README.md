# ARHDAY Backend API

Production-ready REST API for the ARHDAY Photography Portfolio.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | Same ecosystem as Next.js frontend; non-blocking I/O ideal for file uploads |
| Framework | Express + TypeScript | Lightweight, flexible, excellent ecosystem |
| ORM | Prisma | TypeScript-first, migrations built-in, excellent DX |
| Database | PostgreSQL 16 | Relational integrity for projects/images; JSON support for settings |
| Cache | Redis 7 | TTL-based response caching; rate-limit state |
| Auth | JWT (access + refresh) | Stateless access tokens + DB-tracked refresh tokens for revocation |
| Images | Cloudinary | CDN, auto-optimisation, transformations |
| Email | SendGrid | Transactional delivery, analytics |
| Validation | Zod | TypeScript-native, composable schemas |
| Logging | Winston | Structured JSON in prod, coloured dev output, daily rotation |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env
# Edit .env with your credentials

# 3. Start infrastructure (Postgres + Redis)
docker compose up postgres redis -d

# 4. Run migrations + seed
npm run db:migrate
npm run db:seed

# 5. Start dev server (hot reload)
npm run dev
```

**Default admin:** `bookarhday@gmail.com` / `Admin@1234`

---

## Project Structure

```
src/
├── app.ts               ← Express app (middleware + routes)
├── server.ts            ← Entry point (start + graceful shutdown)
├── config/
│   ├── index.ts         ← Env validation (Zod)
│   ├── database.ts      ← Prisma singleton
│   └── redis.ts         ← Redis client + cache helpers
├── middleware/
│   ├── auth.middleware.ts      ← JWT verify, role guards
│   ├── error.middleware.ts     ← Global error handler
│   ├── rateLimit.middleware.ts ← express-rate-limit configs
│   └── validate.middleware.ts  ← Zod request validation
├── modules/
│   ├── auth/            ← Login, refresh, logout, change-password
│   ├── contact/         ← Inquiry submission + admin management
│   ├── projects/        ← Portfolio CRUD with caching
│   ├── testimonials/    ← Testimonials + IP-based likes
│   ├── services/        ← Photography services list
│   ├── subscribers/     ← Email list with unsubscribe flow
│   └── uploads/         ← Cloudinary image handling
└── shared/
    ├── errors/AppError.ts   ← Typed error classes
    └── utils/
        ├── cloudinary.ts    ← Upload/delete/optimise
        ├── email.ts         ← SendGrid + HTML templates
        ├── jwt.ts           ← Sign/verify tokens
        ├── logger.ts        ← Winston logger
        └── response.ts      ← Standardised API envelope
```

---

## Database Schema

```
users          ← Admin accounts
sessions       ← Refresh token store (1:N with users)
projects       ← Portfolio entries
project_images ← Gallery images per project
testimonials   ← Client testimonials
testimonial_likes ← IP-deduplicated likes
services       ← Services offered (Photography, Film, etc.)
contact_inquiries ← Booking requests
subscribers    ← Email list
site_settings  ← Key/value CMS settings
```

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login with email + password |
| POST | `/auth/refresh` | Public | Rotate access token |
| POST | `/auth/logout` | Public | Invalidate refresh token |
| POST | `/auth/logout-all` | Admin | Revoke all sessions |
| GET | `/auth/me` | Admin | Get own profile |
| PATCH | `/auth/change-password` | Admin | Update password |

**Login Request:**
```json
POST /api/v1/auth/login
{
  "email": "bookarhday@gmail.com",
  "password": "Admin@1234"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    },
    "user": {
      "id": "clx...",
      "email": "bookarhday@gmail.com",
      "name": "Adegheosa",
      "role": "SUPER_ADMIN"
    }
  }
}
```

---

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects` | Public | List published projects (paginated) |
| GET | `/projects/:slug` | Public | Get project by slug |
| POST | `/projects` | Admin | Create project |
| PATCH | `/projects/:id` | Admin | Update project |
| DELETE | `/projects/:id` | Admin | Delete project + images |

**Query params:** `?page=1&limit=10&category=Portrait&featured=true`

**Create Project:**
```json
POST /api/v1/projects
Authorization: Bearer <access_token>

{
  "title": "Red Light Studio",
  "category": "Portrait",
  "year": "2024",
  "summary": "Exploring raw emotion under dramatic red lighting.",
  "coverImage": "https://res.cloudinary.com/...",
  "tags": ["portrait", "red-light", "studio"],
  "featured": true
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/contact` | Public (rate limited) | Submit inquiry |
| GET | `/contact` | Admin | List inquiries |
| GET | `/contact/stats` | Admin | Inquiry stats |
| GET | `/contact/:id` | Admin | Get inquiry (auto-marks as read) |
| PATCH | `/contact/:id` | Admin | Update status/notes |
| DELETE | `/contact/:id` | Admin | Archive/delete |

**Submit Inquiry:**
```json
POST /api/v1/contact
{
  "email": "client@example.com",
  "name": "Temi Adebayo",
  "location": "Lagos, Nigeria",
  "message": "I'd love to book a fashion shoot for my brand launch in August."
}
```

---

### Testimonials

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/testimonials` | Public | List published testimonials |
| POST | `/testimonials` | Admin | Create testimonial |
| PATCH | `/testimonials/:id` | Admin | Update |
| DELETE | `/testimonials/:id` | Admin | Delete |
| POST | `/testimonials/:id/like` | Public (rate limited) | Toggle like (IP-deduplicated) |
| GET | `/testimonials/:id/like-status` | Public | Check if current IP liked |

---

### Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/uploads/image` | Admin | Upload general image to Cloudinary |
| POST | `/uploads/projects/:id/cover` | Admin | Upload project cover |
| POST | `/uploads/projects/:id/images` | Admin | Upload gallery (up to 10) |
| DELETE | `/uploads/images/:imageId` | Admin | Delete gallery image |
| POST | `/uploads/testimonials/:id/avatar` | Admin | Upload avatar |

**Upload (multipart/form-data):**
```bash
curl -X POST http://localhost:4000/api/v1/uploads/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@photo.jpg"
```

---

### Subscribers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subscribers` | Public | Subscribe email |
| POST | `/subscribers/unsubscribe` | Public | Unsubscribe via token |
| GET | `/subscribers` | Admin | List subscribers |
| GET | `/subscribers/stats` | Admin | Subscriber stats |

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email address" }
    ]
  }
}
```

**Error codes:** `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`

---

## Security

- **Helmet** — HTTP security headers
- **CORS** — origin allowlist enforced
- **Rate limiting** — global (100 req/15min) + strict (5 req/15min) for contact/auth
- **JWT rotation** — refresh tokens rotated on every use
- **Bcrypt** — passwords hashed with cost factor 12
- **Input validation** — all inputs validated with Zod before DB access
- **Non-root Docker** — container runs as `nodejs` user
- **Environment validation** — server refuses to start with missing/invalid env vars

---

## Deployment

### Docker (recommended)

```bash
# Build
docker build -t arhday-backend .

# Run with docker compose
docker compose up -d

# Run migrations on deploy
docker compose exec api npx prisma migrate deploy
```

### Cloud Options

| Provider | Setup |
|---|---|
| **Railway** | Connect GitHub repo, set env vars, auto-deploys |
| **Render** | Docker deploy, managed Postgres + Redis add-ons |
| **DigitalOcean App Platform** | Docker registry, managed DB |
| **AWS ECS** | Full control, push image to ECR |

### Environment Variables (production minimum)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SENDGRID_API_KEY=...
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

Generate secrets: `openssl rand -hex 32`

---

## Connecting to the Frontend

Add to your Next.js `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Example fetch in Next.js:

```typescript
// app/actions/contact.ts
'use server'

export async function submitContact(data: ContactFormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
```
