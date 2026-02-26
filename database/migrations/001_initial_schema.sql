-- ============================================
-- ROUTEUR LOGISTICS - Initial Database Schema
-- ============================================
-- Migration: 001_initial_schema.sql
-- Description: Creates core tables for the logistics marketplace.
--
-- Key Design Decisions:
--   • UUID primary keys for security (no sequential guessing)
--   • Separate companies table (users belong to companies)
--   • Role-based: 'carrier' or 'shipper' on both company and user level
--   • Timestamps on every table for auditing
--   • Indexes on frequently queried columns

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Companies Table
-- ============================================
-- A company is either a carrier or a shipper.
-- Multiple users can belong to one company.
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('carrier', 'shipper')),
  address     TEXT,
  phone       VARCHAR(50),
  website     VARCHAR(255),
  logo_url    VARCHAR(500),
  verified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Users Table
-- ============================================
-- Each user belongs to one company and has a role.
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  first_name     VARCHAR(100),
  last_name      VARCHAR(100),
  role           VARCHAR(20) NOT NULL CHECK (role IN ('carrier', 'shipper', 'admin')),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_active      BOOLEAN DEFAULT TRUE,
  last_login     TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Shipments Table
-- ============================================
-- Created by shippers, browsed and bid on by carriers.
CREATE TABLE IF NOT EXISTS shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  origin          VARCHAR(255) NOT NULL,
  destination     VARCHAR(255) NOT NULL,
  weight          DECIMAL(10,2),          -- in kg
  dimensions      VARCHAR(100),           -- e.g. "120x80x100 cm"
  pickup_date     DATE,
  delivery_date   DATE,
  budget          DECIMAL(12,2),          -- in EUR
  status          VARCHAR(30) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  shipper_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  carrier_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Bids Table
-- ============================================
-- Carriers bid on shipments. Shippers accept/reject.
CREATE TABLE IF NOT EXISTS bids (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id   UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  carrier_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        DECIMAL(12,2) NOT NULL,
  notes         TEXT,
  status        VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- A carrier can only bid once per shipment
  UNIQUE(shipment_id, carrier_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_shipper ON shipments(shipper_id);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_dates ON shipments(pickup_date, delivery_date);
CREATE INDEX IF NOT EXISTS idx_bids_shipment ON bids(shipment_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier ON bids(carrier_id);

-- ============================================
-- Updated_at Trigger Function
-- ============================================
-- Automatically updates the updated_at column on row changes.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
