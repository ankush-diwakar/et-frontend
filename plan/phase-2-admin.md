# Phase 2 — Super Admin Dashboard, Menu Management & Blog CMS

> **Builds on**: Phase 1 (Auth + DB already running)
> **Key Outcome**: Admin can manage the entire platform from `/admin` — menu, categories, orders, blog, coupons, contact forms, site settings. Frontend menu/blog become fully dynamic.

---

## 1. Super Admin Dashboard — Overview

### 1.1 Admin Route: `/admin`

Protected by `adminAuth` middleware (backend) and `AdminGuard` component (frontend). Only users with `role: SUPER_ADMIN` can access.

### 1.2 Dashboard Sidebar Navigation

```
/admin                    → Dashboard (stats overview)
/admin/menu               → Menu Items (CRUD, status toggle, reorder)
/admin/categories         → Categories (CRUD, reorder)
/admin/orders             → Orders list + status management (Phase 3 populated)
/admin/subscriptions      → Subscription requests (Phase 3 populated)
/admin/customers          → Customer list, profiles, order history
/admin/blog               → Blog posts CRUD
/admin/coupons            → Coupon codes CRUD
/admin/contacts           → Contact form submissions (read, reply, mark)
/admin/payments           → Razorpay payment records (Phase 3 populated)
/admin/settings           → Site settings (delivery radius, operating hours, etc.)
```

### 1.3 Dashboard Home — KPI Cards

| Metric | Source |
|--------|--------|
| Total Customers | `User.count({ role: CUSTOMER })` |
| Active Menu Items | `MenuItem.count({ status: ACTIVE })` |
| Today's Orders | `Order.count({ createdAt: today })` (Phase 3) |
| Revenue This Month | `Payment.sum(amount, status: CAPTURED)` (Phase 3) |
| Pending Contacts | `ContactSubmission.count({ isRead: false })` |
| Active Subscriptions | `Subscription.count({ status: ACTIVE })` (Phase 3) |

---

## 2. Menu Management

### 2.1 Admin Menu Item CRUD

#### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/menu` | Admin | List ALL items (incl. inactive/coming-soon) |
| `GET` | `/api/admin/menu/:id` | Admin | Single item with full details |
| `POST` | `/api/admin/menu` | Admin | Create new menu item |
| `PUT` | `/api/admin/menu/:id` | Admin | Update menu item |
| `PATCH` | `/api/admin/menu/:id/status` | Admin | Change status only (quick toggle) |
| `PATCH` | `/api/admin/menu/:id/featured` | Admin | Toggle featured flag |
| `DELETE` | `/api/admin/menu/:id` | Admin | Soft delete (set status: INACTIVE) |
| `POST` | `/api/admin/menu/:id/image` | Admin | Upload item image (multer) |
| `PATCH` | `/api/admin/menu/reorder` | Admin | Bulk update sortOrder |

#### Create/Edit Menu Item — Form Fields

```js
{
  name: "ETATO Paneer Protein Punch Bowl",   // Required, String
  dressing: "Golden Garlic Cream",            // Required, String
  categoryId: "cuid-of-paneer-bowls",        // Required, FK to Category
  protein: "25–30g",                          // Optional, String
  calories: "400–450",                        // Optional, String
  carbs: "35–40g",                            // Optional, String
  fat: "14–18g",                              // Optional, String
  fiber: "8–10g",                             // Optional, String
  ingredients: ["paneer", "broccoli", ...],   // Array of strings
  price: 24900,                               // Int (paisa) or null for TBD
  jain: true,                                 // Boolean
  status: "ACTIVE",                           // ENUM: ACTIVE | INACTIVE | COMING_SOON | NOT_AVAILABLE
  isFeatured: false,                          // Boolean
  sortOrder: 1,                               // Int for ordering
  image: File                                 // Multipart upload
}
```

#### Menu Item Status Workflow

```
COMING_SOON  ──(admin activates)──►  ACTIVE
     ▲                                  │
     │                          (admin disables)
     │                                  ▼
     └───────────────────────────  INACTIVE
                                        │
                                (temporarily out)
                                        ▼
                                  NOT_AVAILABLE
```

**Frontend display rules:**
- `ACTIVE` → normal card, orderable
- `COMING_SOON` → greyed out with "Coming Soon" badge, NOT orderable
- `INACTIVE` → hidden from public menu, visible only in admin
- `NOT_AVAILABLE` → shown with "Unavailable Today" badge, NOT orderable

