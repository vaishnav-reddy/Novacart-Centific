<div align="center">

# 🛒 NovaCart

### Omni-Channel Retail Operations Platform

**A full-stack MVP for a 74-store consumer electronics chain**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1-F55036?style=flat-square)](https://console.groq.com)

[Live Demo](#demo-credentials) · [Quick Start](#quick-start) · [API Docs](#api-reference) · [Architecture](#architecture)

</div>

---

## What is NovaCart?

NovaCart is a production-quality retail operations platform that unifies inventory management, point-of-sale billing, returns processing, analytics, and AI-powered business intelligence into a single system — scoped per store and per role.

Built as a hackathon MVP, it demonstrates a real omni-channel architecture with:
- **Store-scoped data** — each user sees only their store's data
- **Role-based access control** — 5 roles with granular permissions
- **Real-time alerts** — low stock and pending return notifications
- **AI assistant** — natural language queries over live store data

---

## Features

| Module | Description |
|--------|-------------|
| **Landing Page** | Professional marketing page with live demo credentials |
| **Authentication** | JWT-based login with role-aware redirects |
| **Dashboard** | KPI cards, revenue line chart, category pie chart, top products |
| **Inventory** | Real-time stock levels, status badges, supervisor stock adjustments |
| **POS / Billing** | Dual-panel cashier interface, GST calculation, printable receipts |
| **Returns** | Item-level return selection, supervisor approval workflow, auto-restock |
| **Reports** | Revenue trends, store comparison table, category breakdown |
| **AI Assistant** | LLaMA 3.1 chat with live store context + anomaly detection |
| **Alert System** | Polling-based alerts for low/critical/out-of-stock items |

---

## Tech Stack

### Backend
- **FastAPI** — async REST API with automatic OpenAPI docs
- **SQLAlchemy 2.x** — ORM with relationship mapping
- **PostgreSQL** — primary database
- **python-jose** — JWT token generation and validation
- **passlib + bcrypt** — password hashing
- **LangChain + Groq** — AI query pipeline (llama-3.1-8b-instant)
- **python-dotenv** — environment configuration

### Frontend
- **React 19** + **Vite** — fast dev server and build
- **Tailwind CSS v3** — utility-first styling
- **React Router v7** — client-side routing
- **Recharts** — line, bar, and pie charts
- **Lucide React** — icon library
- **Axios** — HTTP client with JWT interceptors

---

## Architecture

```
novacart/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── database.py              # SQLAlchemy engine + session factory
│   ├── seed.py                  # One-time DB seeder with demo data
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   ├── store.py             # Store
│   │   ├── user.py              # User
│   │   ├── product.py           # Product (SKU)
│   │   ├── inventory.py         # Inventory (per store per product)
│   │   └── transaction.py       # Transaction, TransactionItem, Return, AuditLog
│   ├── routers/
│   │   ├── auth.py              # POST /login, GET /me
│   │   ├── inventory.py         # GET /inventory, POST /adjust
│   │   ├── billing.py           # POST /checkout, GET /transactions
│   │   ├── returns.py           # CRUD + approve/reject
│   │   ├── reports.py           # Dashboard KPIs, store comparison
│   │   ├── alerts.py            # Stock + return alerts
│   │   └── ai.py                # Query, recommend, anomalies
│   └── services/
│       ├── auth_service.py      # JWT + bcrypt helpers
│       ├── inventory_service.py # Stock status logic + audit logging
│       ├── billing_service.py   # Checkout, GST calculation
│       ├── alert_service.py     # Alert aggregation
│       └── ai_service.py        # LangChain + Groq integration
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx              # Router + auth provider
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx  # JWT storage + axios defaults
        ├── components/
        │   ├── Layout.jsx       # Sidebar + Navbar wrapper
        │   ├── Sidebar.jsx      # Role-filtered navigation
        │   ├── Navbar.jsx       # Store name + alert bell
        │   ├── AlertBanner.jsx  # Sticky stock alert banner
        │   ├── Toast.jsx        # Global toast notifications
        │   ├── StockCard.jsx    # Inventory status card
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Landing.jsx      # Marketing landing page
            ├── Login.jsx        # Auth with demo credential shortcuts
            ├── Dashboard.jsx    # KPIs + charts
            ├── Inventory.jsx    # Stock table + adjust modal
            ├── POS.jsx          # Cashier interface + receipt modal
            ├── Returns.jsx      # Submit + manage returns
            ├── Reports.jsx      # Analytics + store comparison
            └── AIQuery.jsx      # Chat interface + anomaly panel
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ (running on port 5432)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/novacart.git
cd novacart
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/novacart
SECRET_KEY=novacart-super-secret-key-2025-hackathon
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY=gsk_your_key_here
REDIS_URL=redis://localhost:6379
```

Create the database and seed demo data:

```bash
# Create the database (PostgreSQL must be running)
psql -U postgres -c "CREATE DATABASE novacart;"

# Seed all demo data (stores, users, products, inventory, transactions)
python seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173

---

## Demo Credentials

All accounts use password: **`Demo@123`**

| Email | Role | Store | Key Capabilities |
|-------|------|-------|-----------------|
| admin@novacart.com | Admin | All Stores | Full access, all stores, store comparison |
| supervisor@novacart.com | Supervisor | Hyderabad Central | Own store, approve/reject returns |
| associate@novacart.com | Associate | Mumbai West | POS billing, submit returns |
| warehouse@novacart.com | Warehouse | Bangalore North | Inventory view only |
| executive@novacart.com | Executive | All Stores | Reports + AI, no POS access |

---

## Role-Based Access Control

| Page | Admin | Supervisor | Associate | Warehouse | Executive |
|------|:-----:|:----------:|:---------:|:---------:|:---------:|
| Dashboard | All stores | Own store | Own store | Own store | All stores |
| Inventory | Full + adjust | Full + adjust | View only | View only | — |
| POS / Billing | ✅ | ✅ | ✅ | ❌ | ❌ |
| Returns | All stores | Own store only | Submit only | ❌ | ❌ |
| Reports | All stores | Own store | ❌ | ❌ | All stores |
| AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## API Reference

### Authentication
```
POST   /api/v1/auth/login              Login, returns JWT + user info
GET    /api/v1/auth/me                 Current user from token
```

### Inventory
```
GET    /api/v1/inventory               List inventory (filter: store_id, category, search)
GET    /api/v1/inventory/sku/{barcode} Lookup by barcode
POST   /api/v1/inventory/adjust        Adjust stock quantity (supervisor+)
```

### Billing
```
POST   /api/v1/billing/checkout                Process sale, deduct inventory, return receipt
GET    /api/v1/billing/transactions            List transactions (filter: store_id, date range)
GET    /api/v1/billing/transactions/lookup     Lookup by short ID or full UUID
```

### Returns
```
POST   /api/v1/returns                 Submit return request
GET    /api/v1/returns                 List returns (scoped by role)
PATCH  /api/v1/returns/{id}/approve    Approve + restock inventory (supervisor+)
PATCH  /api/v1/returns/{id}/reject     Reject return (supervisor+)
```

### Reports
```
GET    /api/v1/reports/dashboard       KPIs, daily revenue, category breakdown (period: 7d/30d/90d)
GET    /api/v1/reports/store-comparison Cross-store revenue + transactions (admin/executive)
```

### Alerts
```
GET    /api/v1/alerts                  Low/critical/out-of-stock + pending returns
```

### AI
```
POST   /api/v1/ai/query                Natural language query with live store context
POST   /api/v1/ai/recommend            Product recommendations by category
POST   /api/v1/ai/anomalies            Detect unusual transactions and stock movements
```

---

## Groq API Key

The AI Assistant requires a free Groq API key.

1. Sign up at https://console.groq.com
2. Create an API key
3. Add it to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```
4. Restart the backend server

Model: `llama-3.1-8b-instant` (free tier, sub-second responses)

---

## Seeded Demo Data

Running `python seed.py` populates:

- **3 stores** — Hyderabad Central, Mumbai West, Bangalore North
- **5 users** — one per role, each assigned to a store
- **15 products** — Samsung Galaxy S24, Apple MacBook Air M2, Sony WH-1000XM5, iPad Pro, LG 55" 4K TV, Dell XPS 15, OnePlus 12, JBL Charge 5, Canon EOS R50, HP LaserJet, Apple Watch Series 9, Samsung 65" QLED, Bose QC45, Mi Band 8, Logitech MX Master 3
- **45 inventory records** — each product at each store with random quantities
- **30 transactions** — spread across stores over the last 30 days with varying volumes

To reset at any time:
```bash
python seed.py
```

---

## Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1B4F72` | Navbar, buttons, headings |
| `accent` | `#2E86C1` | Active states, links, charts |
| `success` | `#1E8449` | In-stock badges, approve actions |
| `warning` | `#F39C12` | Low stock, pending status |
| `danger` | `#C0392B` | Out-of-stock, reject actions |
| `sidebar` | `#1B3A5C` | Sidebar background |
| `background` | `#F4F6F8` | Page background |

---

## Known Notes

- The `(trapped) error reading bcrypt version` warning on startup is harmless — it's a passlib/bcrypt version mismatch that doesn't affect functionality
- The `Failed to find CUDA` warning is from an unrelated triton package in your Python environment — ignore it
- Redis is configured but not actively used in this MVP (session caching is optional)

---

<div align="center">

Built with FastAPI · React · PostgreSQL · Groq AI

</div>
