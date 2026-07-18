# Phase 1 — Authentication, User Management & Email System

> **Tech Stack**: Express.js (JS) · Prisma ORM · PostgreSQL · JWT · Nodemailer
> **Frontend**: TanStack Start (React) · TailwindCSS v4 · Radix UI

---

## 1. Project Scaffolding

### 1.1 Backend Folder Structure

```
etato-fresh-bites/
├── server/                      # NEW — Express.js backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js              # Seed super-admin + initial categories + menu
│   ├── src/
│   │   ├── index.js             # Entry — Express app bootstrap
│   │   ├── config/
│   │   │   ├── env.js           # dotenv loader + validation
│   │   │   ├── db.js            # Prisma client singleton
│   │   │   └── mail.js          # Nodemailer transporter
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verify middleware
│   │   │   ├── adminAuth.js     # Super-admin role guard
│   │   │   ├── validate.js      # Zod request validation
│   │   │   ├── rateLimiter.js   # express-rate-limit config
│   │   │   └── errorHandler.js  # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── menu.routes.js   # Phase 2
│   │   │   ├── order.routes.js  # Phase 3
│   │   │   ├── admin.routes.js  # Phase 2
│   │   │   └── payment.routes.js # Phase 3
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── mail.service.js  # Email templates + send logic
│   │   │   ├── token.service.js # JWT sign/verify helpers
│   │   │   └── geo.service.js   # Delivery zone check (Haversine)
│   │   └── utils/
│   │       ├── constants.js     # ENUMs, cloud kitchen coords, etc.
│   │       └── helpers.js
│   ├── .env.example
│   ├── package.json
│   └── nodemon.json
└── src/                         # Existing frontend (changes listed below)
```

### 1.2 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "@prisma/client": "^6.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.10.0",
    "zod": "^3.24.2",
    "cookie-parser": "^1.4.7",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.4.7",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "prisma": "^6.5.0",
    "nodemon": "^3.1.9"
  }
}
```

### 1.3 Environment Variables (`.env.example`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/etato_db"
JWT_ACCESS_SECRET="your-access-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="etatofoods@gmail.com"
SMTP_PASS="app-password-here"
MAIL_FROM="Etato Foods <etatofoods@gmail.com>"
CLIENT_URL="http://localhost:5173"
PORT=4000
CLOUD_KITCHEN_LAT=18.4529
CLOUD_KITCHEN_LNG=73.8548
MAX_DELIVERY_RADIUS_KM=10
SUPER_ADMIN_EMAIL="etatofoods@gmail.com"
SUPER_ADMIN_PASSWORD="initial-secure-password"
```

---

## 2. Database Schema (Prisma)

### 2.1 Full Phase 1 Schema

> **IMPORTANT:** This schema includes tables needed across all 3 phases. Phase 1 uses `User`, `Address`, `RefreshToken`, `ContactSubmission`. Others are defined now for FK integrity but populated in Phases 2 & 3.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────

enum UserRole {
  CUSTOMER
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
  DEACTIVATED
}

enum MenuItemStatus {
  ACTIVE
  INACTIVE
  COMING_SOON
  NOT_AVAILABLE
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
}

enum SubscriptionPlanType {
  TRIAL
  WEEKLY
  MONTHLY
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
  COMPLETED
  EXPIRED
}

enum DeliverySlot {
  LUNCH
  DINNER
}

enum DietaryPref {
  REGULAR_VEG
  JAIN
}

enum ContactSubject {
  GENERAL_ENQUIRY
  SUBSCRIPTION
  BULK_ORDER
  FEEDBACK
  OTHER
}

enum BlogPostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ─── USER & AUTH ─────────────────────────────────────────

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  passwordHash  String
  name          String
  phone         String?      // Nullable — collected before first order
  phoneVerified Boolean      @default(false)
  emailVerified Boolean      @default(false)
  role          UserRole     @default(CUSTOMER)
  status        UserStatus   @default(ACTIVE)
  avatarUrl     String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  addresses     Address[]
  refreshTokens RefreshToken[]
  orders        Order[]
  subscriptions Subscription[]

  @@index([email])
  @@index([phone])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("refresh_tokens")
}

