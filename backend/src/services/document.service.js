// ============================================
// Document Service
// ============================================
// Business logic for document upload, retrieval, and admin review.

const db = require('../config/db');

/**
 * Upload a verification document
 */
const uploadDocument = async (userId, companyId, file, documentType) => {
    const result = await db.query(
        `INSERT INTO documents (company_id, uploaded_by, document_type, file_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [companyId, userId, documentType, file.originalname, file.path, file.size, file.mimetype]
    );

    // Update company verification status to 'pending' if it was 'unverified'
    await db.query(
        `UPDATE companies SET verification_status = 'pending'
         WHERE id = $1 AND (verification_status = 'unverified' OR verification_status IS NULL)`,
        [companyId]
    );

    return result.rows[0];
};

/**
 * Get all documents for a company
 */
const getCompanyDocuments = async (companyId) => {
    const result = await db.query(
        `SELECT d.*, u.email as uploaded_by_email
         FROM documents d
         JOIN users u ON d.uploaded_by = u.id
         WHERE d.company_id = $1
         ORDER BY d.created_at DESC`,
        [companyId]
    );
    return result.rows;
};

/**
 * Get company verification status with document summary
 */
const getVerificationStatus = async (companyId) => {
    const company = await db.query(
        'SELECT id, name, type, verified, verification_status, verified_at FROM companies WHERE id = $1',
        [companyId]
    );

    if (company.rows.length === 0) {
        const error = new Error('Company not found');
        error.statusCode = 404;
        throw error;
    }

    const documents = await db.query(
        `SELECT id, document_type, file_name, status, review_note, created_at
         FROM documents WHERE company_id = $1
         ORDER BY created_at DESC`,
        [companyId]
    );

    // Required documents for verification
    const requiredDocs = ['registre_commerce', 'nif'];
    const uploadedTypes = documents.rows.map(d => d.document_type);
    const missingDocs = requiredDocs.filter(t => !uploadedTypes.includes(t));

    return {
        company: company.rows[0],
        documents: documents.rows,
        requiredDocuments: requiredDocs,
        missingDocuments: missingDocs,
        isComplete: missingDocs.length === 0,
    };
};

/**
 * Admin: Get all pending verifications
 */
const getPendingVerifications = async () => {
    const result = await db.query(
        `SELECT c.id, c.name, c.type, c.verification_status, c.created_at,
                COUNT(d.id) as document_count,
                COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_docs
         FROM companies c
         LEFT JOIN documents d ON c.id = d.company_id
         WHERE c.verification_status = 'pending'
         GROUP BY c.id
         ORDER BY c.created_at ASC`
    );
    return result.rows;
};

/**
 * Admin: Review a document (approve/reject)
 */
const reviewDocument = async (documentId, adminId, status, reviewNote) => {
    const result = await db.query(
        `UPDATE documents
         SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, reviewNote || null, adminId, documentId]
    );

    if (result.rows.length === 0) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

/**
 * Admin: Verify a company (approve all and set verified)
 */
const verifyCompany = async (companyId, adminId) => {
    // Approve all pending documents
    await db.query(
        `UPDATE documents SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE company_id = $2 AND status = 'pending'`,
        [adminId, companyId]
    );

    // Update company status
    const result = await db.query(
        `UPDATE companies
         SET verified = true, verification_status = 'verified', verified_at = NOW()
         WHERE id = $1
         RETURNING id, name, type, verified, verification_status`,
        [companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error('Company not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

/**
 * Admin: Reject a company verification
 */
const rejectCompany = async (companyId, adminId, reason) => {
    // Reject all pending documents
    await db.query(
        `UPDATE documents SET status = 'rejected', review_note = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE company_id = $3 AND status = 'pending'`,
        [reason, adminId, companyId]
    );

    const result = await db.query(
        `UPDATE companies SET verification_status = 'rejected' WHERE id = $1
         RETURNING id, name, type, verification_status`,
        [companyId]
    );

    return result.rows[0];
};

module.exports = {
    uploadDocument,
    getCompanyDocuments,
    getVerificationStatus,
    getPendingVerifications,
    reviewDocument,
    verifyCompany,
    rejectCompany,
};
