# PromoVault - Quick Start Guide

## 🚀 Get Running in 15 Minutes

### Step 1: Create Next.js Project (2 min)

```bash
npx create-next-app@latest promo-vault --typescript --tailwind --app --eslint
cd promo-vault
```

### Step 2: Install Dependencies (1 min)

```bash
npm install prisma @prisma/client framer-motion iron-session @vercel/blob
npm install -D prisma
```

### Step 3: Copy Files from This Folder

Copy these files to your project:
- `prisma/schema.prisma` → `prisma/schema.prisma`
- `tailwind.config.ts` → `tailwind.config.ts` (replace existing)
- `app/globals.css` → `app/globals.css` (replace existing)
- `app/page.tsx` → `app/page.tsx` (replace existing)
- `app/gallery/page.tsx` → `app/gallery/page.tsx`
- `app/admin/layout.tsx` → `app/admin/layout.tsx`
- `app/admin/page.tsx` → `app/admin/page.tsx`
- `app/admin/flyers/page.tsx` → `app/admin/flyers/page.tsx`
- `app/admin/requests/page.tsx` → `app/admin/requests/page.tsx`
- `app/admin/settings/page.tsx` → `app/admin/settings/page.tsx`

### Step 4: Setup Render PostgreSQL (5 min)

1. Go to https://render.com
2. Create new PostgreSQL database
3. Copy the "External Database URL"
4. Create `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
ADMIN_PASSWORD="your-admin-password"
NEXTAUTH_SECRET="generate-random-string-here"
```

### Step 5: Initialize Database (2 min)

```bash
npx prisma generate
npx prisma db push
```

### Step 6: Create API Routes

**Tell Cursor:**
```
Create these API routes based on the PROJECT_SPEC.md:

1. app/api/auth/register/route.ts - POST: Validate password from Settings, create/find user, set session cookie
2. app/api/auth/me/route.ts - GET: Return current user from session
3. app/api/auth/logout/route.ts - POST: Clear session cookie
4. app/api/flyers/route.ts - GET: Return active flyers
5. app/api/flyers/[id]/view/route.ts - POST: Track flyer view
6. app/api/flyers/[id]/request/route.ts - POST: Create request
7. app/api/admin/stats/route.ts - GET: Dashboard stats
8. app/api/admin/flyers/route.ts - GET/POST: List and create flyers
9. app/api/admin/flyers/[id]/route.ts - PATCH/DELETE: Update and delete flyers
10. app/api/admin/requests/route.ts - GET: List all requests
11. app/api/admin/requests/[id]/route.ts - PATCH: Update request status
12. app/api/admin/settings/route.ts - GET/PATCH: Get and update settings
13. app/api/admin/users/route.ts - GET: List registered users
14. app/api/upload/route.ts - POST: Handle image upload to Vercel Blob

Use iron-session for session management. Auto-generate PROMO-XXXX codes for new flyers.
```

### Step 7: Setup Vercel Blob (2 min)

1. Go to Vercel dashboard
2. Create new Blob store
3. Add to `.env`:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### Step 8: Deploy to Vercel (3 min)

```bash
vercel
```

Add environment variables in Vercel dashboard.

---

## 📁 File Structure

```
promo-vault/
├── prisma/
│   └── schema.prisma
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (Login)
│   ├── gallery/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   ├── flyers/
│   │   │   └── page.tsx
│   │   ├── requests/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── me/route.ts
│       │   └── logout/route.ts
│       ├── flyers/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── view/route.ts
│       │       └── request/route.ts
│       ├── admin/
│       │   ├── stats/route.ts
│       │   ├── flyers/
│       │   │   ├── route.ts
│       │   │   └── [id]/route.ts
│       │   ├── requests/
│       │   │   ├── route.ts
│       │   │   └── [id]/route.ts
│       │   ├── settings/route.ts
│       │   └── users/route.ts
│       └── upload/route.ts
└── tailwind.config.ts
```

---

## 🎯 Cursor Prompts for API Routes

### Auth Register
```
Create app/api/auth/register/route.ts:
- POST handler that accepts { email, firstName, lastName, password }
- Fetches Settings to get galleryPassword
- If password doesn't match, return 401
- Find or create User by email (update name if exists)
- Create iron-session with user data
- Return user object
```

### Flyers API
```
Create app/api/flyers/route.ts:
- GET handler returns all active flyers ordered by createdAt desc
- Include _count for views and requests

Create app/api/flyers/[id]/view/route.ts:
- POST creates a FlyerView record
- Get userId from session if logged in

Create app/api/flyers/[id]/request/route.ts:
- POST creates Request with { message } from body
- Requires userId from session
```

### Admin Stats
```
Create app/api/admin/stats/route.ts:
- Return: totalFlyers, totalViews, totalRequests, pendingRequests, completedRequests, totalUsers
- Include topFlyers (top 5 by views with _count)
- Include recentRequests (last 5 with flyer and user data)
```

### Admin Flyers
```
Create app/api/admin/flyers/route.ts:
- GET: Return all flyers (including inactive) with _count
- POST: Create flyer with auto-generated code (PROMO-XXXX from Settings.nextFlyerNumber)

Create app/api/admin/flyers/[id]/route.ts:
- PATCH: Update flyer (title, description, active)
- DELETE: Delete flyer
```

### Upload
```
Create app/api/upload/route.ts:
- Use @vercel/blob put() to upload file
- Return { url: blob.url }
```

---

## ✅ Done!

Your client now has:
- ✨ Stunning dark theme gallery with gold accents
- 🔐 Password-protected access with user registration
- 📊 Full admin dashboard with stats
- 🖼️ Drag-and-drop flyer upload
- 🏷️ Auto-generated PROMO codes
- 📬 Request submission from gallery
- 👁️ View tracking analytics
- ⚡ Fast deployment on Vercel
