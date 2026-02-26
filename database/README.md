# Database Documentation

## Overview

Routeur Logistics uses **Supabase** (hosted PostgreSQL) as its database. The frontend connects directly to Supabase via REST API for authentication, while the backend uses the Supabase JS client for other operations.

## Structure

```
database/
├── migrations/              # SQL migration files (run in order)
│   ├── 001_initial_schema.sql
│   ├── 002_trips.sql
│   ├── 003_documents_verification.sql
│   ├── 004_payments.sql
│   ├── 005_bookings.sql
│   └── 006_add_phone_to_users.sql
├── supabase_setup.sql       # ⭐ Combined SQL (all migrations + seed + RLS)
├── seed.sql                 # Sample data for development
└── README.md                # This file
```

## Tables (9 total)

| Table              | Description                                    |
|--------------------|------------------------------------------------|
| companies          | Carrier and shipper companies                  |
| users              | Users belonging to companies                   |
| shipments          | Freight shipment listings created by shippers  |
| bids               | Carrier bids on shipments                      |
| trips              | Carrier trips with available capacity          |
| bookings           | Trip reservations by shippers                  |
| documents          | Verification documents uploaded by companies   |
| payments           | Payment records with commission tracking       |
| platform_revenue   | Platform commission revenue ledger              |

## Setup with Supabase

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the Combined SQL

1. Open **SQL Editor** in Supabase Dashboard
2. Copy the entire content of `supabase_setup.sql`
3. Paste and click **Run**

This single file:
- Creates all 9 tables with indexes and triggers
- Disables RLS (Row Level Security) for anon key access
- Inserts sample seed data (4 companies, 4 users, 3 shipments)

### 3. Get Your Credentials

Go to **Project Settings → API** and copy:
- **Project URL** → `SUPABASE_URL`
- **anon public key** → `SUPABASE_SERVICE_KEY`

## Seed Credentials

| Email                        | Password     | Role    | Company              |
|------------------------------|--------------|---------|----------------------|
| carrier@algertransport.dz    | Password123  | carrier | Alger Transport Pro  |
| carrier@saharalogistics.dz   | Password123  | carrier | Sahara Logistics     |
| shipper@atlasdz.com          | Password123  | shipper | Atlas Electronics DZ |
| shipper@greenagro.dz         | Password123  | shipper | Green Agro Export DZ |

## Architecture Notes

- **No direct PostgreSQL connection** — Uses Supabase JS client (REST API over HTTPS)
- **RLS disabled** — Since auth is handled server-side with JWT, RLS is not needed
- **Triggers** — `update_updated_at_column()` auto-updates `updated_at` on row changes
- **UUIDs** — All primary keys use `uuid_generate_v4()`
