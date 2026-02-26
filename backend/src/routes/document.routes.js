// ============================================
// Document & Verification Routes
// ============================================

const { Router } = require('express');
const documentController = require('../controllers/document.controller');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

const router = Router();

// ---- User routes ----

// POST /api/v1/documents/upload — Upload a document (authenticated)
router.post(
    '/upload',
    authenticate,
    upload.single('document'),
    documentController.uploadDocument
);

// GET /api/v1/documents — Get my company's documents
router.get('/', authenticate, documentController.getMyDocuments);

// GET /api/v1/documents/status — Get verification status & required docs
router.get('/status', authenticate, documentController.getVerificationStatus);

// ---- Admin routes ----
// In production, add authorize('admin') middleware here

// GET /api/v1/documents/admin/pending — List companies awaiting verification
router.get('/admin/pending', authenticate, documentController.getPendingVerifications);

// GET /api/v1/documents/admin/company/:companyId — View a company's documents
router.get('/admin/company/:companyId', authenticate, documentController.getCompanyDocuments);

// PUT /api/v1/documents/admin/review/:documentId — Review a single document
router.put('/admin/review/:documentId', authenticate, documentController.reviewDocument);

// PUT /api/v1/documents/admin/verify/:companyId — Approve a company
router.put('/admin/verify/:companyId', authenticate, documentController.verifyCompany);

// PUT /api/v1/documents/admin/reject/:companyId — Reject a company
router.put('/admin/reject/:companyId', authenticate, documentController.rejectCompany);

module.exports = router;
