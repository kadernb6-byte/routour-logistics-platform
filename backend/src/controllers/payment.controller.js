// ============================================
// Payment Controller
// ============================================

const paymentService = require('../services/payment.service');
const { success, created, error: apiError } = require('../utils/apiResponse');

const createPayment = async (req, res, next) => {
    try {
        const payment = await paymentService.createPayment(req.user.id, req.body);
        return created(res, payment, 'Payment recorded successfully.');
    } catch (err) {
        next(err);
    }
};

const getPaymentById = async (req, res, next) => {
    try {
        const payment = await paymentService.getPaymentById(req.params.id, req.user.id);
        return success(res, payment);
    } catch (err) {
        next(err);
    }
};

const getMyPayments = async (req, res, next) => {
    try {
        const payments = await paymentService.getUserPayments(req.user.id, req.query);
        return success(res, payments);
    } catch (err) {
        next(err);
    }
};

const completePayment = async (req, res, next) => {
    try {
        const payment = await paymentService.completePayment(req.params.id, req.user.id);
        return success(res, payment, 'Payment completed. Delivery confirmed.');
    } catch (err) {
        next(err);
    }
};

const getStats = async (req, res, next) => {
    try {
        const stats = await paymentService.getPaymentStats(req.user.id);
        return success(res, stats);
    } catch (err) {
        next(err);
    }
};

const getPlatformRevenue = async (req, res, next) => {
    try {
        const revenue = await paymentService.getPlatformRevenue();
        return success(res, revenue);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPayment,
    getPaymentById,
    getMyPayments,
    completePayment,
    getStats,
    getPlatformRevenue,
};
