# Phase 3 — Orders, Razorpay Payments, Subscriptions & Go-Live

> **Builds on**: Phase 1 (Auth) + Phase 2 (Admin + Dynamic Menu)
> **Key Outcome**: Customers can order directly on the website with Razorpay, subscribe to meal plans, track orders. Admin sees all payments, manages order lifecycle, and controls subscriptions.

---

## 1. Direct Ordering Flow

### 1.1 Customer Order Journey

```
1. Browse Menu (/menu)
   → See ACTIVE items with "Add to Cart" button
   → NOT_AVAILABLE / COMING_SOON → greyed out, no cart button

2. Cart (slide-out panel or /cart page)
   → Shows selected items, quantities, subtotal
   → Apply coupon code → POST /api/coupons/validate
   → Select delivery slot (Lunch / Dinner)
   → Select dietary preference (Regular / Jain)
   → Add special instructions

3. Pre-Order Checks
   → Is user logged in?       → NO → redirect to /login
   → Does user have phone?    → NO → show PhoneModal
   → Does user have address?  → NO → show AddressForm
   → Is address in zone?      → NO → "Sorry, we don't deliver here"
   → Is kitchen accepting?    → NO → "Kitchen is closed" message

4. Checkout
   → Review order summary
   → Click "Pay ₹{total}" button
   → POST /api/orders → creates Order + OrderItems in DB
   → POST /api/payments/create-razorpay-order → creates Razorpay order
   → Opens Razorpay checkout modal (inline)

5. Payment
   → User completes payment in Razorpay modal
   → Razorpay returns: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
   → POST /api/payments/verify → backend verifies signature
   → If valid → Payment.status = CAPTURED, Order.status = CONFIRMED
   → If failed → Payment.status = FAILED, Order.status = CANCELLED

6. Post-Order
   → Success page: "Order confirmed! #{orderNumber}"
   → Email to customer: order confirmation
   → Email to admin: new order notification
   → WhatsApp deep link: "Track on WhatsApp"
```

### 1.2 Order API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | Token | Create order (validates stock, zone, phone) |
| `GET` | `/api/orders` | Token | List user's orders (paginated) |
| `GET` | `/api/orders/:id` | Token | Single order detail with items + payment |
| `PATCH` | `/api/orders/:id/cancel` | Token | Cancel order (only if PENDING/CONFIRMED) |
| `GET` | `/api/admin/orders` | Admin | All orders (filter by status, date, user) |
| `GET` | `/api/admin/orders/:id` | Admin | Order detail for admin |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update order status |
| `GET` | `/api/admin/orders/stats` | Admin | Order analytics (today, week, month) |

### 1.3 Order Number Format

```
ET-YYYYMMDD-XXX
Example: ET-20260425-001, ET-20260425-002, ...
```

Auto-incremented per day. Reset to 001 each day.

### 1.4 Order Status Transitions (Admin-controlled)

```
PENDING ──(admin confirms)──► CONFIRMED
                                  │
                          (admin starts prep)
                                  ▼
                              PREPARING
                                  │
                          (admin dispatches)
                                  ▼
                          OUT_FOR_DELIVERY
                                  │
                          (admin marks done)
                                  ▼
                              DELIVERED

Any status ──(admin/user cancels)──► CANCELLED
CANCELLED ──(admin refunds)──► REFUNDED
```

---

## 2. Razorpay Payment Integration

### 2.1 Setup Requirements

```env
# Add to .env
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
```

```json
// Add to server/package.json
{ "razorpay": "^2.9.4" }
```

### 2.2 Payment API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/create-razorpay-order` | Token | Create Razorpay order (amount, currency) |
| `POST` | `/api/payments/verify` | Token | Verify payment signature |
| `POST` | `/api/payments/webhook` | Webhook | Razorpay webhook handler |
| `GET` | `/api/admin/payments` | Admin | List all payments (paginated, filterable) |
| `GET` | `/api/admin/payments/:id` | Admin | Single payment detail |
| `GET` | `/api/admin/payments/stats` | Admin | Revenue analytics |
| `POST` | `/api/admin/payments/:id/refund` | Admin | Initiate refund via Razorpay |

