// ============================================
// Booking Routes
// ============================================

const { Router } = require('express');
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/bookings — shipper creates a booking
router.post('/', authorize('shipper'), bookingController.create);

// GET /api/v1/bookings — get my bookings (shipper or carrier)
router.get('/', bookingController.getMyBookings);

// GET /api/v1/bookings/:id — single booking details
router.get('/:id', bookingController.getById);

// PUT /api/v1/bookings/:id/status — carrier updates booking status
router.put('/:id/status', authorize('carrier'), bookingController.updateStatus);

// PUT /api/v1/bookings/:id/payment — update payment status
router.put('/:id/payment', bookingController.updatePayment);

module.exports = router;
