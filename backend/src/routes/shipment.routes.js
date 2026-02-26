// ============================================
// Shipment Routes
// ============================================

const { Router } = require('express');
const shipmentController = require('../controllers/shipment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateShipment } = require('../middleware/validate');

const router = Router();

// All shipment routes require authentication
router.use(authenticate);

// GET /api/v1/shipments         — list all (carriers browse, shippers see own)
router.get('/', shipmentController.getAll);

// GET /api/v1/shipments/:id     — get single shipment
router.get('/:id', shipmentController.getById);

// POST /api/v1/shipments        — create (shippers only)
router.post('/', authorize('shipper'), validateShipment, shipmentController.create);

// PUT /api/v1/shipments/:id     — update (shippers only, own shipments)
router.put('/:id', authorize('shipper'), shipmentController.update);

// DELETE /api/v1/shipments/:id  — delete (shippers only, own shipments)
router.delete('/:id', authorize('shipper'), shipmentController.remove);

module.exports = router;
