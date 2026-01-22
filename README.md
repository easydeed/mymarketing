# PromoVault

A premium promotional flyer gallery application built with Next.js 14, featuring secure email-based authentication, category management, and comprehensive admin tools.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## 🌟 Features

### Public Features
- **Secure Gallery Access** - Email + shared password authentication
- **Category Browsing** - Organized by Flyers, Letters, Postcards, Signs
- **Subcategory Filters** - FSBO, Divorced, Sellers, Buyers, Expired Listings, etc.
- **Flyer Preview** - Modal view with full details and request capability
- **Responsive Design** - Beautiful dark theme with gold accents

### Admin Features
- **Dashboard** - Overview stats with recent activity
- **Flyer Management** - Upload, edit, and organize promotional materials
- **Category Management** - Create/edit categories and subcategories
- **Request Management** - Track and manage flyer requests
- **Login Logs** - Monitor all authentication attempts with IP/browser info
- **Settings** - Configure gallery password and system settings

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Render)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Iron Session
- **File Storage**: Vercel Blob
- **Deployment**: Vercel

## 📁 Project Structure

```
mymarketing/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── categories/     # Category CRUD operations
│   │   │   ├── flyers/         # Flyer management
│   │   │   ├── logs/           # Login log retrieval
│   │   │   ├── requests/       # Request management
│   │   │   ├── settings/       # System settings
│   │   │   ├── stats/          # Dashboard statistics
│   │   │   └── users/          # User management
│   │   ├── auth/
│   │   │   ├── login/          # Authentication endpoint
│   │   │   ├── logout/         # Session termination
│   │   │   └── me/             # Current user info
│   │   ├── categories/         # Public category listing
│   │   ├── flyers/             # Public flyer listing
│   │   └── upload/             # File upload handler
│   ├── admin/
│   │   ├── categories/         # Category management page
│   │   ├── flyers/             # Flyer management page
│   │   ├── logs/               # Login logs page
│   │   ├── requests/           # Requests page
│   │   ├── settings/           # Settings page
│   │   └── layout.tsx          # Admin layout with sidebar
│   ├── gallery/                # Main gallery page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Login page
├── lib/
│   ├── prisma.ts               # Prisma client instance
│   └── session.ts              # Iron session configuration
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding script
└── public/                     # Static assets
```

## 🗄️ Database Schema

### Models

| Model | Description |
|-------|-------------|
| `User` | Registered gallery users (email only) |
| `AdminUser` | Admin users with hashed passwords |
| `LoginLog` | Authentication attempt tracking |
| `Category` | Top-level categories (Flyers, Letters, etc.) |
| `Subcategory` | Nested categories (FSBO, Divorced, etc.) |
| `Flyer` | Promotional materials with auto-generated codes |
| `FlyerView` | View tracking for analytics |
| `Request` | User requests for flyers |
| `Settings` | System configuration |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/easydeed/mymarketing.git
   cd mymarketing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   SESSION_SECRET="your-32-character-secret-key-here"
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Credentials

- **Gallery Password**: `welcome2024`
- **Admin Login**: Navigate to `/admin/login`
  - Email: `mymarketing123@yahoo.com`
  - Password: `Jorge123`

## 📝 API Reference

### Gallery Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate with email + gallery password |
| `/api/auth/logout` | POST | End gallery user session |
| `/api/auth/me` | GET | Get current gallery user info |

### Admin Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/auth/login` | POST | Authenticate admin with email + password |
| `/api/admin/auth/logout` | POST | End admin session |
| `/api/admin/auth/me` | GET | Get current admin info |

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET | List all active categories |
| `/api/flyers` | GET | List flyers (supports filtering) |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/flyers` | GET/POST | List/create flyers |
| `/api/admin/flyers/[id]` | PATCH/DELETE | Update/delete flyer |
| `/api/admin/categories` | GET/POST | List/create categories |
| `/api/admin/categories/[id]` | PATCH/DELETE | Update/delete category |
| `/api/admin/categories/[id]/subcategories` | POST | Create subcategory |
| `/api/admin/logs` | GET | Get login logs |
| `/api/admin/requests` | GET | List all requests |
| `/api/admin/requests/[id]` | PATCH | Update request status |
| `/api/admin/settings` | GET/PATCH | Get/update settings |
| `/api/admin/users` | GET | List all users |

## 🎨 Design System

### Colors

| Name | Value | Usage |
|------|-------|-------|
| `vault-black` | `#0a0a0a` | Primary background |
| `vault-dark` | `#111111` | Secondary background |
| `vault-gray` | `#1a1a1a` | Card backgrounds |
| `vault-border` | `#262626` | Borders |
| `gold-400` | `#facc15` | Primary accent |
| `gold-500` | `#eab308` | Hover states |
| `gold-600` | `#ca8a04` | Active states |

### Typography

- **Display Font**: Playfair Display (headings)
- **Body Font**: DM Sans (body text)

## 🔒 Security Features

- **Dual Authentication System**:
  - **Gallery Users**: Email + shared password for gallery access
  - **Admin Users**: Separate login with individual credentials (hashed passwords)
- **Session Management**: Separate HTTP-only cookies via Iron Session
  - `promovault_session` - Gallery user sessions
  - `promovault_admin_session` - Admin sessions
- **Protected Admin Routes**: All `/admin/*` pages require admin authentication
- **Login Logging**: Track all gallery authentication attempts with:
  - Email address
  - Success/failure status
  - IP address
  - User agent/browser info
  - Timestamp

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-production-secret
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

## 🔄 Database Seeding

The seed script populates the database with:

- **1 Admin User**: `mymarketing123@yahoo.com` (password: `Jorge123`)
- **4 Categories**: Flyers, Letters, Postcards, Signs
- **7 Subcategories per category**: FSBO, Divorced, Sellers, Buyers, Expired, Just Listed, Just Sold
- **29 Sample Flyers**: With placeholder images
- **Default Settings**: Gallery password set to `welcome2024`

Run seeding:
```bash
npx prisma db seed
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For questions or support, contact the development team.

---

Built with ❤️ using Next.js and Prisma

