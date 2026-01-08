# PromoVault - Promotional Flyer Gallery

## Overview
A password-protected gallery for promotional flyers with automatic code assignment, request submissions, and admin analytics.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **Database**: PostgreSQL (Render)
- **File Storage**: Vercel Blob (or Cloudinary)
- **Deployment**: Vercel
- **Auth**: Simple email registration + shared password

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  requests  Request[]
  views     FlyerView[]
}

model Flyer {
  id          String   @id @default(cuid())
  code        String   @unique // Auto-generated: PROMO-0001, PROMO-0002, etc.
  title       String
  description String?
  imageUrl    String
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  views       FlyerView[]
  requests    Request[]
}

model FlyerView {
  id        String   @id @default(cuid())
  flyer     Flyer    @relation(fields: [flyerId], references: [id])
  flyerId   String
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?
  viewedAt  DateTime @default(now())

  @@index([flyerId])
  @@index([userId])
}

model Request {
  id        String   @id @default(cuid())
  flyer     Flyer    @relation(fields: [flyerId], references: [id])
  flyerId   String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  message   String?
  status    RequestStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([flyerId])
  @@index([userId])
}

model Settings {
  id            String @id @default("settings")
  galleryPassword String @default("welcome2024")
  nextFlyerNumber Int   @default(1)
}

enum RequestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## Page Structure

### Public Routes
1. **`/`** - Landing/Login Page
   - Email, First Name, Last Name form
   - Password field
   - Stores user in DB, creates session cookie

2. **`/gallery`** - Main Gallery (Protected)
   - Masonry grid of flyers
   - Click opens modal with full image + request form
   - Tracks views

### Admin Routes (Protected with separate admin password)
3. **`/admin`** - Dashboard
   - Total flyers, total requests, total views stats
   - Recent activity feed

4. **`/admin/flyers`** - Flyer Management
   - Upload new flyers (drag & drop)
   - Auto-assigns code (PROMO-0001, etc.)
   - Edit/delete/toggle active

5. **`/admin/requests`** - Request Management
   - List all requests with status
   - Filter by status, search by code
   - Update status

6. **`/admin/settings`** - Settings
   - Change gallery password
   - View registered users

---

## Design Direction: "Luxury Editorial Gallery"

