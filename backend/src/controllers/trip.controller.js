// ============================================
// Trip Controller
// ============================================
// Thin HTTP layer — delegates to trip.service.js

const tripService = require('../services/trip.service');
const { success, created, error: apiError } = require('../utils/apiResponse');

const createTrip = async (req, res, next) => {
    try {
        const trip = await tripService.createTrip(req.user.id, req.body);
        return created(res, trip, 'Trip published successfully');
    } catch (err) {
        next(err);
    }
};

const getAllTrips = async (req, res, next) => {
    try {
        const trips = await tripService.getAllTrips(req.query);
        return success(res, trips);
    } catch (err) {
        next(err);
    }
};

const getMyTrips = async (req, res, next) => {
    try {
        const trips = await tripService.getMyTrips(req.user.id);
        return success(res, trips);
    } catch (err) {
        next(err);
    }
};

const matchShipments = async (req, res, next) => {
    try {
        const result = await tripService.matchShipmentsToTrip(req.params.tripId);
        return success(res, result);
    } catch (err) {
        next(err);
    }
};

const updateTrip = async (req, res, next) => {
    try {
        const trip = await tripService.updateTrip(req.params.id, req.user.id, req.body);
        return success(res, trip, 'Trip updated');
    } catch (err) {
        next(err);
    }
};

module.exports = { createTrip, getAllTrips, getMyTrips, matchShipments, updateTrip };