### 2.3 Payment Flow — Backend Logic

```js
// 1. Create Razorpay Order
const razorpayOrder = await razorpay.orders.create({
  amount: order.total,       // Already in paisa
  currency: "INR",
  receipt: order.orderNumber,
  notes: {
    orderId: order.id,
    customerEmail: user.email,
    customerPhone: user.phone,
  }
});

// 2. Save to DB
await prisma.payment.create({
  data: {
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: order.total,
    status: "PENDING"
  }
});

// 3. Return to frontend
return { razorpayOrderId: razorpayOrder.id, amount: order.total };
```

```js
// 4. Verify Payment (after Razorpay checkout completes)
const expectedSignature = crypto
  .createHmac("sha256", RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest("hex");

if (expectedSignature === razorpay_signature) {
  // Payment verified
  await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "CAPTURED",
      paidAt: new Date(),
      method: paymentDetails.method  // fetch from Razorpay API
    }
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "CONFIRMED" }
  });
}
```

### 2.4 Razorpay Webhook Handler

```
POST /api/payments/webhook
  → Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
  → Handle events:
    - payment.captured  → Update Payment + Order status
    - payment.failed    → Mark Payment FAILED + Order CANCELLED
    - refund.processed  → Mark Payment REFUNDED + Order REFUNDED
  → Return 200 OK
```

### 2.5 Frontend — Razorpay Checkout Integration

```js
// Install: npm install razorpay (backend only)
// Frontend uses Razorpay's inline checkout script

// Load Razorpay script dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

// Open checkout
const options = {
  key: RAZORPAY_KEY_ID,  // From env / API
  amount: order.total,
  currency: "INR",
  name: "Etato Foods",
  description: `Order #${order.orderNumber}`,
  order_id: razorpayOrderId,
  prefill: {
    name: user.name,
    email: user.email,
    contact: user.phone
  },
  theme: { color: "#1B4332" },  // Etato brand green
  handler: async (response) => {
    // Verify with backend
    await api.post("/api/payments/verify", response);
    navigate("/order-success");
  },
};

const rzp = new window.Razorpay(options);
rzp.open();
```

---

## 3. Subscription System

### 3.1 Subscription Flow

```
1. User visits /subscribe
   → Sees plans (Trial, Weekly, Monthly) — fetched from DB (SubscriptionPlan)
   → Fills form: plan, bowl preference, dietary pref, slot, address, start date

2. Submit Subscription
   → POST /api/subscriptions
   → Pre-checks: phone, address in zone
   → Creates Subscription record (status: ACTIVE)
   → Creates Razorpay order for total plan price
   → Opens Razorpay checkout

3. Payment
   → Same Razorpay flow as regular orders
   → On success: Subscription confirmed, start date locked

4. Admin Management
   → Admin sees all subscriptions in /admin/subscriptions
   → Can pause, resume, cancel subscriptions
   → Can view delivery schedule
```

### 3.2 Subscription API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/subscription-plans` | Public | List active plans |
| `POST` | `/api/subscriptions` | Token | Create subscription + payment |
| `GET` | `/api/subscriptions` | Token | User's subscriptions |
| `GET` | `/api/subscriptions/:id` | Token | Single subscription detail |
| `PATCH` | `/api/subscriptions/:id/pause` | Token | Pause subscription |
| `GET` | `/api/admin/subscriptions` | Admin | All subscriptions (filterable) |
| `PATCH` | `/api/admin/subscriptions/:id/status` | Admin | Change status |
| `GET` | `/api/admin/subscription-plans` | Admin | All plans (incl. inactive) |
| `POST` | `/api/admin/subscription-plans` | Admin | Create plan |
| `PUT` | `/api/admin/subscription-plans/:id` | Admin | Update plan |

---

## 4. Admin Dashboard — Payment & Order Views

### 4.1 Payments Page (`/admin/payments`)