### Aesthetic
- **Dark mode** with rich blacks (#0a0a0a) and warm accents
- **Gold/Champagne accent** (#d4af37) for highlights and CTAs
- **Editorial typography**: Display font for headers, refined sans for body
- **Dramatic hover states** with scale and glow effects
- **Glass morphism** on modals and cards
- **Smooth staggered animations** on gallery load

### Fonts
- Display: "Playfair Display" (Google Fonts)
- Body: "DM Sans" (Google Fonts)

### Key Visual Elements
- Full-bleed hero on login with gradient overlay
- Masonry grid with varied card sizes
- Floating code badge on each card
- Modal with backdrop blur and slide-up animation
- Micro-interactions on all buttons

---

## Component Breakdown

### `components/ui/`
- `Button.tsx` - Primary/Secondary/Ghost variants
- `Input.tsx` - Styled form inputs
- `Modal.tsx` - Reusable modal with Framer Motion
- `Card.tsx` - Flyer card component
- `Badge.tsx` - Status badges
- `Loader.tsx` - Skeleton loaders

### `components/gallery/`
- `GalleryGrid.tsx` - Masonry layout
- `FlyerCard.tsx` - Individual flyer with hover effects
- `FlyerModal.tsx` - Full view + request form
- `RequestForm.tsx` - Form inside modal

### `components/admin/`
- `Sidebar.tsx` - Admin navigation
- `StatsCard.tsx` - Dashboard stat cards
- `FlyerUploader.tsx` - Drag & drop upload
- `FlyerTable.tsx` - Admin flyer list
- `RequestTable.tsx` - Admin request list

### `components/auth/`
- `LoginForm.tsx` - Registration/login form
- `ProtectedRoute.tsx` - Route guard HOC

---

## API Routes

### Auth
- `POST /api/auth/register` - Create user + verify password
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

### Gallery
- `GET /api/flyers` - List active flyers
- `GET /api/flyers/[id]` - Single flyer details
- `POST /api/flyers/[id]/view` - Track view
- `POST /api/flyers/[id]/request` - Submit request

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/flyers` - All flyers (incl. inactive)
- `POST /api/admin/flyers` - Create flyer
- `PATCH /api/admin/flyers/[id]` - Update flyer
- `DELETE /api/admin/flyers/[id]` - Delete flyer
- `GET /api/admin/requests` - All requests
- `PATCH /api/admin/requests/[id]` - Update request status
- `GET /api/admin/settings` - Get settings
- `PATCH /api/admin/settings` - Update password

### Upload
- `POST /api/upload` - Handle image upload to Vercel Blob

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
ADMIN_PASSWORD="admin123" # For admin routes
NEXTAUTH_SECRET="random-secret-string"
```

---

## Key Features to Implement

### 1. Auto-Generated Codes
```typescript
// In flyer creation
async function generateFlyerCode() {
  const settings = await prisma.settings.findFirst();
  const code = `PROMO-${String(settings.nextFlyerNumber).padStart(4, '0')}`;
  await prisma.settings.update({
    where: { id: 'settings' },
    data: { nextFlyerNumber: settings.nextFlyerNumber + 1 }
  });
  return code;
}
```

### 2. View Tracking
```typescript
// Track when user opens flyer modal
async function trackView(flyerId: string, userId?: string) {
  await prisma.flyerView.create({
    data: { flyerId, userId }
  });
}
```

### 3. Gallery Animation (Framer Motion)
```tsx
// Staggered grid animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

### 4. Session Management
Use `iron-session` or simple encrypted cookies for lightweight auth.

---

## Build Order (For Cursor)

1. **Setup**: `npx create-next-app@latest promo-vault --typescript --tailwind --app`
2. **Install deps**: `npm i prisma @prisma/client framer-motion iron-session @vercel/blob`
3. **Database**: Set up Prisma schema, run migrations
4. **Auth flow**: Login page + session management
5. **Gallery**: Grid + modal + request form
6. **Admin**: Dashboard + flyer management + request management
7. **Polish**: Animations, loading states, error handling
8. **Deploy**: Vercel + Render Postgres

---

## Sample Cursor Prompts

### Prompt 1: Initial Setup
```
Create a Next.js 14 app with App Router, Tailwind, and Prisma. Set up the database schema from the PROJECT_SPEC.md file. Include the Settings, User, Flyer, FlyerView, and Request models. Configure for PostgreSQL.
```

### Prompt 2: Auth & Login
```
Build the login page at app/page.tsx with a luxury dark theme. Use Playfair Display for headers, DM Sans for body. Include email, firstName, lastName fields and a password field. Create the /api/auth/register endpoint that validates password against Settings table and creates/retrieves user. Use iron-session for session management.
```

### Prompt 3: Gallery
```
Create the gallery page at app/gallery/page.tsx. Fetch flyers from /api/flyers. Display in a masonry grid using CSS columns. Each FlyerCard shows the image with a gold PROMO-XXXX badge overlay. On hover, scale up slightly with a glow effect. Clicking opens a modal with the full image and a request form. Track views when modal opens.
```

### Prompt 4: Admin Dashboard
```
Create admin layout at app/admin/layout.tsx with a dark sidebar. Build dashboard at app/admin/page.tsx showing: total flyers, total requests (by status), total views, and top 5 most viewed flyers. Use Framer Motion for number count-up animations.
```

### Prompt 5: Flyer Upload
```
Create app/admin/flyers/page.tsx with a drag-and-drop uploader using @vercel/blob. Auto-generate PROMO-XXXX codes. Show all flyers in a table with edit/delete/toggle active actions. Include search and filter by active status.
```

---

## Quick Win Animations

```css
/* Glow effect on hover */
.flyer-card:hover {
  box-shadow: 0 0 40px rgba(212, 175, 55, 0.3);
  transform: scale(1.02);
}

/* Staggered fade-in */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.flyer-card {
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
}
```

---

## Done! 🎉

This spec gives Cursor everything it needs. Feed it section by section and iterate. The luxury editorial direction will absolutely WOW compared to a basic Wix gallery.
