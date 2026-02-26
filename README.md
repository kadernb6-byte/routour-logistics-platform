# 🚛 Routeur Logistics — B2B Freight Marketplace

A full-stack B2B logistics marketplace platform connecting carrier and shipper companies for freight transport across Algeria.

**Live Demo:** [Deployed on Vercel](https://routour-logistics-platform.vercel.app)

## 📐 Architecture

```
routeur/
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── layout/       # Sidebar, Header, DashboardLayout
│   │   ├── context/          # AuthContext (direct Supabase auth)
│   │   ├── pages/            # Page components (Dashboard, Shipments, Login...)
│   │   ├── services/         # Supabase client + API helpers
│   │   ├── App.jsx           # Router + route definitions
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Design system & global styles
│   └── package.json
│
├── backend/                  # Node.js + Express API (Serverless on Vercel)
│   ├── src/
│   │   ├── config/           # Supabase client, environment config
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic (Supabase queries)
│   │   └── index.js          # Express app entry point
│   └── package.json
│
├── database/                 # Supabase schema & seeds
│   ├── migrations/           # SQL migration files (6 files)
│   ├── supabase_setup.sql    # Combined SQL for Supabase setup
│   ├── seed.sql              # Sample development data
│   └── README.md
│
├── api/                      # Vercel serverless function
│   └── index.js              # Express app wrapper
│
├── vercel.json               # Vercel deployment config
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Supabase** account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/kadernb6-byte/routour-logistics-platform.git
cd routour-logistics-platform

# Install all dependencies
npm run install:all
```

### 2. Set Up Supabase Database

1. Create a project on [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the content of `database/supabase_setup.sql`
3. This creates all 9 tables, indexes, triggers, and sample data

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-anon-key
JWT_SECRET=your-secret-key
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or separately:
npm run dev:frontend    # → http://localhost:5173
npm run dev:backend     # → http://localhost:5000
```

## 🔑 Demo Credentials

| Email                        | Password     | Role    | Company              |
|------------------------------|--------------|---------|----------------------|
| carrier@algertransport.dz    | Password123  | Carrier | Alger Transport Pro  |
| carrier@saharalogistics.dz   | Password123  | Carrier | Sahara Logistics     |
| shipper@atlasdz.com          | Password123  | Shipper | Atlas Electronics DZ |
| shipper@greenagro.dz         | Password123  | Shipper | Green Agro Export DZ |

## 🛠️ Tech Stack

| Layer      | Technology                                     |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite 6, React Router 7               |
| Backend    | Node.js, Express 4 (Serverless on Vercel)       |
| Database   | Supabase (PostgreSQL) via REST API              |
| Auth       | Direct Supabase + bcryptjs (client-side hashing)|
| Styling    | Vanilla CSS (custom design system)              |
| Charts     | Recharts                                        |
| Icons      | Lucide React                                    |
| Security   | Helmet, CORS, Rate Limiting                     |
| Hosting    | Vercel (frontend + serverless API)              |

## 🌐 Deployment (Vercel)

The project is configured for **one-click Vercel deployment**:

1. Import the repo on [vercel.com](https://vercel.com)
2. Set these **Environment Variables**:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_KEY` — your Supabase anon/service key
   - `JWT_SECRET` — any strong secret string
   - `NODE_ENV` — `production`
3. Deploy! Vercel auto-detects `vercel.json`

### How it works
- **Frontend** → Built by Vite, served as static files
- **Backend** → Runs as a Vercel serverless function (`/api/*`)
- **Auth** → Frontend connects directly to Supabase (no backend needed)

## 📋 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description         |
|--------|-----------------------|---------|---------------------|
| POST   | `/api/v1/auth/signup` | Public  | Register new user   |
| POST   | `/api/v1/auth/login`  | Public  | Login & get token   |
| GET    | `/api/v1/auth/me`     | Private | Get current profile |

### Shipments
| Method | Endpoint                  | Access        | Description        |
|--------|---------------------------|---------------|--------------------|
| GET    | `/api/v1/shipments`       | Authenticated | List all shipments |
| POST   | `/api/v1/shipments`       | Shippers only | Create shipment    |
| PUT    | `/api/v1/shipments/:id`   | Owner only    | Update shipment    |
| DELETE | `/api/v1/shipments/:id`   | Owner only    | Delete shipment    |

### Trips
| Method | Endpoint              | Access         | Description      |
|--------|-----------------------|----------------|------------------|
| GET    | `/api/v1/trips`       | Authenticated  | List active trips|
| POST   | `/api/v1/trips`       | Carriers only  | Create trip      |
| GET    | `/api/v1/trips/match` | Carriers only  | Match shipments  |

### Bookings & Payments
| Method | Endpoint                  | Access         | Description       |
|--------|---------------------------|----------------|-------------------|
| POST   | `/api/v1/bookings`        | Shippers only  | Book a trip       |
| GET    | `/api/v1/bookings/mine`   | Authenticated  | My bookings       |
| POST   | `/api/v1/payments`        | Shippers only  | Create payment    |
| GET    | `/api/v1/payments/stats`  | Authenticated  | Payment summary   |

## 🏗️ Key Design Decisions

1. **Supabase via REST API** — Connects through HTTPS (IPv4 compatible), no direct PostgreSQL needed
2. **Direct client-side auth** — Frontend authenticates directly with Supabase for reliability
3. **Controller → Service pattern** — Controllers handle HTTP, services handle business logic
4. **UUID primary keys** — Prevents sequential ID guessing, better for distributed systems
5. **Role-based access** — Middleware and frontend adapt based on `carrier` or `shipper` roles
6. **CSS Design System** — All styles use CSS custom properties for easy theming
7. **Vercel Serverless** — Backend runs as serverless function for zero-config deployment

## 📝 License

Private — All rights reserved.
