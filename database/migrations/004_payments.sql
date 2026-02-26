-- ============================================
-- ROUTEUR LOGISTICS - Payments & Commissions
-- ============================================
-- Migration: 004_payments.sql
-- Description: Complete payment tracking system with platform commission.
--
-- Revenue model:
--   Shipper pays for a shipment → Platform takes commission → Carrier receives net amount
--   Example: Shipment = 50,000 DZD, Commission 10% = 5,000 DZD → Carrier gets 45,000 DZD

CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE RESTRICT,
    bid_id          UUID REFERENCES bids(id) ON DELETE SET NULL,
    payer_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,   -- shipper
    payee_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,   -- carrier

    -- Financial
    amount          DECIMAL(12,2) NOT NULL CHECK (amount > 0),               -- total amount
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1000,                    -- 10% default
    commission      DECIMAL(12,2) NOT NULL CHECK (commission >= 0),          -- platform fee
    net_amount      DECIMAL(12,2) NOT NULL CHECK (net_amount > 0),           -- payee receives

    -- Payment info
    currency        VARCHAR(3) DEFAULT 'DZD',
    payment_method  VARCHAR(30) DEFAULT 'platform'
                    CHECK (payment_method IN ('platform', 'bank_transfer', 'ccp', 'cash', 'other')),
    reference       VARCHAR(100),                                            -- external ref / receipt number
    
    -- Status tracking
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'completed', 'refunded', 'failed', 'disputed')),
    
    -- Timestamps
    payment_date    TIMESTAMP WITH TIME ZONE,                                -- when paid
    completed_at    TIMESTAMP WITH TIME ZONE,                                -- when confirmed
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Platform Revenue Ledger (tracks your earnings)
-- ============================================
CREATE TABLE IF NOT EXISTS platform_revenue (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount          DECIMAL(12,2) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_shipment ON payments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_payment ON platform_revenue(payment_id);

-- One payment per shipment constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_payments_shipment'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT uq_payments_shipment UNIQUE (shipment_id);
    END IF;
END $$;

-- Auto-update timestamp
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
