-- ============================================
-- ROUTEUR LOGISTICS - Trips Table
-- ============================================
-- Migration: 002_trips_table.sql
-- Description: Adds trips table for carriers to publish available routes.
--
-- A "trip" = a carrier saying "I'm going from A to B on date X
--            and I have Y kg of capacity available."

CREATE TABLE IF NOT EXISTS trips (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin              VARCHAR(255) NOT NULL,
  destination         VARCHAR(255) NOT NULL,
  departure_date      DATE NOT NULL,
  available_capacity  DECIMAL(10,2) NOT NULL,    -- in kg
  price_per_kg        DECIMAL(10,2),              -- optional pricing
  vehicle_type        VARCHAR(100),               -- e.g. 'flatbed', 'refrigerated', 'van'
  notes               TEXT,
  status              VARCHAR(20) DEFAULT 'active'
                      CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_carrier ON trips(carrier_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_route ON trips(origin, destination);
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips(departure_date);

-- Auto-update timestamp
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
