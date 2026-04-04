# NovaCart — Omni-Channel Retail Operations Platform

A full-stack MVP for a 74-store consumer electronics retail chain. Built for hackathon demo — production-quality code, real data, AI-powered.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v3 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python + FastAPI |
| ORM | SQLAlchemy 2.x |
| Database | PostgreSQL 15+ |
| Auth | JWT (python-jose) + Bcrypt |
| AI | LangChain + Groq (llama-3.1-8b-instant) |
| State | React Context API + Axios |

---

## Project Structure

```
novacart/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── database.py           # SQLAlchemy engine + session
│   ├── seed.py               # DB seeder (run once)
│   ├── requirements.txt
│   ├── .env.example          # Copy to .env and fill in values
│   ├── models/
│   │   ├── store.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   └── transaction.py    # Transaction, TransactionItem, Return, AuditLog
│   ├── routers/
│   │   ├── auth.py
│   │   ├── inventory.py
│   │   ├── billing.py
│   │   ├── returns.py
│   │   ├── reports.py
│   │   ├── alerts.py
│   │   └── ai.py
│   └── services/
│       ├── auth_service.py
│       ├── inventory_service.py
│       ├── billing_service.py
│       ├── alert_service.py
│       └── ai_service.py
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── AlertBanner.jsx
        │   ├── StockCard.jsx
        │   ├── Toast.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Inventory.jsx
            ├── POS.jsx
            ├── Returns.jsx
            ├── Reports.jsx
            └── AIQuery.jsx
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ running on port 5432

### 1. Clone & configure

```bash
git clone https://github.com/yourusername/novacart.git
cd novacart
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/novacart
GROQ_API_KEY=gsk_your_key_here
```

Create the database, seed it, then start the server:

```bash
# Create DB (run once)
psql -U postgres -c "CREATE DATABASE novacart;"

# Seed demo data (run once)
python seed.py

# Start API server
uvicorn main:app --reload --port 8000
```

API runs at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## Demo Credentials

All accounts use password: `Demo@123`

| Email | Role | Store | Access |
|-------|------|-------|--------|
| admin@novacart.com | Admin | All Stores | Full access everywhere |
| supervisor@novacart.com | Supervisor | Hyderabad Central | Own store, approve returns |
| associate@novacart.com | Associate | Mumbai West | POS billing, submit returns |
| warehouse@novacart.com | Warehouse | Bangalore North | Inventory view only |
| executive@novacart.com | Executive | All Stores | Reports + AI, no POS |

---

## Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up and create an API key
3. Add to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```
4. Restart the backend server

Model used: `llama-3.1-8b-instant`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | Login, returns JWT |
| GET | /api/v1/auth/me | Current user info |
| GET | /api/v1/inventory | List inventory (filterable) |
| POST | /api/v1/inventory/adjust | Adjust stock (supervisor+) |
| POST | /api/v1/billing/checkout | Process a sale |
| GET | /api/v1/billing/transactions | List transactions |
| GET | /api/v1/billing/transactions/lookup | Lookup by short ID |
| POST | /api/v1/returns | Submit a return |
| GET | /api/v1/returns | List returns |
| PATCH | /api/v1/returns/{id}/approve | Approve return (supervisor+) |
| PATCH | /api/v1/returns/{id}/reject | Reject return (supervisor+) |
| GET | /api/v1/reports/dashboard | Dashboard KPIs + charts |
| GET | /api/v1/reports/store-comparison | Cross-store report (admin/exec) |
| GET | /api/v1/alerts | Stock + return alerts |
| POST | /api/v1/ai/query | Natural language AI query |
| POST | /api/v1/ai/anomalies | Detect transaction anomalies |

---

## Role-Based Access

| Page | Admin | Supervisor | Associate | Warehouse | Executive |
|------|-------|-----------|-----------|-----------|-----------|
| Dashboard | All stores | Own store | Own store | Own store | All stores |
| Inventory | Full | Full | View only | View only | — |
| POS/Billing | ✅ | ✅ | ✅ | ❌ | ❌ |
| Returns | All stores | Own store | Submit only | ❌ | ❌ |
| Reports | All stores | Own store | ❌ | ❌ | All stores |
| AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Seeded Demo Data

- 3 stores: Hyderabad Central, Mumbai West, Bangalore North
- 5 users (one per role)
- 15 electronics products (Samsung, Apple, Sony, Dell, LG, etc.)
- 45 inventory records (each product at each store)
- 30 transactions spread across stores (last 30 days)

---

## Re-seeding

To wipe and re-seed the database at any time:

```bash
cd backend
python seed.py
```

This clears all data and starts fresh.