model Address {
  id          String  @id @default(cuid())
  userId      String
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  label       String  @default("Home")
  fullAddress String
  pinCode     String
  latitude    Float?
  longitude   Float?
  isDefault   Boolean @default(false)
  isInZone    Boolean @default(false) // Pre-computed delivery zone flag
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orders      Order[]

  @@index([userId])
  @@map("addresses")
}

// ─── MENU ────────────────────────────────────────────────

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items       MenuItem[]

  @@map("categories")
}

model MenuItem {
  id          String         @id @default(cuid())
  name        String
  slug        String         @unique
  dressing    String
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id])
  protein     String?
  calories    String?
  carbs       String?
  fat         String?
  fiber       String?
  ingredients String[]
  price       Int?           // Price in paisa (24900 = Rs.249) — null for TBD
  jain        Boolean        @default(false)
  imageUrl    String?
  status      MenuItemStatus @default(ACTIVE)
  isFeatured  Boolean        @default(false)
  sortOrder   Int            @default(0)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  orderItems  OrderItem[]

  @@index([categoryId])
  @@index([status])
  @@map("menu_items")
}

// ─── ORDERS ──────────────────────────────────────────────

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  addressId       String
  address         Address       @relation(fields: [addressId], references: [id])
  status          OrderStatus   @default(PENDING)
  deliverySlot    DeliverySlot
  dietaryPref     DietaryPref   @default(REGULAR_VEG)
  specialNotes    String?
  subtotal        Int
  deliveryCharge  Int           @default(0)
  discount        Int           @default(0)
  couponCode      String?
  total           Int
  scheduledDate   DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  items           OrderItem[]
  payment         Payment?

  @@index([userId])
  @@index([status])
  @@index([orderNumber])
  @@map("orders")
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId String
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  quantity   Int      @default(1)
  unitPrice  Int
  total      Int

  @@index([orderId])
  @@map("order_items")
}

// ─── PAYMENTS ────────────────────────────────────────────

model Payment {
  id                  String        @id @default(cuid())
  orderId             String        @unique
  order               Order         @relation(fields: [orderId], references: [id])
  razorpayOrderId     String?       @unique
  razorpayPaymentId   String?       @unique
  razorpaySignature   String?
  amount              Int
  currency            String        @default("INR")
  status              PaymentStatus @default(PENDING)
  method              String?
  failureReason       String?
  paidAt              DateTime?
  refundedAt          DateTime?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  @@index([razorpayOrderId])
  @@map("payments")
}

// ─── SUBSCRIPTIONS ───────────────────────────────────────

model SubscriptionPlan {
  id            String             @id @default(cuid())
  name          String
  type          SubscriptionPlanType
  durationDays  Int
  bowlsCount    Int
  originalPrice Int
  price         Int
  discountPct   Int
  perBowlPrice  Int
  isActive      Boolean            @default(true)
  sortOrder     Int                @default(0)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  subscriptions Subscription[]

  @@map("subscription_plans")
}

model Subscription {
  id             String             @id @default(cuid())
  userId         String
  user           User               @relation(fields: [userId], references: [id])
  planId         String
  plan           SubscriptionPlan   @relation(fields: [planId], references: [id])
  status         SubscriptionStatus @default(ACTIVE)
  deliverySlot   DeliverySlot
  dietaryPref    DietaryPref        @default(REGULAR_VEG)
  bowlPreference String?
  startDate      DateTime
  endDate        DateTime
  pausedDays     Int                @default(0)
  specialNotes   String?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  @@index([userId])
  @@index([status])
  @@map("subscriptions")
}

// ─── CONTACT / FORMS ─────────────────────────────────────

model ContactSubmission {
  id        String         @id @default(cuid())
  name      String
  phone     String
  email     String
  subject   ContactSubject
  message   String
  isRead    Boolean        @default(false)
  repliedAt DateTime?
  adminNote String?
  createdAt DateTime       @default(now())

  @@index([isRead])
  @@map("contact_submissions")
}

// ─── BLOG ────────────────────────────────────────────────

model BlogPost {
  id          String         @id @default(cuid())
  title       String
  slug        String         @unique
  excerpt     String
  body        String
  coverUrl    String?
  category    String
  readTime    String?
  status      BlogPostStatus @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([status])
  @@index([slug])
  @@map("blog_posts")
}

// ─── COUPONS ─────────────────────────────────────────────

