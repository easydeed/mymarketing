# PromoVault - Cursor Build Instructions

## Overview
Build a promotional flyer gallery with categories, subcategories, and admin management. Follow these instructions in order.

---

## PHASE 1: Update Database Schema

Replace `prisma/schema.prisma` with this updated schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Simplified User - just email for login
model User {
  id        String      @id @default(cuid())
  email     String      @unique
  createdAt DateTime    @default(now())
  requests  Request[]
  views     FlyerView[]
  loginLogs LoginLog[]
}

// Track every login attempt
model LoginLog {
  id        String   @id @default(cuid())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId    String?
  email     String   // Store email even if user deleted
  success   Boolean
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}

// Top-level categories: Flyers, Letters, Postcards, Signs
model Category {
  id            String        @id @default(cuid())
  name          String        @unique
  slug          String        @unique
  description   String?
  sortOrder     Int           @default(0)
  active        Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  subcategories Subcategory[]
}

// Subcategories: For Sale By Owner, Divorced, Sellers, Buyers, etc.
model Subcategory {
  id          String   @id @default(cuid())
  name        String
  slug        String
  description String?
  sortOrder   Int      @default(0)
  active      Boolean  @default(true)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  flyers      Flyer[]

  @@unique([categoryId, slug])
  @@index([categoryId])
}

model Flyer {
  id            String       @id @default(cuid())
  code          String       @unique // Auto-generated: PROMO-0001
  title         String
  description   String?
  imageUrl      String
  active        Boolean      @default(true)
  subcategory   Subcategory  @relation(fields: [subcategoryId], references: [id], onDelete: Cascade)
  subcategoryId String
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  views         FlyerView[]
  requests      Request[]

  @@index([subcategoryId])
}

model FlyerView {
  id        String   @id @default(cuid())
  flyer     Flyer    @relation(fields: [flyerId], references: [id], onDelete: Cascade)
  flyerId   String
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId    String?
  viewedAt  DateTime @default(now())

  @@index([flyerId])
  @@index([userId])
}

