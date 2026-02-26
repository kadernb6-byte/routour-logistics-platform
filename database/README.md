# Database Documentation

## Overview

This directory contains all database-related files for the Routeur Logistics platform.

## Structure

```
database/
├── migrations/             # SQL migration files (run in order)
│   └── 001_initial_schema.sql
├── seed.sql                # Sample data for development
└── README.md               # This file
```

## Tables

| Table       | Description                                    |
|-------------|------------------------------------------------|
| companies   | Carrier and shipper companies                  |
| users       | Users belonging to companies                   |
| shipments   | Freight shipment listings created by shippers  |
| bids        | Carrier bids on shipments                      |

## Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE routeur_logistics;
```

2. Run migrations:
```bash
cd backend
npm run db:migrate
```

3. (Optional) Seed sample data:
```bash
npm run db:seed
```

## Seed Credentials

| Email                    | Password     | Role    |
|--------------------------|--------------|---------|
| carrier@fastfreight.com  | Password123  | carrier |
| carrier@eurohaul.com     | Password123  | carrier |
| shipper@techparts.com    | Password123  | shipper |
| shipper@greengoods.com   | Password123  | shipper |
