// ============================================
// Booking Controller
// ============================================

const bookingService = require('../services/booking.service');
const response = require('../utils/apiResponse');

const create = async (req, res, next) => {
    try {
        const booking = await bookingService.createBooking(req.user.id, req.body);
        return response.created(res, booking, 'Booking created successfully');
    } catch (error) {
        next(error);
    }
};

const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getMyBookings(req.user.id);
        return response.success(res, bookings);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);
        return response.success(res, booking);
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const booking = await bookingService.updateBookingStatus(
            req.params.id, req.user.id, req.body.status
        );
        return response.success(res, booking, 'Booking status updated');
    } catch (error) {
        next(error);
    }
};

const updatePayment = async (req, res, next) => {
    try {
        const booking = await bookingService.updatePaymentStatus(
            req.params.id, req.body.paymentStatus
        );
        return response.success(res, booking, 'Payment status updated');
    } catch (error) {
        next(error);
    }
};

module.exports = { create, getMyBookings, getById, updateStatus, updatePayment };