**Table columns:**
| Column | Source |
|--------|--------|
| Payment ID | `payment.razorpayPaymentId` |
| Order # | `payment.order.orderNumber` |
| Customer | `payment.order.user.name` |
| Amount | `payment.amount / 100` formatted as ₹ |
| Method | `payment.method` (UPI / Card / Netbanking) |
| Status | Badge: CAPTURED (green) / FAILED (red) / REFUNDED (yellow) |
| Date | `payment.paidAt` formatted |
| Actions | View Detail, Refund |

**Revenue Stats Cards:**
- Today's Revenue
- This Week
- This Month
- Total Revenue (All Time)
- Refunded Amount

### 4.2 Orders Page (`/admin/orders`)

**Table columns:**
| Column | Source |
|--------|--------|
| Order # | `order.orderNumber` |
| Customer | `order.user.name` + phone |
| Items | Item names + quantities |
| Total | `order.total / 100` |
| Slot | Lunch / Dinner badge |
| Status | Color-coded badge with dropdown to change |
| Date | `order.createdAt` |
| Actions | View, Update Status, Cancel |

**Filters:** Status, Date Range, Delivery Slot, Customer search

### 4.3 Order Detail View

```
Order #ET-20260425-001
Status: [CONFIRMED] → dropdown to change
Customer: Aakanksha Kokane | +91 74999 34425
Address: Sr No. 135, Katraj, Pune 411046
Slot: Lunch (12–2:30 PM) | Diet: Regular Veg

Items:
┌─────────────────────────────────┬─────┬──────┬───────┐
│ Item                            │ Qty │ Unit │ Total │
├─────────────────────────────────┼─────┼──────┼───────┤
│ ETATO Paneer Protein Punch Bowl │  1  │ ₹249 │ ₹249  │
│ Soya Supreme Bowl               │  1  │ ₹249 │ ₹249  │
└─────────────────────────────────┴─────┴──────┴───────┘
Subtotal: ₹498
Discount (ETATO10): -₹50
Delivery: ₹0
Total: ₹448

Payment: ✅ Captured via UPI | pay_xxxxx | 25 Apr 2026 12:30
```

---

## 5. User's Order Journey (Customer-Facing)

### 5.1 Profile Page (`/profile`) — Enhanced

**Sections:**
1. **Personal Info** — Name, Email, Phone (edit)
2. **Addresses** — List, Add, Delete, Set Default
3. **My Orders** — Past + Upcoming orders
4. **My Subscriptions** — Active/Paused/Completed plans
5. **Saved Coupons** — Applied coupon history

### 5.2 Order Status Tracking

```
User visits /profile → My Orders tab
  → List of orders with status badge
  → Click order → expanded detail view:

    ● Order Placed         12:00 PM ✓
    ● Confirmed            12:05 PM ✓
    ● Preparing            12:15 PM ✓
    ○ Out for Delivery     ---
    ○ Delivered            ---

    Items: Paneer Punch Bowl x1, Soya Supreme x1
    Total Paid: ₹448
    Delivery Slot: Lunch (12–2:30 PM)
```

---

## 6. Frontend — New Routes & Components (Phase 3)

### 6.1 New Routes

| Route | Purpose |
|-------|---------|
| `/cart` | Cart page (or slide-out panel) |
| `/checkout` | Checkout + payment page |
| `/order-success` | Order confirmation page |
| `/profile` | Enhanced with orders + subscriptions tabs |
| `/admin/orders` | Admin order management |
| `/admin/payments` | Admin payment records |
| `/admin/subscriptions` | Admin subscription management |

### 6.2 New Components

| Component | Purpose |
|-----------|---------|
| `CartProvider.tsx` | React context for cart state (add, remove, qty, total) |
| `CartPanel.tsx` | Slide-out cart panel |
| `CartItem.tsx` | Single item in cart |
| `CheckoutForm.tsx` | Address selection, slot, diet, coupon, notes |
| `RazorpayButton.tsx` | Payment button with Razorpay integration |
| `OrderStatusTracker.tsx` | Visual step tracker for order status |
| `OrderCard.tsx` | Order summary card for profile page |
| `SubscriptionCard.tsx` | Subscription summary card |

