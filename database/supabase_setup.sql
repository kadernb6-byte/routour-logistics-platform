-- ============================================
-- ROUTEUR LOGISTICS - Combined Migration for Supabase
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- It creates all tables, indexes, triggers, and seed data.
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 001: Initial Schema
-- ============================================

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

CREATE TABLE IF NOT EXISTS shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  origin          VARCHAR(255) NOT NULL,
  destination     VARCHAR(255) NOT NULL,
  weight          DECIMAL(10,2),
  dimensions      VARCHAR(100),
  pickup_date     DATE,
  delivery_date   DATE,
  budget          DECIMAL(12,2),
  status          VARCHAR(30) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  shipper_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  carrier_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  UNIQUE(shipment_id, carrier_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_shipper ON shipments(shipper_id);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_dates ON shipments(pickup_date, delivery_date);
CREATE INDEX IF NOT EXISTS idx_bids_shipment ON bids(shipment_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier ON bids(carrier_id);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- ============================================
-- 002: Trips Table
-- ============================================

CREATE TABLE IF NOT EXISTS trips (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin              VARCHAR(255) NOT NULL,
  destination         VARCHAR(255) NOT NULL,
  departure_date      DATE NOT NULL,
  available_capacity  DECIMAL(10,2) NOT NULL,
  price_per_kg        DECIMAL(10,2),
  vehicle_type        VARCHAR(100),
  notes               TEXT,
  status              VARCHAR(20) DEFAULT 'active'
                      CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_carrier ON trips(carrier_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_route ON trips(origin, destination);
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips(departure_date);

DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 003: Documents & Verification
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL
                CHECK (document_type IN (
                    'registre_commerce', 'nif', 'license', 'insurance', 'id_card', 'other'
                )),
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_size     INTEGER,
  mime_type     VARCHAR(100),
  status        VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note   TEXT,
  reviewed_by   UUID REFERENCES users(id),
  reviewed_at   TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'companies' AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE companies ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified'
            CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'companies' AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE companies ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_companies_verification'
    ) THEN
        CREATE INDEX idx_companies_verification ON companies(verification_status);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 004: Payments & Commissions
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE RESTRICT,
    bid_id          UUID REFERENCES bids(id) ON DELETE SET NULL,
    payer_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payee_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount          DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    commission      DECIMAL(12,2) NOT NULL CHECK (commission >= 0),
    net_amount      DECIMAL(12,2) NOT NULL CHECK (net_amount > 0),
    currency        VARCHAR(3) DEFAULT 'DZD',
    payment_method  VARCHAR(30) DEFAULT 'platform'
                    CHECK (payment_method IN ('platform', 'bank_transfer', 'ccp', 'cash', 'other')),
    reference       VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'completed', 'refunded', 'failed', 'disputed')),
    payment_date    TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_revenue (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount          DECIMAL(12,2) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_shipment ON payments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_payment ON platform_revenue(payment_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_payments_shipment'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT uq_payments_shipment UNIQUE (shipment_id);
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 005: Bookings
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
    shipper_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    carrier_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    weight          DECIMAL(10,2) NOT NULL CHECK (weight > 0),
    total_price     DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    payment_method  VARCHAR(30) NOT NULL
                    CHECK (payment_method IN ('cash_on_delivery', 'bank_transfer', 'company_invoice')),
    payment_ref     VARCHAR(100),
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    payment_status  VARCHAR(20) DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'paid', 'invoiced', 'overdue')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trip_id, shipper_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shipper ON bookings(shipper_id);
CREATE INDEX IF NOT EXISTS idx_bookings_carrier ON bookings(carrier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 006: Add phone to users
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- ============================================
-- DISABLE RLS (required for anon key access)
-- ============================================

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED DATA
-- ============================================

DELETE FROM bookings;
DELETE FROM payments;
DELETE FROM documents;
DELETE FROM trips;
DELETE FROM bids;
DELETE FROM shipments;
DELETE FROM users;
DELETE FROM companies;

INSERT INTO companies (id, name, type, address, phone, verified) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alger Transport Pro', 'carrier',
 'Zone Industrielle Rouiba, Alger, Algeria', '+213699754824', true),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Sahara Logistics', 'carrier',
 'Hai El Badr, Oran, Algeria', '+213550112233', true),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Atlas Electronics DZ', 'shipper',
 'Zone Industrielle Sétif, Algeria', '+213661445566', true),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'Green Agro Export DZ', 'shipper',
 'Blida Centre, Algeria', '+213770889900', false);

INSERT INTO users (id, email, password_hash, first_name, last_name, role, company_id) VALUES
('11111111-1111-1111-1111-111111111111',
 'carrier@algertransport.dz',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Karim', 'Benali', 'carrier', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('22222222-2222-2222-2222-222222222222',
 'carrier@saharalogistics.dz',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Yacine', 'Meziane', 'carrier', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('33333333-3333-3333-3333-333333333333',
 'shipper@atlasdz.com',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Nadia', 'Hamidi', 'shipper', 'c3d4e5f6-a7b8-9012-cdef-123456789012'),
('44444444-4444-4444-4444-444444444444',
 'shipper@greenagro.dz',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Sofiane', 'Rahmani', 'shipper', 'd4e5f6a7-b8c9-0123-defa-234567890123');

INSERT INTO shipments (title, description, origin, destination, weight, dimensions, pickup_date, delivery_date, budget, status, shipper_id) VALUES
('Electronic Goods Alger → Oran', 'TVs and electronics pallet shipment',
 'Alger, Algeria', 'Oran, Algeria', 1800.00, '120x80x100 cm',
 '2026-03-01', '2026-03-03', 320000.00, 'pending', '33333333-3333-3333-3333-333333333333'),
('Agricultural Products Blida → Constantine', 'Fresh vegetables refrigerated transport',
 'Blida, Algeria', 'Constantine, Algeria', 2800.00, '240x120x150 cm',
 '2026-03-10', '2026-03-12', 410000.00, 'pending', '44444444-4444-4444-4444-444444444444'),
('Industrial Machines Sétif → Ouargla', 'Heavy equipment transport',
 'Sétif, Algeria', 'Ouargla, Algeria', 9000.00, '600x250x300 cm',
 '2026-03-15', '2026-03-20', 750000.00, 'pending', '33333333-3333-3333-3333-333333333333');