### 2.2 Image Upload

```
POST /api/admin/menu/:id/image
  Content-Type: multipart/form-data
  Body: { image: File }

  → Multer receives file
  → Validate: JPEG/PNG/WebP, max 2MB
  → Save to /server/uploads/menu/ (or cloud storage later)
  → Update MenuItem.imageUrl in DB
  → Return { imageUrl: "/uploads/menu/filename.webp" }
```

**Static serving:** Express serves `/uploads` as static directory.

---

## 3. Category Management

### 3.1 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/categories` | Admin | List all categories (incl. inactive) |
| `POST` | `/api/admin/categories` | Admin | Create new category |
| `PUT` | `/api/admin/categories/:id` | Admin | Update category name/slug |
| `PATCH` | `/api/admin/categories/:id/toggle` | Admin | Toggle isActive |
| `PATCH` | `/api/admin/categories/reorder` | Admin | Bulk update sortOrder |
| `DELETE` | `/api/admin/categories/:id` | Admin | Only if no items linked |

### 3.2 Category Fields

```js
{
  name: "Paneer Bowls",     // Required, unique
  slug: "paneer-bowls",     // Auto-generated from name (slugify)
  sortOrder: 1,             // For display order
  isActive: true            // Toggle visibility
}
```

### 3.3 Seed Data

```js
const INITIAL_CATEGORIES = [
  { name: "Paneer Bowls",  slug: "paneer-bowls",  sortOrder: 1 },
  { name: "Sprout Bowls",  slug: "sprout-bowls",  sortOrder: 2 },
  { name: "Beverages",     slug: "beverages",     sortOrder: 3 },
];
```

Admin can add more categories in the future (e.g., "Pasta Bowls", "Smoothies", "Add-ons").

---

## 4. Blog CMS

### 4.1 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/blog` | Public | List published posts (paginated) |
| `GET` | `/api/blog/:slug` | Public | Single published post by slug |
| `GET` | `/api/admin/blog` | Admin | List ALL posts (drafts, archived too) |
| `POST` | `/api/admin/blog` | Admin | Create new post |
| `PUT` | `/api/admin/blog/:id` | Admin | Update post |
| `PATCH` | `/api/admin/blog/:id/status` | Admin | Change status (draft/publish/archive) |
| `DELETE` | `/api/admin/blog/:id` | Admin | Delete post |
| `POST` | `/api/admin/blog/:id/cover` | Admin | Upload cover image |

### 4.2 Blog Post Fields

```js
{
  title: "Why 22–30g of protein per meal matters",
  slug: "why-22-30g-protein-matters",     // Auto from title
  excerpt: "Most Indian meals under-deliver on protein...",
  body: "Full markdown content...",        // Markdown supported
  category: "Nutrition",                   // Free text or from predefined list
  readTime: "5 min read",                 // Auto-calc from body word count
  status: "DRAFT",                        // DRAFT | PUBLISHED | ARCHIVED
  coverUrl: "/uploads/blog/cover.jpg",
  publishedAt: null                       // Set when status → PUBLISHED
}
```

### 4.3 Frontend Changes for Blog

Currently `src/data/posts.ts` has hardcoded blog posts. Changes:
- Blog index (`blog.index.tsx`) → fetch from `GET /api/blog`
- Blog detail (`blog.$slug.tsx`) → fetch from `GET /api/blog/:slug`
- Keep hardcoded posts as fallback/seed data
- Admin creates new posts from `/admin/blog`

---

## 5. Customer Management

### 5.1 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/customers` | Admin | Paginated customer list with search/filter |
| `GET` | `/api/admin/customers/:id` | Admin | Single customer detail + orders + subscriptions |
| `PATCH` | `/api/admin/customers/:id/status` | Admin | Block/unblock user |

### 5.2 Customer List — Columns

| Column | Source |
|--------|--------|
| Name | `user.name` |
| Email | `user.email` |
| Phone | `user.phone` or "Not provided" |
| Status | `user.status` badge (ACTIVE/BLOCKED) |
| Orders | `user.orders.length` count |
| Joined | `user.createdAt` formatted |
| Actions | View Detail, Block/Unblock |

---

## 6. Contact Form Management