model Request {
  id        String        @id @default(cuid())
  flyer     Flyer         @relation(fields: [flyerId], references: [id], onDelete: Cascade)
  flyerId   String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  message   String?
  status    RequestStatus @default(PENDING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([flyerId])
  @@index([userId])
  @@index([status])
}

model Settings {
  id              String @id @default("settings")
  galleryPassword String @default("welcome2024")
  nextFlyerNumber Int    @default(1)
}

enum RequestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

After updating, run:
```bash
npx prisma generate
npx prisma db push
```

---

## PHASE 2: Seed Default Categories & Sample Flyers

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Settings if not exists
  await prisma.settings.upsert({
    where: { id: 'settings' },
    update: {},
    create: { id: 'settings', galleryPassword: 'welcome2024', nextFlyerNumber: 1 },
  });

  // Define categories and subcategories
  const categoriesData = [
    {
      name: 'Flyers',
      slug: 'flyers',
      description: 'Promotional flyers for various campaigns',
      sortOrder: 1,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Divorced', slug: 'divorced', sortOrder: 2 },
        { name: 'Sellers', slug: 'sellers', sortOrder: 3 },
        { name: 'Buyers', slug: 'buyers', sortOrder: 4 },
        { name: 'Expired Listings', slug: 'expired', sortOrder: 5 },
        { name: 'Just Listed', slug: 'just-listed', sortOrder: 6 },
        { name: 'Just Sold', slug: 'just-sold', sortOrder: 7 },
      ],
    },
    {
      name: 'Letters',
      slug: 'letters',
      description: 'Professional letter templates',
      sortOrder: 2,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Divorced', slug: 'divorced', sortOrder: 2 },
        { name: 'Sellers', slug: 'sellers', sortOrder: 3 },
        { name: 'Buyers', slug: 'buyers', sortOrder: 4 },
        { name: 'Introduction', slug: 'introduction', sortOrder: 5 },
        { name: 'Follow Up', slug: 'follow-up', sortOrder: 6 },
      ],
    },
    {
      name: 'Postcards',
      slug: 'postcards',
      description: 'Eye-catching postcard designs',
      sortOrder: 3,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Divorced', slug: 'divorced', sortOrder: 2 },
        { name: 'Sellers', slug: 'sellers', sortOrder: 3 },
        { name: 'Buyers', slug: 'buyers', sortOrder: 4 },
        { name: 'Market Update', slug: 'market-update', sortOrder: 5 },
        { name: 'Holidays', slug: 'holidays', sortOrder: 6 },
      ],
    },
    {
      name: 'Signs',
      slug: 'signs',
      description: 'Yard signs and banners',
      sortOrder: 4,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Open House', slug: 'open-house', sortOrder: 2 },
        { name: 'For Sale', slug: 'for-sale', sortOrder: 3 },
        { name: 'Sold', slug: 'sold', sortOrder: 4 },
        { name: 'Coming Soon', slug: 'coming-soon', sortOrder: 5 },
      ],
    },
  ];

  // Create categories with subcategories
  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: { name: catData.name, description: catData.description, sortOrder: catData.sortOrder },
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        sortOrder: catData.sortOrder,
      },
    });

    for (const subData of catData.subcategories) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: subData.slug } },
        update: { name: subData.name, sortOrder: subData.sortOrder },
        create: {
          name: subData.name,
          slug: subData.slug,
          sortOrder: subData.sortOrder,
          categoryId: category.id,
        },
      });
    }
  }

  // Get current flyer number
  let settings = await prisma.settings.findFirst();
  let flyerNumber = settings?.nextFlyerNumber || 1;

  // Sample flyers - using placeholder images
  const sampleFlyers = [
    // Flyers
    { category: 'flyers', subcategory: 'fsbo', title: 'FSBO Expert Help', description: 'Help For Sale By Owner sellers get top dollar' },
    { category: 'flyers', subcategory: 'fsbo', title: 'FSBO Success Guide', description: 'Free guide for FSBO sellers' },
    { category: 'flyers', subcategory: 'divorced', title: 'Divorce Home Solutions', description: 'Sensitive handling of divorce home sales' },
    { category: 'flyers', subcategory: 'sellers', title: 'Home Value Report', description: 'Free home valuation for sellers' },
    { category: 'flyers', subcategory: 'sellers', title: 'Seller Success Program', description: 'Our proven selling system' },
    { category: 'flyers', subcategory: 'buyers', title: 'First Time Buyer Guide', description: 'Everything first-time buyers need to know' },
    { category: 'flyers', subcategory: 'buyers', title: 'Buyer Advantage Program', description: 'Get ahead in competitive markets' },
    { category: 'flyers', subcategory: 'expired', title: 'Expired Listing Revival', description: 'We sell homes others couldnt' },
    { category: 'flyers', subcategory: 'just-listed', title: 'Just Listed Announcement', description: 'New property on the market' },
    { category: 'flyers', subcategory: 'just-sold', title: 'Just Sold Celebration', description: 'Another successful sale' },
    
    // Letters
    { category: 'letters', subcategory: 'fsbo', title: 'FSBO Introduction Letter', description: 'Professional intro to FSBO sellers' },
    { category: 'letters', subcategory: 'divorced', title: 'Divorce Situation Letter', description: 'Compassionate outreach letter' },
    { category: 'letters', subcategory: 'sellers', title: 'Seller Prospecting Letter', description: 'Generate seller leads' },
    { category: 'letters', subcategory: 'buyers', title: 'Buyer Welcome Letter', description: 'Welcome new buyer clients' },
    { category: 'letters', subcategory: 'introduction', title: 'Agent Introduction', description: 'Introduce yourself to the neighborhood' },
    { category: 'letters', subcategory: 'follow-up', title: 'Follow Up Letter', description: 'Stay in touch with prospects' },
    
    // Postcards
    { category: 'postcards', subcategory: 'fsbo', title: 'FSBO Postcard Series #1', description: 'First touch FSBO postcard' },
    { category: 'postcards', subcategory: 'fsbo', title: 'FSBO Postcard Series #2', description: 'Follow-up FSBO postcard' },
    { category: 'postcards', subcategory: 'divorced', title: 'Life Changes Postcard', description: 'Sensitive outreach postcard' },
    { category: 'postcards', subcategory: 'sellers', title: 'Thinking of Selling?', description: 'Seller prospecting postcard' },
    { category: 'postcards', subcategory: 'buyers', title: 'Dream Home Awaits', description: 'Buyer attraction postcard' },
    { category: 'postcards', subcategory: 'market-update', title: 'Q1 Market Update', description: 'Quarterly market statistics' },
    { category: 'postcards', subcategory: 'holidays', title: 'Holiday Greetings', description: 'Seasonal holiday postcard' },
    
    // Signs
    { category: 'signs', subcategory: 'fsbo', title: 'FSBO Rider Sign', description: 'Add-on sign for FSBO properties' },
    { category: 'signs', subcategory: 'open-house', title: 'Open House Directional', description: 'Arrow sign for open houses' },
    { category: 'signs', subcategory: 'open-house', title: 'Open House Main Sign', description: 'Primary open house sign' },
    { category: 'signs', subcategory: 'for-sale', title: 'For Sale Yard Sign', description: 'Standard for sale sign' },
    { category: 'signs', subcategory: 'sold', title: 'SOLD Rider', description: 'Sold overlay for signs' },
    { category: 'signs', subcategory: 'coming-soon', title: 'Coming Soon Sign', description: 'Pre-listing announcement sign' },
  ];

  for (const flyer of sampleFlyers) {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        slug: flyer.subcategory,
        category: { slug: flyer.category },
      },
    });

    if (subcategory) {
      const code = `PROMO-${String(flyerNumber).padStart(4, '0')}`;
      
      // Use placeholder image - in production, replace with real images
      const colors = ['1a1a2e', '16213e', '0f3460', '533483', '4a0e4e', '2c3e50', '1e3d59', '2d4059'];
      const color = colors[flyerNumber % colors.length];
      const imageUrl = `https://placehold.co/600x800/${color}/d4af37?text=${encodeURIComponent(flyer.title.split(' ').slice(0, 2).join('+'))}`;
      
      await prisma.flyer.upsert({
        where: { code },
        update: {},
        create: {
          code,
          title: flyer.title,
          description: flyer.description,
          imageUrl,
          subcategoryId: subcategory.id,
        },
      });
      
      flyerNumber++;
    }
  }

  // Update next flyer number
  await prisma.settings.update({
    where: { id: 'settings' },
    data: { nextFlyerNumber: flyerNumber },
  });

  console.log('✅ Seed completed!');
  console.log(`   - 4 categories created`);
  console.log(`   - ${sampleFlyers.length} sample flyers created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Install ts-node and run seed:
```bash
npm install -D ts-node
npx prisma db seed
```

---

## PHASE 3: Update Login Page (Email + Password Only)

Update `app/page.tsx` - Remove firstName/lastName fields, keep only email and password:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      router.push("/gallery");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vault-black via-vault-dark to-gold-900/20" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-6xl font-bold text-white mb-4">
              Promo<span className="text-gradient">Vault</span>
            </h1>
            <p className="text-vault-text-muted text-xl max-w-md">
              Your exclusive gateway to premium promotional materials.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-vault-black">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-white">
              Promo<span className="text-gradient">Vault</span>
            </h1>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold text-white mb-2">
                Welcome
              </h2>
              <p className="text-vault-text-muted">
                Enter your email to access the gallery
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-vault-text-muted mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-dark"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-vault-text-muted mb-2">
                  Access Password
                </label>
                <input
                  type="password"
                  required
                  className="input-dark"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Accessing...
                  </span>
                ) : (
                  "Enter Gallery"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-vault-text-muted text-sm mt-6">
            Need access?{" "}
            <a href="mailto:contact@example.com" className="text-gold-400 hover:text-gold-300">
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## PHASE 4: Create Login API with Logging

Create `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get settings to check password
    const settings = await prisma.settings.findFirst();
    const isValidPassword = password === settings?.galleryPassword;

    // Get IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user && isValidPassword) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // Log the login attempt
    await prisma.loginLog.create({
      data: {
        userId: user?.id || null,
        email,
        success: isValidPassword,
        ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
        userAgent: userAgent.substring(0, 500), // Limit length
      },
    });

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.userId = user!.id;
    session.email = email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ 
      success: true,
      user: { id: user!.id, email: user!.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
```

Create `lib/session.ts`:

```typescript
import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.NEXTAUTH_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'promovault_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};
```

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## PHASE 5: Update Gallery Page with Categories

Update `app/gallery/page.tsx` to show categories and subcategories:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  _count: { flyers: number };
}

interface Flyer {
  id: string;
  code: string;
  title: string;
  description?: string;
  imageUrl: string;
  subcategory: {
    id: string;
    name: string;
    category: { id: string; name: string };
  };
}

interface User {
  id: string;
  email: string;
}

export default function GalleryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchFlyers(selectedSubcategory);
    } else if (selectedCategory) {
      fetchFlyersByCategory(selectedCategory);
    } else {
      fetchAllFlyers();
    }
  }, [selectedCategory, selectedSubcategory]);

  const fetchData = async () => {
    try {
      const [categoriesRes, userRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/auth/me"),
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories);
        // Select first category by default
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllFlyers = async () => {
    try {
      const res = await fetch("/api/flyers");
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    }
  };

  const fetchFlyersByCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/flyers?categoryId=${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    }
  };

  const fetchFlyers = async (subcategoryId: string) => {
    try {
      const res = await fetch(`/api/flyers?subcategoryId=${subcategoryId}`);
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    }
  };

  const openModal = async (flyer: Flyer) => {
    setSelectedFlyer(flyer);
    setRequestMessage("");
    setSubmitSuccess(false);

    try {
      await fetch(`/api/flyers/${flyer.id}/view`, { method: "POST" });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const closeModal = () => {
    setSelectedFlyer(null);
    setRequestMessage("");
    setSubmitSuccess(false);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlyer) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/flyers/${selectedFlyer.id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMessage }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setRequestMessage("");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-vault-text-muted">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-black">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">
            Promo<span className="text-gradient">Vault</span>
          </h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-vault-text-muted text-sm">
                {user.email}
              </span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="btn-ghost text-sm py-2 px-4"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-gold-500 text-vault-black"
                    : "bg-vault-gray text-vault-text hover:bg-vault-muted"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Pills */}
        {currentCategory && currentCategory.subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedSubcategory
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "bg-vault-gray text-vault-text-muted hover:text-white"
                }`}
              >
                All {currentCategory.name}
              </button>
              {currentCategory.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSubcategory === sub.id
                      ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                      : "bg-vault-gray text-vault-text-muted hover:text-white"
                  }`}
                >
                  {sub.name}
                  <span className="ml-2 text-xs opacity-60">
                    ({sub._count.flyers})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {flyers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-vault-text-muted text-lg">
              No items in this category yet.
            </p>
          </div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${selectedSubcategory}`}
            variants={container}
            initial="hidden"
            animate="show"
            className="masonry-grid"
          >
            {flyers.map((flyer) => (
              <motion.div
                key={flyer.id}
                variants={item}
                className="masonry-item"
              >
                <button
                  onClick={() => openModal(flyer)}
                  className="flyer-card w-full text-left group"
                >
                  <div className="relative">
                    <img
                      src={flyer.imageUrl}
                      alt={flyer.title}
                      className="w-full rounded-xl"
                    />
                    <div className="absolute top-3 right-3 badge-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {flyer.code}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-vault-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-gold-400 text-xs mb-1">
                        {flyer.subcategory.category.name} / {flyer.subcategory.name}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-white truncate">
                        {flyer.title}
                      </h3>
                      <p className="text-vault-text-muted text-sm">{flyer.code}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Modal - same as before */}
      <AnimatePresence>
        {selectedFlyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:w-1/2 relative bg-vault-dark">
                <img
                  src={selectedFlyer.imageUrl}
                  alt={selectedFlyer.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gold-400 text-xs mb-2">
                      {selectedFlyer.subcategory.category.name} / {selectedFlyer.subcategory.name}
                    </p>
                    <span className="badge-gold mb-2 inline-block">
                      {selectedFlyer.code}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white">
                      {selectedFlyer.title}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-vault-text-muted hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedFlyer.description && (
                  <p className="text-vault-text-muted mb-6">
                    {selectedFlyer.description}
                  </p>
                )}

                <div className="flex-1" />

                <div className="border-t border-vault-border pt-6">
                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="font-display text-xl font-semibold text-white mb-2">
                        Request Submitted!
                      </h4>
                      <p className="text-vault-text-muted">
                        We'll be in touch about <span className="text-gold-400">{selectedFlyer.code}</span>
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <h4 className="font-display text-lg font-semibold text-white mb-4">
                        Request This Item
                      </h4>
                      <form onSubmit={handleRequest} className="space-y-4">
                        <div>
                          <label className="block text-sm text-vault-text-muted mb-2">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            className="input-dark resize-none h-24"
                            placeholder="Any special requirements..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-gold w-full disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Request"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## PHASE 6: Add Login Logs to Admin

Create `app/admin/logs/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LoginLog {
  id: string;
  email: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
  } | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    if (filter === "SUCCESS") return log.success;
    if (filter === "FAILED") return !log.success;
    return true;
  });

  const successCount = logs.filter((l) => l.success).length;
  const failedCount = logs.filter((l) => !l.success).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-white">Login Logs</h1>
        <p className="text-vault-text-muted mt-1">
          Track all login attempts to the gallery
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stats-card">
          <p className="text-vault-text-muted text-sm">Total Attempts</p>
          <p className="font-display text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="stats-card">
          <p className="text-vault-text-muted text-sm">Successful</p>
          <p className="font-display text-2xl font-bold text-green-400">{successCount}</p>
        </div>
        <div className="stats-card">
          <p className="text-vault-text-muted text-sm">Failed</p>
          <p className="font-display text-2xl font-bold text-red-400">{failedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["ALL", "SUCCESS", "FAILED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                : "text-vault-text-muted hover:text-white hover:bg-vault-gray"
            }`}
          >
            {f === "ALL" ? "All" : f === "SUCCESS" ? "Successful" : "Failed"}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vault-border">
                <th className="text-left p-4 text-vault-text-muted font-medium">Time</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">Email</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">Status</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">IP Address</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">Browser</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-vault-text-muted">
                    No login attempts yet
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-vault-border/50 hover:bg-vault-gray/30 transition-colors"
                  >
                    <td className="p-4 text-white">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-white">{log.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          log.success
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.success ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        {log.success ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="p-4 text-vault-text-muted font-mono text-sm">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="p-4 text-vault-text-muted text-sm max-w-[200px] truncate">
                      {log.userAgent?.split(" ")[0] || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
```

Update `app/admin/layout.tsx` to add Login Logs nav item:

Add this to the navItems array:
```tsx
{
  name: "Login Logs",
  href: "/admin/logs",
  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
},
```

---

## PHASE 7: Add Category Management to Admin

Create `app/admin/categories/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  _count: { flyers: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  subcategories: Subcategory[];
  _count: { subcategories: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        await fetchCategories();
        setShowCategoryModal(false);
        setCategoryForm({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategoryId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subcategoryForm),
      });
      if (res.ok) {
        await fetchCategories();
        setShowSubcategoryModal(false);
        setSubcategoryForm({ name: "" });
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryActive = async (category: Category) => {
    try {
      await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !category.active }),
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling category:", error);
    }
  };

  const toggleSubcategoryActive = async (categoryId: string, subcategoryId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling subcategory:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-white">Categories</h1>
          <p className="text-vault-text-muted mt-1">Manage categories and subcategories</p>
        </motion.div>
        <button onClick={() => setShowCategoryModal(true)} className="btn-gold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl overflow-hidden"
          >
            {/* Category Header */}
            <div className="p-6 flex items-center justify-between border-b border-vault-border">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">{category.name}</h2>
                {category.description && (
                  <p className="text-vault-text-muted text-sm mt-1">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setShowSubcategoryModal(true);
                  }}
                  className="btn-ghost text-sm py-2"
                >
                  + Add Subcategory
                </button>
                <button
                  onClick={() => toggleCategoryActive(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    category.active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-vault-muted text-vault-text-muted"
                  }`}
                >
                  {category.active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="p-4">
              {category.subcategories.length === 0 ? (
                <p className="text-vault-text-muted text-center py-4">No subcategories yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-vault-dark rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{sub.name}</p>
                        <p className="text-vault-text-muted text-xs">{sub._count.flyers} items</p>
                      </div>
                      <button
                        onClick={() => toggleSubcategoryActive(category.id, sub.id, sub.active)}
                        className={`w-3 h-3 rounded-full ${
                          sub.active ? "bg-green-400" : "bg-vault-border"
                        }`}
                        title={sub.active ? "Active" : "Inactive"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-semibold text-white mb-6">Add Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="input-dark"
                    placeholder="e.g., Brochures"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">Description</label>
                  <textarea
                    className="input-dark resize-none h-20"
                    placeholder="Optional description..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-gold flex-1 disabled:opacity-50">
                    {isSaving ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Subcategory Modal */}
      <AnimatePresence>
        {showSubcategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubcategoryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-semibold text-white mb-6">Add Subcategory</h2>
              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="input-dark"
                    placeholder="e.g., Luxury Homes"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ name: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowSubcategoryModal(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-gold flex-1 disabled:opacity-50">
                    {isSaving ? "Adding..." : "Add Subcategory"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Add to admin layout navItems:
```tsx
{
  name: "Categories",
  href: "/admin/categories",
  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
},
```

---

## PHASE 8: Required API Routes

Create these API routes:

### `app/api/categories/route.ts`
GET: Return all active categories with their active subcategories and flyer counts

### `app/api/flyers/route.ts`
GET: Accept optional `categoryId` and `subcategoryId` query params to filter flyers

### `app/api/admin/logs/route.ts`
GET: Return all login logs ordered by createdAt desc, include user relation

### `app/api/admin/categories/route.ts`
GET: Return all categories with subcategories and counts
POST: Create new category (auto-generate slug from name)

### `app/api/admin/categories/[id]/route.ts`
PATCH: Update category (name, description, active)
DELETE: Delete category

### `app/api/admin/categories/[id]/subcategories/route.ts`
POST: Create subcategory for category

### `app/api/admin/categories/[id]/subcategories/[subId]/route.ts`
PATCH: Update subcategory
DELETE: Delete subcategory

### Update `app/api/admin/flyers/route.ts`
POST: Now requires subcategoryId when creating flyer

---

## Summary of Changes

1. ✅ Login simplified to email + password only
2. ✅ Login logs track every attempt (success/fail, IP, browser)
3. ✅ Top-level categories: Flyers, Letters, Postcards, Signs
4. ✅ Subcategories: FSBO, Divorced, Sellers, Buyers, etc.
5. ✅ Sample flyers seeded for each category/subcategory
6. ✅ Admin can manage categories and subcategories
7. ✅ Admin can view login logs

Run in order:
1. Update schema → `npx prisma db push`
2. Create seed file → `npx prisma db seed`
3. Update pages and create new ones
4. Create API routes
5. Test!
