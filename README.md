# 🍛 Swiggy - Production Food Delivery & Security Platform

A production-quality full-stack food delivery SaaS application built with **Node.js, Express, MongoDB, Socket.IO, React, Vite, and Tailwind CSS**, featuring enterprise-grade Fraud Detection, Dynamic Surge Pricing, Smart Geo-Based Delivery Assignment, Real-Time WebSockets Tracking, and a Personalized Recommendation Engine.

---

## 🔑 Demo Login Credentials (Academic & Review Evaluation)

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `admin123` | Full access to `/admin`, `/admin/fraud`, `/admin/surge-settings`, user restrictions & restaurant management |
| **Customer** | `customer@example.com` | `customer123` | Full access to restaurant discovery, multi-filter search, cart, checkout, tracking & recommendations |
| **Delivery Partner** | `delivery@example.com` | `delivery123` | Access to mobile-first `/delivery/dashboard`, status toggling, accept/decline & delivery status updates |

---

## 🌟 Key Features

### 🛡️ 1. Fraud Detection & Order Validation Engine
- **Rule-Based Risk Scoring (0–100)**: Evaluates user activity across multiple dimensions before confirming an order:
  - Rapid orders within short timeframe (+25 to +35 points)
  - Cancellation history & threshold violation (+25 points)
  - Excessive refund requests (+25 points)
  - Coupon abuse & repeated code reuse (+20 points)
  - Unusually high order value (> ₹5000) (+15 points)
  - Restricted account status (+40 points)
- **Risk Categorization**:
  - `0–29`: **LOW** Risk (Instant confirmation)
  - `30–59`: **MEDIUM** Risk (Monitored)
  - `60–79`: **HIGH** Risk (Flagged for admin review)
  - `80–100`: **CRITICAL** Risk (Flagged & user alert emitted)
- **Admin Security Controls (`/admin/fraud`)**:
  - Real-time audit dashboard with flagged order logs
  - One-click order **Approve** or **Reject** actions
  - User restriction & suspension toggles (`/api/admin/users/:userId/restrict`)

---

### ⚡ 2. Dynamic Surge Pricing Engine
- **Demand & Peak Hour Monitoring**:
  - Continuously evaluates regional active order volume (last 15 mins) and local peak hours (Lunch `12:00–15:00`, Dinner `19:30–22:30`).
  - Automatically calculates surge multipliers from **1.0x to 2.5x**.
- **Transparent Fee Breakdown**:
  - `Base Delivery Fee` + `Surge Fee` + `GST Taxes` - `Discount` = `Final Amount`.
- **Administrative Configuration (`/admin/surge-settings`)**:
  - Live demand thresholds slider & pricing preview widget.

---

### 🛵 3. Smart Delivery Partner Geo-Assignment
- **Haversine & 2dsphere Distance Calculations**:
  - Finds active delivery partners with status `AVAILABLE` and current workload < 3.
  - Ranks partners using weighted distance formula: `Score = Distance(km) * 0.7 + ActiveWorkload * 2.0`.
- **Automated Reassignment**:
  - If a delivery partner declines an order in `/delivery/dashboard`, the system automatically reallocates the task to the next closest available partner without dropping the order.

---

### 📡 4. Real-Time WebSockets Tracking & Notifications
- **Socket.IO Real-Time Lifecycle**:
  - `ORDER_PLACED` ➔ `RESTAURANT_ACCEPTED` ➔ `PREPARING` ➔ `READY_FOR_PICKUP` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
- Live visual progress timeline on `/orders/:orderId/tracking`.
- Instant push notifications for customer updates and admin security alerts.

---

### 🎯 5. Personalized Recommendation Engine
- **Aggregation Pipeline Scoring (`/api/restaurants/recommendations/:userId`)**:
  - Cuisine preference similarity (30% weight)
  - Order history frequency (25% weight)
  - Restaurant rating (20% weight)
  - Popularity score (15% weight)
  - Delivery time bonus (10% weight)
- Displays personalized tags such as *"Recommended because you order North Indian cuisine"*.

