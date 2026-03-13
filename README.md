<div align="center">

# 🛒 Bazarmart

### A production-ready full-stack e-commerce platform built with the MERN stack

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat&logo=stripe&logoColor=white)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Deployment](#-deployment) · [Environment Variables](#-environment-variables) · [Screenshots](#-screenshots)

</div>

---

## 📖 Overview

Bazarmart is a production-ready e-commerce web application featuring a modern customer storefront and a full-featured admin operations suite. It supports multiple payment methods, real-time order management, loyalty tracking, AI-powered chat assistance, and a rich analytics dashboard — all built on the MERN stack.

## ✅ Repository Highlights

- Responsive storefront and mobile-optimized navigation
- Technical SEO foundations: canonical tags, Open Graph tags, Twitter tags, structured data, `robots.txt`, and `sitemap.xml`
- Production-oriented checkout with Stripe card flow, COD, JazzCash, and EasyPaisa
- Professional admin panel for products, orders, users, coupons, analytics, and tracking
- Route-level lazy loading and vendor chunk splitting for better frontend performance
- Quality checks already applied: lint cleanup, build verification, and end-to-end QA pass

---

## ✨ Features

### 🧑‍💼 Customer Facing
| Feature | Details |
|---|---|
| **Authentication** | JWT-based register / login / logout with secure HTTP-only cookies |
| **Product Catalog** | Search, filter by category & price, pagination |
| **Product Details** | Image gallery, ratings, customer reviews, shoe size/color selection |
| **Shopping Cart** | Persistent cart with quantity management |
| **Wishlist** | Save products for later |
| **Checkout Flow** | Shipping → Order Confirmation → Payment |
| **Payment Methods** | Credit/Debit Card (Stripe), Cash on Delivery, JazzCash, EasyPaisa |
| **Order Confirmation Email** | Automatic email receipt sent via SMTP (Nodemailer) |
| **Order History** | View all orders with real-time status tracking |
| **Invoice Download** | Generate PDF invoices via jsPDF |
| **Returns** | Submit and track return requests |
| **Loyalty Points** | Earn points on purchases, redeem for discounts |
| **Coupons** | Apply discount codes at checkout |
| **AI Chatbot** | Built-in support assistant |
| **PWA Support** | Installable as a Progressive Web App |

### 🛠️ Admin Panel
| Feature | Details |
|---|---|
| **Dashboard Analytics** | Revenue charts, order stats, top products (Recharts) |
| **Product Management** | Full CRUD — create, edit, delete, manage stock, shoe color/size options |
| **Order Management** | View, update status (Processing → Shipped → Delivered) |
| **User Management** | View all registered users, assign roles |
| **Coupon Management** | Create and manage discount codes |
| **Stock Alerts** | Low-stock notifications |
| **Activity Logs** | Track admin actions across the platform |
| **Export** | Export orders to CSV |

### 🔒 Security
- Server-side input validation & sanitization
- Rate limiting on all API endpoints (200 req/min global, stricter on login)
- Role-based access control (user / admin)
- Wallet payment number validation (regex enforced server-side)
- No sensitive data exposed in API responses

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, Axios |
| **Styling** | Plain CSS (custom design system) |
| **State / Auth** | React Context API, JWT, HTTP-only cookies |
| **Backend** | Node.js, Express 4, ES Modules |
| **Database** | MongoDB, Mongoose 8 |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Payments** | Stripe (card), local wallet simulation (JazzCash / EasyPaisa) |
| **Email** | Nodemailer (SMTP) |
| **Charts** | Recharts |
| **PDF** | jsPDF + jspdf-autotable |
| **Icons** | React Icons |
| **Notifications** | React Hot Toast |
| **Linting** | ESLint 9 (0 errors, 0 warnings) |
| **PWA** | Service Worker + Web Manifest |

---

## 📁 Project Structure

```
Ecom-Web/
├── backend/                  # Express API server
│   ├── config/               # Database connection
│   ├── controllers/          # Route handlers (MVC)
│   ├── middleware/           # Auth, error handling, rate limiting
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   ├── utils/                # Utilities (email, error classes)
│   ├── seed.js               # Database seeder
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
│
├── frontend/                 # React + Vite SPA
│   ├── public/               # Static assets, PWA manifest, service worker
│   └── src/
│       ├── assets/           # Images
│       ├── components/       # Reusable components (Header, Footer, etc.)
│       ├── context/          # AuthContext
│       ├── hooks/            # Custom hooks
│       └── pages/            # Page components + admin sub-pages
│
├── .gitignore
├── .env.example              # (see backend/.env.example)
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- [MongoDB](https://mongodb.com) — local instance or [Atlas](https://cloud.mongodb.com) cluster
- A [Stripe](https://stripe.com) account (for card payments — test mode works)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/bazarmart.git
cd bazarmart
```

### 2. Configure the backend
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and fill in your values (see [Environment Variables](#-environment-variables)).

### 3. Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 4. Seed the database
```bash
cd backend
npm run seed
```
This creates sample products and two default accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ecomweb.com` | `admin123` |
| Customer | `john@example.com` | `password123` |

> ⚠️ **Change these credentials before any public deployment.**

### 5. Start the development servers

**Backend** (runs on port 5000):
```bash
cd backend
npm run dev
```

**Frontend** (runs on port 5173):
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚢 Deployment

### Frontend
- Build command: `npm run build`
- Output directory: `frontend/dist`
- Suitable hosts: Vercel, Netlify, Cloudflare Pages, Firebase Hosting

### Backend
- Start command: `npm start`
- Suitable hosts: Render, Railway, Cyclic, VPS, Azure App Service

### Production Checklist
- Add production MongoDB URI
- Set secure JWT secret and cookie expiry
- Configure Stripe production keys if using live card payments
- Configure SMTP credentials if using order emails
- Update `FRONTEND_URL` in backend environment variables
- Replace the sample domain in `frontend/public/robots.txt` and `frontend/public/sitemap.xml`
- Change seeded demo credentials before launch

---

## 🔑 Environment Variables

All environment variables live in `backend/.env`. A documented template is provided in [`backend/.env.example`](backend/.env.example).

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random string for signing JWTs |
| `JWT_EXPIRE` | ✅ | JWT lifetime e.g. `7d` |
| `COOKIE_EXPIRE` | ✅ | Auth cookie lifetime in days |
| `PORT` | — | API server port (default `5000`) |
| `NODE_ENV` | — | `development` or `production` |
| `FRONTEND_URL` | — | Frontend origin for CORS (default `http://localhost:5173`) |
| `STRIPE_SECRET_KEY` | — | Stripe secret key (card payments) |
| `STRIPE_PUBLISHABLE_KEY` | — | Stripe publishable key (sent to frontend) |
| `SMTP_HOST` | — | SMTP host for order emails |
| `SMTP_PORT` | — | SMTP port (default `587`) |
| `SMTP_USER` | — | SMTP username / email address |
| `SMTP_PASSWORD` | — | SMTP password / app password |
| `EMAIL_FROM` | — | Sender display name + address |

> Order confirmation emails are **optional** — the checkout flow works normally if SMTP vars are not set.

---

## 📡 API Routes

Base URL: `http://localhost:5000/api/v1`

| Resource | Method | Endpoint | Auth |
|---|---|---|---|
| **Auth** | POST | `/users/register` | — |
| | POST | `/users/login` | — |
| | GET | `/users/logout` | User |
| | GET | `/users/me` | User |
| | PUT | `/users/me/update` | User |
| **Products** | GET | `/products` | — |
| | GET | `/products/:id` | — |
| | POST | `/products` | Admin |
| | PUT | `/products/:id` | Admin |
| | DELETE | `/products/:id` | Admin |
| **Orders** | POST | `/orders` | User |
| | GET | `/orders/me` | User |
| | GET | `/orders/:id` | User |
| | GET | `/orders` | Admin |
| | PUT | `/orders/:id/status` | Admin |
| **Payments** | GET | `/payment/stripe-key` | User |
| | POST | `/payment/process/stripe` | User |
| | POST | `/payment/process/local` | User |
| **Reviews** | POST | `/reviews` | User |
| | GET | `/reviews/product/:id` | — |
| **Wishlist** | GET | `/wishlist` | User |
| | POST | `/wishlist/:productId` | User |
| | DELETE | `/wishlist/:productId` | User |
| **Coupons** | POST | `/coupons/apply` | User |
| | POST | `/coupons` | Admin |
| **Analytics** | GET | `/activity-logs` | Admin |

---

## 📸 Screenshots

Add screenshots before publishing the repo. A good professional set is:

- Home page hero
- Product listing page
- Product detail page
- Cart and checkout flow
- Admin dashboard

| Storefront | Product Detail |
|---|---|
| *(screenshot)* | *(screenshot)* |

| Cart & Checkout | Admin Dashboard |
|---|---|
| *(screenshot)* | *(screenshot)* |

---

## 🏗️ Building for Production

```bash
cd frontend
npm run build
```

The optimised static files are output to `frontend/dist/`. Serve them via Nginx, Vercel, Netlify, or any static host. Point your frontend host to the deployed backend API URL by setting `VITE_API_URL` (if configured) or updating the Axios base URL.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, branch naming, and pull request expectations.

---

## 🔐 Security

If you discover a security issue, see [SECURITY.md](SECURITY.md) before disclosing it publicly.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ using the MERN Stack
</div>