### 6.1 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/contacts` | Admin | Paginated list (filter: read/unread) |
| `GET` | `/api/admin/contacts/:id` | Admin | Single submission detail |
| `PATCH` | `/api/admin/contacts/:id/read` | Admin | Mark as read |
| `PATCH` | `/api/admin/contacts/:id/reply` | Admin | Add admin note + send reply email |
| `DELETE` | `/api/admin/contacts/:id` | Admin | Delete submission |

### 6.2 Email Trigger on Reply

When admin replies to a contact submission from the dashboard:
- Save `adminNote` and `repliedAt` to DB
- Trigger Nodemailer → send reply email to submitter's email
- Subject: `"Re: {original subject} — Etato Foods"`

---

## 7. Coupon Management

### 7.1 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/coupons` | Admin | List all coupons |
| `POST` | `/api/admin/coupons` | Admin | Create coupon |
| `PUT` | `/api/admin/coupons/:id` | Admin | Update coupon |
| `PATCH` | `/api/admin/coupons/:id/toggle` | Admin | Activate/deactivate |
| `DELETE` | `/api/admin/coupons/:id` | Admin | Delete coupon |
| `POST` | `/api/coupons/validate` | Token | Validate coupon code (customer-facing) |

### 7.2 Seed Coupon

```js
{
  code: "ETATO10",
  discountPct: 10,
  maxUses: 50,
  usedCount: 0,
  minOrderValue: null,
  isActive: true,
  expiresAt: null
}
```

---

## 8. Site Settings

### 8.1 Admin-Configurable Settings

| Key | Default Value | Type |
|-----|--------------|------|
| `operating_hours` | `{"lunch":"12:00-14:30","dinner":"19:00-21:30"}` | JSON |
| `operating_days` | `["Mon","Tue","Wed","Thu","Fri","Sat"]` | JSON |
| `delivery_radius_km` | `10` | Number |
| `min_order_value` | `0` | Number (paisa) |
| `delivery_charge` | `0` | Number (paisa) |
| `free_delivery_above` | `29900` | Number (paisa, Rs.299) |
| `announcement_text` | `"10% OFF for first 50 customers — ETATO10"` | String |
| `announcement_active` | `true` | Boolean |
| `accepting_orders` | `true` | Boolean |
| `kitchen_closed_message` | `"We're closed today. Back tomorrow!"` | String |

### 8.2 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings` | Public | Get all public settings |
| `GET` | `/api/admin/settings` | Admin | Get all settings |
| `PUT` | `/api/admin/settings` | Admin | Bulk update settings |

---

## 9. Frontend — Admin Dashboard UI

### 9.1 New Route Structure

```
src/routes/
├── admin.tsx              # Admin layout (sidebar + outlet) — AdminGuard
├── admin/
│   ├── index.tsx          # Dashboard home — KPI cards
│   ├── menu.tsx           # Menu items table + CRUD modals
│   ├── categories.tsx     # Categories table
│   ├── orders.tsx         # Orders table (Phase 3 data)
│   ├── customers.tsx      # Customer list
│   ├── blog.tsx           # Blog posts table
│   ├── blog.new.tsx       # Create/edit blog post
│   ├── coupons.tsx        # Coupons table
│   ├── contacts.tsx       # Contact submissions
│   ├── payments.tsx       # Payment records (Phase 3)
│   ├── subscriptions.tsx  # Subscription list (Phase 3)
│   └── settings.tsx       # Site settings form
```

### 9.2 Admin Layout Component

```
┌─────────────────────────────────────────────────┐
│  ETATO ADMIN              [user] [logout]       │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Content Area                        │
│          │                                      │
│ Dashboard│  (Route-specific content)            │
│ Menu     │                                      │
│ Categories│                                     │
│ Orders   │                                      │
│ Customers│                                      │
│ Blog     │                                      │
│ Coupons  │                                      │
│ Contacts │                                      │
│ Payments │                                      │
│ Settings │                                      │
│          │                                      │
│ ← Site  │                                      │
└──────────┴──────────────────────────────────────┘
```

### 9.3 Making Menu Dynamic on Public Frontend

**Current state:** `src/data/menu.ts` exports hardcoded `BOWLS` array.