---

### 🔍 6. Advanced Restaurant Search & Fuzzy Text Matching
- **Endpoint**: `GET /api/restaurants/search`
- **Fuzzy Search**: Handles minor spelling variations (e.g. searching `"piza"` matches `"Pizza Craft"`).
- **Multi-Filter Support**: Cuisine, rating, max delivery time, veg-only indicator, price category, and sorting.

---

## 🎨 Design System (Warm Food-Tech Aesthetic)

The user interface follows a curated warm food-tech palette:
- **Background Off-White**: `#F7F4EE`
- **Charcoal Text & Navigation**: `#20201D`
- **Deep Olive & Muted Olive**: `#59624A` & `#78805E`
- **Warm Amber Accent**: `#D8893D`
- **Soft Beige Cards**: `#E9E1D3`

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Recharts, Socket.IO Client, Context API.
- **Backend**: Node.js, Express.js, Socket.IO, JWT Authentication, bcrypt.
- **Database**: MongoDB Atlas / Mongoose (GeoJSON 2dsphere indexing, compound indexes, text indexes).

---

## 🚀 Quick Start & Installation Guide

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/Mayankpatel-10/Swiggy-Backend.git
cd Swiggy-Backend

# Install Backend dependencies
npm install

# Install Frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Setup

Create `.env` file in the root directory:

```env
PORT=5000
MONGO_URL=mongodb+srv://mayankpatelmehta_db_user:DI3ncoinnnvvWqFk@swiggybackend.ovivvg7.mongodb.net/swiggy?appName=Swiggybackend
JWT_SECRET=swiggy_secret_key_2026
```

### 3. Seed Database

Populate realistic Indian restaurants (Delhi Zaika, Punjabi Rasoi, South Spice, Urban Biryani, etc.), menu items, coupons, and demo accounts:

```bash
npm run seed
```

### 4. Run Application

```bash
# Run backend server (Port 5000)
npm run dev

# In another terminal, run frontend React dev server (Port 3000)
cd client
npm run dev
```

Visit application in browser at: `http://localhost:3000` (or `http://localhost:5000` for production build).

---

## 🧪 Running Unit Tests

Run algorithm and service verification tests:

```bash
npm test
```

---

## 📚 API Reference Overview

### Auth Endpoints
- `POST /api/auth/register` - Register user account
- `POST /api/auth/login` - Authenticate & receive JWT
- `GET /api/auth/me` - Get logged-in profile

### Restaurant & Search
- `GET /api/restaurants/search` - Advanced search with fuzzy text matching & filters
- `GET /api/restaurants/:id` - Restaurant menu & details
- `GET /api/restaurants/recommendations/:userId` - Personalized recommendations

### Order & Delivery
- `POST /api/orders/calculate-delivery-fee` - Calculate dynamic surge delivery fee
- `POST /api/orders/create` - Place order (performs server-side fee validation & fraud risk evaluation)
- `POST /api/orders/cancel/:orderId` - Cancel order & update user cancellation count
- `GET /api/orders/:orderId` - Order tracking details
- `PUT /api/orders/update-status/:orderId` - Update order lifecycle status

### Delivery Partner
- `PUT /api/delivery/set-status` - Set availability status (`AVAILABLE`, `BUSY`, `OFFLINE`)
- `GET /api/delivery/orders` - View assigned deliveries
- `POST /api/delivery/orders/:orderId/decline` - Decline delivery & trigger auto-reassignment

### Admin Operations
- `GET /api/admin/dashboard-stats` - Analytics KPI overview & Recharts data
- `GET /api/admin/fraud/orders` - View flagged suspicious orders
- `POST /api/admin/fraud/orders/:orderId/approve` - Approve order
- `POST /api/admin/fraud/orders/:orderId/reject` - Reject order
- `POST /api/admin/users/:userId/restrict` - Restrict user account
- `GET /api/admin/surge-settings` - Retrieve surge pricing rules
- `PUT /api/admin/surge-settings` - Update surge pricing rules
