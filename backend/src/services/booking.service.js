// ============================================
// Booking Service
// ============================================
// Business logic for trip bookings.
// A booking = a shipper reserving space on a carrier's trip.

const db = require('../config/db');

/**
 * Create a new booking (shipper only)
 */
const createBooking = async (shipperId, { tripId, weight, paymentMethod, paymentRef, notes }) => {
    // 1. Get trip details
    const tripRes = await db.query(
        `SELECT t.*, u.id as carrier_user_id, c.name as company_name
         FROM trips t
         JOIN users u ON t.carrier_id = u.id
         JOIN companies c ON u.company_id = c.id
         WHERE t.id = $1`,
        [tripId]
    );

    if (tripRes.rows.length === 0) {
        const error = new Error('Trip not found');
        error.statusCode = 404;
        throw error;
    }

    const trip = tripRes.rows[0];

    // 2. Verify trip is active
    if (trip.status !== 'active') {
        const error = new Error('This trip is no longer available');
        error.statusCode = 400;
        throw error;
    }

    // 3. Check shipper isn't the carrier
    if (trip.carrier_id === shipperId) {
        const error = new Error('You cannot book your own trip');
        error.statusCode = 400;
        throw error;
    }

    // 4. Check weight fits capacity
    if (Number(weight) > Number(trip.available_capacity)) {
        const error = new Error(`Weight exceeds available capacity (${trip.available_capacity} kg)`);
        error.statusCode = 400;
        throw error;
    }

    // 5. Check no duplicate booking
    const existing = await db.query(
        'SELECT id FROM bookings WHERE trip_id = $1 AND shipper_id = $2',
        [tripId, shipperId]
    );
    if (existing.rows.length > 0) {
        const error = new Error('You have already booked this trip');
        error.statusCode = 409;
        throw error;
    }

    // 6. Calculate price
    const pricePerKg = Number(trip.price_per_kg) || 0;
    const totalPrice = (Number(weight) * pricePerKg).toFixed(2);

    // 7. Insert booking
    const result = await db.query(
        `INSERT INTO bookings (trip_id, shipper_id, carrier_id, weight, total_price, payment_method, payment_ref, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [tripId, shipperId, trip.carrier_id, weight, totalPrice, paymentMethod, paymentRef || null, notes || null]
    );

    const booking = result.rows[0];

    return {
        ...booking,
        trip_origin: trip.origin,
        trip_destination: trip.destination,
        carrier_company: trip.company_name,
    };
};

/**
 * Get bookings for the current user (as shipper or carrier)
 */
const getMyBookings = async (userId) => {
    const result = await db.query(
        `SELECT b.*,
                t.origin as trip_origin, t.destination as trip_destination,
                t.departure_date, t.vehicle_type, t.price_per_kg,
                sc.name as shipper_company, cc.name as carrier_company
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         JOIN users su ON b.shipper_id = su.id
         JOIN companies sc ON su.company_id = sc.id
         JOIN users cu ON b.carrier_id = cu.id
         JOIN companies cc ON cu.company_id = cc.id
         WHERE b.shipper_id = $1 OR b.carrier_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
    );
    return result.rows;
};

/**
 * Get a single booking by ID
 */
const getBookingById = async (bookingId) => {
    const result = await db.query(
        `SELECT b.*,
                t.origin as trip_origin, t.destination as trip_destination,
                t.departure_date, t.vehicle_type, t.price_per_kg,
                sc.name as shipper_company, cc.name as carrier_company
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         JOIN users su ON b.shipper_id = su.id
         JOIN companies sc ON su.company_id = sc.id
         JOIN users cu ON b.carrier_id = cu.id
         JOIN companies cc ON cu.company_id = cc.id
         WHERE b.id = $1`,
        [bookingId]
    );

    if (result.rows.length === 0) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

/**
 * Update booking status (carrier confirms, marks in_transit, delivered)
 */
const updateBookingStatus = async (bookingId, carrierId, status) => {
    const booking = await db.query(
        'SELECT * FROM bookings WHERE id = $1 AND carrier_id = $2',
        [bookingId, carrierId]
    );

    if (booking.rows.length === 0) {
        const error = new Error('Booking not found or not authorized');
        error.statusCode = 404;
        throw error;
    }

    const result = await db.query(
        `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
        [status, bookingId]
    );

    return result.rows[0];
};

/**
 * Update payment status
 */
const updatePaymentStatus = async (bookingId, paymentStatus) => {
    const result = await db.query(
        `UPDATE bookings SET payment_status = $1 WHERE id = $2 RETURNING *`,
        [paymentStatus, bookingId]
    );

    if (result.rows.length === 0) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

module.exports = { createBooking, getMyBookings, getBookingById, updateBookingStatus, updatePaymentStatus };
