// ============================================
// Route Index
// ============================================
// Central place where all route modules are mounted.
// Makes it easy to add new routes as the app grows.

const { Router } = require('express');
const authRoutes = require('./auth.routes');
const shipmentRoutes = require('./shipment.routes');
const tripRoutes = require('./trip.routes');
const documentRoutes = require('./document.routes');
const paymentRoutes = require('./payment.routes');
const bookingRoutes = require('./booking.routes');
const settingsRoutes = require('./settings.routes');

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/trips', tripRoutes);
router.use('/documents', documentRoutes);
router.use('/payments', paymentRoutes);
router.use('/bookings', bookingRoutes);
router.use('/settings', settingsRoutes);

// API welcome endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Routeur Logistics API v1',
        endpoints: {
            auth: '/api/v1/auth',
            shipments: '/api/v1/shipments',
            trips: '/api/v1/trips',
            documents: '/api/v1/documents',
            payments: '/api/v1/payments',
        },
    });
});

module.exports = router;
