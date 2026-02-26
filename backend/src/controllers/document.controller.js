// ============================================
// Document Controller
// ============================================
// HTTP layer for document upload, status, and admin review.

const documentService = require('../services/document.service');
const { success, created, error: apiError } = require('../utils/apiResponse');

/**
 * POST /documents/upload — Upload a verification document
 */
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return apiError(res, 'No file uploaded. Attach a document (PDF, JPEG, PNG, DOC).', 400);
        }

        const documentType = req.body.document_type || 'other';
        const doc = await documentService.uploadDocument(
            req.user.id,
            req.user.companyId,
            req.file,
            documentType
        );

        return created(res, doc, 'Document uploaded successfully. It will be reviewed by our team.');
    } catch (err) {
        next(err);
    }
};

/**
 * GET /documents — Get my company's documents
 */
const getMyDocuments = async (req, res, next) => {
    try {
        const documents = await documentService.getCompanyDocuments(req.user.companyId);
        return success(res, documents);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /documents/status — Get verification status & progress
 */
const getVerificationStatus = async (req, res, next) => {
    try {
        const status = await documentService.getVerificationStatus(req.user.companyId);
        return success(res, status);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /documents/admin/pending — Admin: list pending verifications
 */
const getPendingVerifications = async (req, res, next) => {
    try {
        const pending = await documentService.getPendingVerifications();
        return success(res, pending);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /documents/admin/company/:companyId — Admin: view company documents
 */
const getCompanyDocuments = async (req, res, next) => {
    try {
        const documents = await documentService.getCompanyDocuments(req.params.companyId);
        return success(res, documents);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /documents/admin/review/:documentId — Admin: review single document
 */
const reviewDocument = async (req, res, next) => {
    try {
        const { status, review_note } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return apiError(res, 'Status must be "approved" or "rejected".', 400);
        }

        const doc = await documentService.reviewDocument(
            req.params.documentId,
            req.user.id,
            status,
            review_note
        );

        return success(res, doc, `Document ${status}.`);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /documents/admin/verify/:companyId — Admin: approve company
 */
const verifyCompany = async (req, res, next) => {
    try {
        const company = await documentService.verifyCompany(req.params.companyId, req.user.id);
        return success(res, company, 'Company verified successfully.');
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /documents/admin/reject/:companyId — Admin: reject company
 */
const rejectCompany = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const company = await documentService.rejectCompany(req.params.companyId, req.user.id, reason);
        return success(res, company, 'Company verification rejected.');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadDocument,
    getMyDocuments,
    getVerificationStatus,
    getPendingVerifications,
    getCompanyDocuments,
    reviewDocument,
    verifyCompany,
    rejectCompany,
};