**New approach:**
1. Create `src/hooks/useMenu.ts` — uses TanStack Query to fetch `GET /api/menu`
2. Menu page (`menu.tsx`) → uses `useMenu()` hook instead of importing `BOWLS`
3. Home page (`index.tsx`) → featured bowls from API (`?featured=true`)
4. Category tabs become dynamic (from `GET /api/categories`)
5. `BowlCard.tsx` gets updated to handle new status field:
   - `ACTIVE` → normal card
   - `COMING_SOON` → "Coming Soon" badge, greyed out
   - `NOT_AVAILABLE` → "Unavailable" badge, greyed out
6. Keep `src/data/menu.ts` as SSR fallback / initial data

### 9.4 Key Admin Components

| Component | Purpose |
|-----------|---------|
| `AdminLayout.tsx` | Sidebar + header + outlet |
| `AdminGuard.tsx` | Checks role === SUPER_ADMIN, redirects to / if not |
| `DataTable.tsx` | Reusable sortable/filterable table |
| `MenuItemForm.tsx` | Create/edit menu item form with image upload |
| `CategoryForm.tsx` | Create/edit category |
| `BlogEditor.tsx` | Rich text / markdown editor for blog posts |
| `StatusBadge.tsx` | Colored badge for ACTIVE/INACTIVE/COMING_SOON etc. |
| `StatsCard.tsx` | Dashboard KPI card component |
| `ImageUpload.tsx` | Drag-and-drop image upload with preview |

---

## 10. Modified Frontend Files (Phase 2)

| File | Change |
|------|--------|
| `menu.tsx` | Fetch from API, dynamic categories, status-aware cards |
| `BowlCard.tsx` | Handle `NOT_AVAILABLE` status, "Add to Cart" button prep |
| `blog.index.tsx` | Fetch from `GET /api/blog` |
| `blog.$slug.tsx` | Fetch from `GET /api/blog/:slug` |
| `Header.tsx` | Show "Admin" link if user.role === SUPER_ADMIN |
| `__root.tsx` | No admin layout wrapping here — admin has own layout |
| `data/menu.ts` | Keep as SSR fallback, add `useMenu` hook alongside |
| `data/posts.ts` | Keep as SSR fallback, add `useBlog` hook alongside |

---

## 11. Task Breakdown — Phase 2

### Backend Tasks (est. ~12 hours)

| # | Task | Est. |
|---|------|------|
| B13 | Admin auth middleware (role check) | 30 min |
| B14 | Menu CRUD endpoints (create, read, update, delete, status toggle) | 2 hr |
| B15 | Image upload with multer (menu items + blog covers) | 1 hr |
| B16 | Category CRUD endpoints | 1 hr |
| B17 | Blog CRUD endpoints + publish/draft flow | 1.5 hr |
| B18 | Customer list/detail endpoints | 45 min |
| B19 | Contact submissions management endpoints | 45 min |
| B20 | Contact reply → Nodemailer trigger | 30 min |
| B21 | Coupon CRUD + validation endpoint | 1 hr |
| B22 | Site settings CRUD endpoints | 30 min |
| B23 | Seed script update — initial menu, categories, blog, ETATO10 coupon | 1 hr |
| B24 | Public menu/blog API (paginated, filtered, sorted) | 1 hr |

### Frontend Tasks (est. ~16 hours)

| # | Task | Est. |
|---|------|------|
| F11 | Admin layout with sidebar navigation | 1.5 hr |
| F12 | AdminGuard component | 30 min |
| F13 | Dashboard home — KPI stat cards | 1 hr |
| F14 | Menu items page — data table + CRUD modals | 3 hr |
| F15 | Category management page | 1 hr |
| F16 | Blog posts page — table + editor | 2.5 hr |
| F17 | Customer list page | 1 hr |
| F18 | Contact submissions page (read/reply) | 1 hr |
| F19 | Coupon management page | 1 hr |
| F20 | Site settings page | 1 hr |
| F21 | Make public menu page dynamic (useMenu hook + TanStack Query) | 1.5 hr |
| F22 | Make public blog dynamic (useBlog hook) | 1 hr |

---

## 12. Nodemailer Emails — Phase 2

| Trigger | Template | Subject |
|---------|----------|---------|
| Admin replies to contact | `contact-reply` | "Re: {subject} — Etato Foods" |
| Menu item status changed | *(internal log only)* | N/A |
| New blog post published | *(optional newsletter)* | "New from Etato: {title}" |
