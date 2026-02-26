-- ============================================
-- ROUTEUR LOGISTICS - Bookings Table
-- ============================================
-- Migration: 005_bookings.sql
-- Description: Bookings link shippers to carrier trips.
--
-- Flow: Shipper browses trips → clicks "Book" → chooses payment method
-- Status:  pending → confirmed → in_transit → delivered / cancelled
-- Payment: pending → paid / invoiced / overdue

CREATE TABLE IF NOT EXISTS bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
    shipper_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    carrier_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Shipment details
    weight          DECIMAL(10,2) NOT NULL CHECK (weight > 0),
    total_price     DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),

    -- Payment
    payment_method  VARCHAR(30) NOT NULL
                    CHECK (payment_method IN ('cash_on_delivery', 'bank_transfer', 'company_invoice')),
    payment_ref     VARCHAR(100),
    notes           TEXT,

    -- Status tracking
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    payment_status  VARCHAR(20) DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'paid', 'invoiced', 'overdue')),

    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One booking per shipper per trip
    UNIQUE(trip_id, shipper_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shipper ON bookings(shipper_id);
CREATE INDEX IF NOT EXISTS idx_bookings_carrier ON bookings(carrier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Auto-update timestamp
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
