// ============================================
// Payment Routes
// ============================================

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// POST /api/v1/payments — Create a payment (shipper pays for a shipment)
router.post('/', authenticate, paymentController.createPayment);

// GET /api/v1/payments — Get my payments (as payer or payee)
router.get('/', authenticate, paymentController.getMyPayments);

// GET /api/v1/payments/stats — Get my payment stats
router.get('/stats', authenticate, paymentController.getStats);

// GET /api/v1/payments/revenue — Platform revenue (admin)
router.get('/revenue', authenticate, paymentController.getPlatformRevenue);

// GET /api/v1/payments/:id — Get payment details
router.get('/:id', authenticate, paymentController.getPaymentById);

// PUT /api/v1/payments/:id/complete — Carrier confirms delivery
router.put('/:id/complete', authenticate, paymentController.completePayment);

module.exports = router;