model Coupon {
  id            String   @id @default(cuid())
  code          String   @unique
  discountPct   Int
  maxUses       Int?
  usedCount     Int      @default(0)
  minOrderValue Int?
  isActive      Boolean  @default(true)
  expiresAt     DateTime?
  createdAt     DateTime @default(now())

  @@map("coupons")
}

// ─── SITE SETTINGS ───────────────────────────────────────

model SiteSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt

  @@map("site_settings")
}
```

### 2.2 Schema Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Prices in paisa (Int)** | Avoids floating-point rounding issues. Rs.249 = `24900` |
| **Category as separate table** | Admin can add/rename categories dynamically vs hardcoded ENUM |
| **MenuItemStatus ENUM** | `ACTIVE`, `INACTIVE`, `COMING_SOON`, `NOT_AVAILABLE` — all states admin needs |
| **Separate RefreshToken table** | Allows multi-device sessions, easy token revocation |
| **Address.isInZone** | Pre-computed on save via Haversine — avoids re-calc on every order |
| **OrderItem.unitPrice snapshot** | Locks price at order time even if admin changes menu price later |
| **SiteSetting table** | Key-value store for dynamic config (operating hours, delivery radius, offer text) |

---

## 3. Authentication Flow

### 3.1 Signup Flow

```
Frontend POST /api/auth/signup { name, email, password }
  → Backend hashes password (bcryptjs, 12 rounds)
  → Creates User in DB (role: CUSTOMER)
  → Sends welcome email via Nodemailer
  → Generates JWT access + refresh tokens
  → Returns { user, accessToken } + sets refreshToken as httpOnly cookie
```

### 3.2 Login Flow

```
POST /api/auth/login { email, password }
  → Find user by email
  → Compare bcrypt hash
  → If valid → Generate JWT pair → Return tokens
  → If invalid → 401 "Invalid credentials"
```

### 3.3 Phone Number Collection (Pre-Order Gate)

```
User tries to place order or subscribe
  → Frontend checks: user.phone exists?
    → NO  → Show PhoneModal (collects + validates Indian phone number)
            → PATCH /api/user/phone { phone }
            → Backend saves phone, returns updated user
    → YES → Proceed to order flow
```

### 3.4 API Endpoints — Phase 1

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | Public | Create account (name, email, password) |
| `POST` | `/api/auth/login` | Public | Login (email, password) |
| `POST` | `/api/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/api/auth/logout` | Token | Invalidate refresh token |
| `GET` | `/api/auth/me` | Token | Get current user profile |
| `PATCH` | `/api/user/phone` | Token | Add/update phone number |
| `PATCH` | `/api/user/profile` | Token | Update name, avatar |
| `POST` | `/api/user/address` | Token | Add delivery address |
| `GET` | `/api/user/addresses` | Token | List user addresses |
| `DELETE` | `/api/user/address/:id` | Token | Remove address |
| `POST` | `/api/user/check-zone` | Public | Check if lat/lng is in delivery zone |
| `POST` | `/api/contact` | Public | Submit contact form (saves to DB + emails admin) |
| `GET` | `/api/menu` | Public | List active menu items (read-only) |
| `GET` | `/api/menu/:slug` | Public | Single menu item detail |
| `GET` | `/api/categories` | Public | List active categories |

### 3.5 JWT Token Strategy

- **Access Token**: 15 min expiry, sent in `Authorization: Bearer` header
- **Refresh Token**: 7 day expiry, httpOnly + Secure + SameSite=Strict cookie
- **Payload**: `{ sub: user.id, email, role, iat, exp }`
- **Refresh rotation**: on each refresh, old token is deleted, new one created

**Security measures:**
- Rate limiting: 5 attempts per 15 min on login/signup
- Passwords: bcryptjs with 12 salt rounds
- Helmet.js for security headers
- CORS restricted to `CLIENT_URL`
- Zod validation on all request bodies

---

## 4. Delivery Zone Validation (Geolocation)

### 4.1 Haversine Formula — `geo.service.js`

```js
const KITCHEN_LAT = 18.4529;
const KITCHEN_LNG = 73.8548;
const MAX_RADIUS_KM = 10;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function isInDeliveryZone(lat, lng) {
  const dist = haversineDistance(KITCHEN_LAT, KITCHEN_LNG, lat, lng);
  return { inZone: dist <= MAX_RADIUS_KM, distanceKm: Math.round(dist * 10) / 10 };
}
```

### 4.2 Frontend Flow

```
User adds address → browser geolocation (navigator.geolocation.getCurrentPosition)
  → Sends lat/lng + address text to POST /api/user/address
  → Backend runs Haversine → saves Address with isInZone flag
  → If NOT in zone → return warning: "We don't deliver to this area yet"
  → If in zone → address saved, user can proceed to order
