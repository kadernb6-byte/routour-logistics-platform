// ============================================
// Trip Routes
// ============================================
// Endpoints for carrier trips and shipment matching.

const { Router } = require('express');
const tripController = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

// GET /api/v1/trips — browse all active trips (public for all authenticated users)
router.get('/', authenticate, tripController.getAllTrips);

// GET /api/v1/trips/mine — get my trips (carrier only)
router.get('/mine', authenticate, authorize('carrier'), tripController.getMyTrips);

// POST /api/v1/trips — publish a new trip (carrier only)
router.post('/', authenticate, authorize('carrier'), tripController.createTrip);

// GET /api/v1/trips/match/:tripId — find matching shipments for a trip
router.get('/match/:tripId', authenticate, tripController.matchShipments);

// PUT /api/v1/trips/:id — update a trip (carrier only, own trips)
router.put('/:id', authenticate, authorize('carrier'), tripController.updateTrip);

module.exports = router;
