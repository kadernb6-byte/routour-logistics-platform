// ============================================
// Shipment Controller
// ============================================
// Handles HTTP layer for shipment operations.

const shipmentService = require('../services/shipment.service');
const response = require('../utils/apiResponse');

const create = async (req, res, next) => {
    try {
        const shipment = await shipmentService.createShipment(req.body, req.user.id);
        return response.created(res, shipment, 'Shipment created successfully');
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const { page, limit, status, origin, destination } = req.query;
        const { shipments, total } = await shipmentService.getShipments({
            page: page || 1,
            limit: limit || 10,
            status,
            origin,
            destination,
        });
        return response.paginated(res, shipments, page || 1, limit || 10, total);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const shipment = await shipmentService.getShipmentById(req.params.id);
        return response.success(res, shipment);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const shipment = await shipmentService.updateShipment(
            req.params.id,
            req.body,
            req.user.id
        );
        return response.success(res, shipment, 'Shipment updated successfully');
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await shipmentService.deleteShipment(req.params.id, req.user.id);
        return response.success(res, result);
    } catch (error) {
        next(error);
    }
};

module.exports = { create, getAll, getById, update, remove };
