-- ============================================
-- ROUTEUR LOGISTICS - Documents & Verification
-- ============================================
-- Migration: 003_documents_verification.sql
-- Description: Adds document storage and verification tracking.
--
-- Flow:
--   1. Company registers → verified = false
--   2. Company uploads documents (RC, NIF, license, etc.)
--   3. Admin reviews documents → sets verified = true
--   4. Unverified companies cannot create trips or shipments

-- ============================================
-- Documents Table
-- ============================================
-- Stores uploaded verification documents per company.
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL
                CHECK (document_type IN (
                    'registre_commerce',    -- RC (Registre de Commerce)
                    'nif',                  -- NIF (Numéro d'Identification Fiscale)
                    'license',              -- Transport license
                    'insurance',            -- Insurance certificate
                    'id_card',              -- National ID / Passport
                    'other'
                )),
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_size     INTEGER,                    -- bytes
  mime_type     VARCHAR(100),
  status        VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note   TEXT,                       -- Admin feedback
  reviewed_by   UUID REFERENCES users(id),
  reviewed_at   TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Verification status on companies table
-- ============================================
-- Add verification_status column if not exists
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

    -- Create index on verification_status (inside DO block so column exists)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_companies_verification'
    ) THEN
        CREATE INDEX idx_companies_verification ON companies(verification_status);
    END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Auto-update timestamp
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

