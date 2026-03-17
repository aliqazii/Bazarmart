# Bazarmart — Claude Code Instructions

## Project Overview

Full-stack MERN e-commerce application (shoe/product store). Single git repo with a monorepo-style layout: `backend/` (Express API) and `frontend/` (React + Vite SPA).

---

## Directory Structure

```
Bazarmart/
├── backend/                  # Node.js / Express API
│   ├── config/database.js    # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/           # auth, catchAsync, errorMiddleware, rateLimit
│   ├── models/               # Mongoose schemas (10 models)
│   ├── routes/               # Express routers
│   ├── utils/                # errorHandler, orderEmail
│   ├── app.js                # Express app setup
│   ├── server.js             # Entry point
│   └── seed.js               # Database seeder
└── frontend/                 # React 19 + Vite 8
    └── src/
        ├── App.jsx           # Routes
        ├── components/       # Header, Footer, ProductCard, AdminLayout, ChatBot, ...
        ├── context/          # AuthContext.jsx (auth state + wishlist)
        ├── hooks/            # useDocumentMeta, useScrollReveal
        └── pages/            # 24 pages + admin/ sub-folder (10 admin pages)
```

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | React | 19.2.0 |
| Build | Vite | 8.0.0-beta |
| Routing | React Router | 7.13.1 |
| HTTP Client | Axios | 1.13.6 |
| Backend | Express.js | 4.18.2 |
| Database | MongoDB + Mongoose | 8.0.0 |
| Auth | JWT + bcryptjs | 9.0.2 / 2.4.3 |
| Email | Nodemailer | 8.0.2 |
| Payments | Stripe | 20.4.0 |
| Charts | Recharts | 3.8.0 |
| PDF | jsPDF + autotable | 4.2.0 |
| Notifications | React Hot Toast | 2.6.0 |
| CSS | Plain custom CSS (App.css ~138KB) | — |

---

## Running the Project

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

Frontend dev server proxies API calls to `http://localhost:5000`.

---

## Environment Variables

Root `.env` and `backend/.env` — both used. Key vars:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecomweb
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / EMAIL_FROM
FRONTEND_URL=http://localhost:5173
```

---

## API

**Base:** `http://localhost:5000/api/v1`

| Resource | Prefix | Notes |
|----------|--------|-------|
| Users | `/users` | Register, login, profile, addresses, loyalty |
| Products | `/products` | CRUD (admin), search, autocomplete, recommendations |
| Orders | `/orders` | Create, list, status updates (admin), CSV export |
| Payments | `/payment` | Stripe + local wallets (JazzCash, EasyPaisa, COD) |
| Reviews | `/reviews` | Per-product, one review per user |
| Wishlist | `/wishlist` | Toggle, add, remove |
| Coupons | `/coupons` | Apply (user), CRUD (admin) |
| Stock Alerts | `/stock-alerts` | Notify on restock |
| Activity Logs | `/activity-logs` | Admin audit trail |
| Chatbot | `/chatbot` | AI support |

---

## Data Models (Mongoose)

1. **User** — roles: `user` / `admin`, loyalty tiers (Bronze→Platinum), referral, addresses[]
2. **Product** — variants (color + size), SEO fields (slug, metaTitle), images[], colorOptions[]
3. **Order** — statusTimeline[], returnStatus, paymentInfo, suspiciousScore
4. **Review** — unique per user+product
5. **Wishlist** — one doc per user with products[]
6. **Coupon** — discount %, minAmount, maxUses, expiry
7. **ReturnRequest** — ties to order, refundAmount, status workflow
8. **StockAlert** — unique user+product, notified flag
9. **ActivityLog** — admin action audit (CREATE/UPDATE/DELETE)
10. **CheckoutRecovery** — abandoned cart recovery

---

## Middleware

- `isAuthenticated` — JWT from HTTP-only cookie → loads `req.user`
- `authorizeRoles(...roles)` — RBAC, used on all `/admin` routes
- `catchAsync(fn)` — wraps async handlers
- `errorMiddleware` — global handler, maps Mongoose/JWT errors to clean responses
- `rateLimit` — 200 req/min global, 20 req/15min on login

---

## Frontend Architecture

- **AuthContext** — global auth state, wishlist, login/logout helpers
- **ProtectedRoute** — wraps private pages
- **SeoManager** — dynamic `<meta>` injection per page
- **AdminLayout** — sidebar + outlet for all `/admin/*` routes
- **PWA** — service worker (`public/sw.js`) + web manifest

---

## Seeded Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecomweb.com | admin123 |
| User | john@example.com | password123 |

Run seeder: `cd backend && node seed.js`

---

## Key Features

**Customer:** auth, product catalog with filters/search/autocomplete, cart, multi-payment checkout (Stripe/COD/JazzCash/EasyPaisa), order tracking, PDF invoices, reviews, wishlist, loyalty points, coupons, returns, PWA.

**Admin:** dashboard analytics (Recharts), product CRUD (variants), order management, user management, coupon CRUD, activity logs, CSV export, returns, stock alerts.

---

## Conventions

- Backend error responses use `ErrorHandler` class (`utils/errorHandler.js`)
- All async route handlers are wrapped with `catchAsync`
- Admin routes always check `isAuthenticated` then `authorizeRoles("admin")`
- Product slugs are auto-generated for SEO
- Payments: Stripe for cards, custom handler for local wallets
- Wallet numbers validated with regex (JazzCash/EasyPaisa Pakistani numbers)

---

## Notes

- CSS lives in one large `App.css` — no CSS framework (no Tailwind, no Bootstrap)
- No TypeScript — plain JavaScript throughout
- No testing framework configured yet
- Vite config splits vendor bundles: react, ui, payments, charts, pdf