### 6.3 Modified Components

| Component | Change |
|-----------|--------|
| `BowlCard.tsx` | Add "Add to Cart" button (replaces Swiggy/Zomato or adds alongside) |
| `menu.tsx` | Add cart context, "Add to Cart" on each active item |
| `subscribe.tsx` | Wire to subscription API + Razorpay payment |
| `Header.tsx` | Add cart icon with item count badge |
| `contact.tsx` | Form submission now saves to DB + triggers admin email |

---

## 7. Email Notifications — Phase 3

| Trigger | Recipient | Subject |
|---------|-----------|---------|
| Order placed | Customer | "Order confirmed! #{orderNumber} 🌿" |
| Order placed | Admin | "New order #{orderNumber} from {name}" |
| Order status change | Customer | "Your order #{orderNumber} is {status}" |
| Payment failed | Customer | "Payment failed for #{orderNumber}" |
| Subscription created | Customer | "Welcome to your {plan} subscription! 🎉" |
| Subscription paused | Customer | "Your subscription has been paused" |
| Refund processed | Customer | "Refund of ₹{amount} processed" |
| Contact form reply | Submitter | "Re: {subject} — Etato Foods" |

---

## 8. Task Breakdown — Phase 3

### Backend Tasks (est. ~14 hours)

| # | Task | Est. |
|---|------|------|
| B25 | Install Razorpay SDK, configure keys | 30 min |
| B26 | Order creation endpoint (validate phone, zone, menu status) | 2 hr |
| B27 | Razorpay order creation endpoint | 1 hr |
| B28 | Payment verification endpoint (signature check) | 1 hr |
| B29 | Razorpay webhook handler (payment.captured, failed, refund) | 1.5 hr |
| B30 | Order CRUD for customers (list, detail, cancel) | 1 hr |
| B31 | Admin order management (list, detail, status update) | 1.5 hr |
| B32 | Admin payment list + stats endpoints | 1 hr |
| B33 | Admin refund endpoint (Razorpay refund API) | 45 min |
| B34 | Subscription creation + Razorpay payment | 1.5 hr |
| B35 | Subscription management endpoints (pause, cancel, admin CRUD) | 1 hr |
| B36 | Order/payment/subscription email notifications | 1.5 hr |
| B37 | Order number auto-increment logic | 30 min |

### Frontend Tasks (est. ~18 hours)

| # | Task | Est. |
|---|------|------|
| F23 | Cart context + CartProvider | 1.5 hr |
| F24 | CartPanel (slide-out) + CartItem | 1.5 hr |
| F25 | Update BowlCard — "Add to Cart" button | 1 hr |
| F26 | Update Header — cart icon with badge | 30 min |
| F27 | Checkout page (address, slot, diet, coupon, notes, summary) | 2 hr |
| F28 | Razorpay inline checkout integration | 1.5 hr |
| F29 | Order success page | 45 min |
| F30 | Profile page — orders tab with status tracker | 2 hr |
| F31 | Profile page — subscriptions tab | 1 hr |
| F32 | Wire subscribe.tsx to subscription API + Razorpay | 1.5 hr |
| F33 | Admin orders page — table + status update | 2 hr |
| F34 | Admin payments page — table + refund + stats | 1.5 hr |
| F35 | Admin subscriptions page | 1 hr |
| F36 | Wire contact.tsx form to backend API | 30 min |

---

## 9. Deployment Checklist

- [ ] PostgreSQL provisioned (Supabase / Railway / Neon)
- [ ] Backend deployed (Railway / Render / VPS)
- [ ] Frontend deployed (Vercel / Cloudflare Pages)
- [ ] Environment variables set in production
- [ ] Razorpay live keys configured
- [ ] SMTP credentials for production email
- [ ] Domain + SSL configured
- [ ] CORS updated to production domain
- [ ] Razorpay webhook URL registered
- [ ] Super admin account seeded
- [ ] Initial menu + categories seeded
- [ ] ETATO10 coupon seeded
- [ ] Subscription plans seeded
- [ ] Google Analytics 4 installed
- [ ] Error monitoring (Sentry or similar)
- [ ] Database backups configured
- [ ] Rate limiting tuned for production