```

---

## 5. Nodemailer Emails — Phase 1

| Trigger | Template | Subject Line |
|---------|----------|-------------|
| User signs up | `welcome` | "Welcome to Etato Foods, {name}!" |
| Contact form submitted | `contact-admin-notify` | "New contact: {subject} from {name}" |
| Contact form auto-reply | `contact-auto-reply` | "We got your message, {name}!" |

---

## 6. Frontend Changes (Phase 1)

### 6.1 New Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Fetch wrapper with JWT interceptor (auto-refresh on 401) |
| `src/lib/auth-context.tsx` | React context for auth state (user, login, logout, updatePhone) |
| `src/components/etato/PhoneModal.tsx` | Modal to collect phone before ordering |
| `src/components/etato/AuthGuard.tsx` | Wrapper that redirects to /login if unauthenticated |
| `src/components/etato/AddressForm.tsx` | Address input + geolocation capture |
| `src/routes/profile.tsx` | User profile page (name, phone, addresses) |

### 6.2 Modified Files

| File | Change |
|------|--------|
| `__root.tsx` | Wrap app in `<AuthProvider>`, load user on mount |
| `login.tsx` | Real API calls instead of localStorage demo |
| `Header.tsx` | Show user avatar/name when logged in; dropdown (Profile, Logout) |
| `contact.tsx` | Submit form to `POST /api/contact` |
| `subscribe.tsx` | Submit to API; check phone before allowing submission |
| `data/menu.ts` | Fetch from `GET /api/menu` instead of hardcoded array |

---

## 7. Task Breakdown — Phase 1

### Backend Tasks (est. ~10 hours)

| # | Task | Est. |
|---|------|------|
| B1 | Init `server/` folder, package.json, nodemon, dotenv setup | 30 min |
| B2 | Write Prisma schema (full — all tables) | 1 hr |
| B3 | Run `prisma migrate dev` + create seed.js (admin user, categories, menu) | 45 min |
| B4 | Express app bootstrap (cors, helmet, morgan, cookie-parser, error handler) | 30 min |
| B5 | Auth routes — signup, login, refresh, logout, me | 2 hr |
| B6 | Token service (sign, verify, refresh rotation) | 45 min |
| B7 | Mail service + welcome email template | 1 hr |
| B8 | User routes — update phone, profile, CRUD addresses | 1 hr |
| B9 | Geo service — Haversine delivery zone check | 30 min |
| B10 | Contact form route (save DB + email admin) | 45 min |
| B11 | Public menu/category read endpoints | 30 min |
| B12 | Rate limiting + Zod validation on all routes | 1 hr |

### Frontend Tasks (est. ~7 hours)

| # | Task | Est. |
|---|------|------|
| F1 | Create `src/lib/api.ts` — fetch wrapper with JWT interceptor | 45 min |
| F2 | Create AuthProvider context + hook | 1 hr |
| F3 | Rework `login.tsx` — real signup/login API calls | 1 hr |
| F4 | Update `Header.tsx` — logged-in state, user dropdown | 45 min |
| F5 | Create `PhoneModal.tsx` — collect phone number | 30 min |
| F6 | Create `profile.tsx` route — user info, addresses | 1.5 hr |
| F7 | Create `AddressForm.tsx` with geolocation | 1 hr |
| F8 | Wire `contact.tsx` form to API | 30 min |

---

## 8. Security Checklist — Phase 1

- [ ] Passwords hashed with bcryptjs (12 rounds)
- [ ] JWT access tokens — 15 min expiry
- [ ] Refresh tokens — httpOnly, Secure, SameSite cookies
- [ ] Rate limiting on auth endpoints (5 req / 15 min)
- [ ] Helmet.js security headers
- [ ] CORS whitelist — only frontend origin
- [ ] Zod validation on all request bodies
- [ ] SQL injection protection via Prisma (parameterized queries)
- [ ] No sensitive data in JWT payload
- [ ] Global error handler — no stack traces in production
