# 🚛 Routeur Logistics — B2B Freight Marketplace

A full-stack B2B logistics marketplace platform where carrier companies and shipper companies connect for freight transport across Europe.

## 📐 Architecture

```
routeur/
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── layout/       # Sidebar, Header, DashboardLayout
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # Page components (Dashboard, Shipments, Login...)
│   │   ├── services/         # API client
│   │   ├── App.jsx           # Router + route definitions
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Design system & global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Database, environment, migrations
│   │   ├── controllers/      # HTTP request handlers (thin layer)
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic (core layer)
│   │   ├── utils/            # Helpers (API response formatter)
│   │   └── index.js          # Server entry point
│   └── package.json
│
├── database/                 # PostgreSQL schema & seeds
│   ├── migrations/           # SQL migration files
│   │   └── 001_initial_schema.sql
│   ├── seed.sql              # Sample development data
│   └── README.md
│
├── .env.example              # Environment variables template
├── .gitignore
├── package.json              # Root monorepo scripts
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url> routeur
cd routeur

# Install all dependencies (root + frontend + backend)
npm run install:all
```

### 2. Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# At minimum, set: DB_PASSWORD and JWT_SECRET
```

### 3. Set Up Database

```bash
# Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE routeur_logistics;"

# Run migrations (creates tables)
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
# Start both frontend and backend simultaneously
npm run dev

# Or start them separately:
npm run dev:frontend    # → http://localhost:5173
npm run dev:backend     # → http://localhost:5000
```

### 5. Test the API

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api/v1

# Signup
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com","password":"Password123","companyName":"Test Co","role":"shipper"}'
```

## 🔑 Demo Credentials (after seeding)

| Email                    | Password     | Role    | Company            |
|--------------------------|--------------|---------|---------------------|
| carrier@fastfreight.com  | Password123  | Carrier | FastFreight Carriers |
| carrier@eurohaul.com     | Password123  | Carrier | EuroHaul Logistics   |
| shipper@techparts.com    | Password123  | Shipper | TechParts Manufacturing |
| shipper@greengoods.com   | Password123  | Shipper | GreenGoods Export    |

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 6, React Router 7   |
| Backend    | Node.js, Express 4                  |
| Database   | PostgreSQL + pg driver              |
| Auth       | JWT + bcryptjs                      |
| Styling    | Vanilla CSS (custom design system)  |
| Icons      | Lucide React                        |
| Security   | Helmet, CORS, Rate Limiting         |
| Validation | express-validator                   |

## 📋 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description         |
|--------|----------------------|---------|---------------------|
| POST   | `/api/v1/auth/signup` | Public  | Register new user   |
| POST   | `/api/v1/auth/login`  | Public  | Login & get token   |
| GET    | `/api/v1/auth/me`     | Private | Get current profile |

### Shipments
| Method | Endpoint                  | Access         | Description        |
|--------|---------------------------|----------------|--------------------|
| GET    | `/api/v1/shipments`       | Authenticated  | List all shipments |
| GET    | `/api/v1/shipments/:id`   | Authenticated  | Get single shipment|
| POST   | `/api/v1/shipments`       | Shippers only  | Create shipment    |
| PUT    | `/api/v1/shipments/:id`   | Shippers only  | Update shipment    |
| DELETE | `/api/v1/shipments/:id`   | Shippers only  | Delete shipment    |

## 🏗️ Key Design Decisions

1. **Controller → Service → Database pattern**: Controllers are thin HTTP handlers. Services contain business logic. This makes testing and refactoring easy.

2. **UUID primary keys**: Prevents sequential ID guessing attacks and is better for distributed systems.

3. **Role-based access**: Both the middleware and frontend adapt based on `carrier` or `shipper` roles.

4. **Graceful DB failure**: The server starts even without a database connection, so frontend development isn't blocked.

5. **CSS Design System**: All styles use CSS custom properties — change one variable and the entire theme updates.

6. **Vite proxy**: In development, API calls from the frontend are proxied to the backend, avoiding CORS issues.

## 📈 Scaling Guide

Ready to add more features? Here's the pattern:

1. **New feature**: Create `service → controller → route` files
2. **New page**: Add component in `pages/`, add route in `App.jsx`
3. **New middleware**: Add to `middleware/`, apply in routes
4. **New migration**: Create `002_new_feature.sql` in `database/migrations/`

## 📝 License

Private — All rights reserved.