---

## 10. Full API Summary — All Phases

### Public Endpoints (No Auth)

| Endpoint | Phase |
|----------|-------|
| `POST /api/auth/signup` | 1 |
| `POST /api/auth/login` | 1 |
| `POST /api/auth/refresh` | 1 |
| `GET /api/menu` | 1 |
| `GET /api/menu/:slug` | 1 |
| `GET /api/categories` | 1 |
| `POST /api/user/check-zone` | 1 |
| `POST /api/contact` | 1 |
| `GET /api/blog` | 2 |
| `GET /api/blog/:slug` | 2 |
| `GET /api/settings` | 2 |
| `GET /api/subscription-plans` | 3 |
| `POST /api/coupons/validate` | 3 |

### Customer Endpoints (JWT Required)

| Endpoint | Phase |
|----------|-------|
| `GET /api/auth/me` | 1 |
| `POST /api/auth/logout` | 1 |
| `PATCH /api/user/phone` | 1 |
| `PATCH /api/user/profile` | 1 |
| `POST /api/user/address` | 1 |
| `GET /api/user/addresses` | 1 |
| `DELETE /api/user/address/:id` | 1 |
| `POST /api/orders` | 3 |
| `GET /api/orders` | 3 |
| `GET /api/orders/:id` | 3 |
| `PATCH /api/orders/:id/cancel` | 3 |
| `POST /api/payments/create-razorpay-order` | 3 |
| `POST /api/payments/verify` | 3 |
| `POST /api/subscriptions` | 3 |
| `GET /api/subscriptions` | 3 |
| `PATCH /api/subscriptions/:id/pause` | 3 |

### Admin Endpoints (SUPER_ADMIN Role)

| Endpoint | Phase |
|----------|-------|
| `GET /api/admin/menu` | 2 |
| `POST /api/admin/menu` | 2 |
| `PUT /api/admin/menu/:id` | 2 |
| `PATCH /api/admin/menu/:id/status` | 2 |
| `DELETE /api/admin/menu/:id` | 2 |
| `POST /api/admin/menu/:id/image` | 2 |
| `GET/POST/PUT/DELETE /api/admin/categories` | 2 |
| `GET/POST/PUT/DELETE /api/admin/blog` | 2 |
| `GET /api/admin/customers` | 2 |
| `PATCH /api/admin/customers/:id/status` | 2 |
| `GET /api/admin/contacts` | 2 |
| `PATCH /api/admin/contacts/:id/reply` | 2 |
| `GET/POST/PUT/DELETE /api/admin/coupons` | 2 |
| `GET/PUT /api/admin/settings` | 2 |
| `GET /api/admin/orders` | 3 |
| `PATCH /api/admin/orders/:id/status` | 3 |
| `GET /api/admin/payments` | 3 |
| `POST /api/admin/payments/:id/refund` | 3 |
| `GET /api/admin/subscriptions` | 3 |
| `PATCH /api/admin/subscriptions/:id/status` | 3 |
| `GET/POST/PUT /api/admin/subscription-plans` | 3 |

### Webhook

| Endpoint | Phase |
|----------|-------|
| `POST /api/payments/webhook` | 3 |

---

## 11. Total Effort Estimate

| Phase | Backend | Frontend | Total |
|-------|---------|----------|-------|
| Phase 1 — Auth & User | ~10 hrs | ~7 hrs | **~17 hrs** |
| Phase 2 — Admin & CMS | ~12 hrs | ~16 hrs | **~28 hrs** |
| Phase 3 — Orders & Pay | ~14 hrs | ~18 hrs | **~32 hrs** |
| **Grand Total** | **~36 hrs** | **~41 hrs** | **~77 hrs** |

> These are development-only estimates. Testing, bug fixes, and deployment add ~20-30% overhead.
