// ============================================
// Booking Service (Supabase)
// ============================================
// Business logic for trip bookings.

const { supabase } = require('../config/db');

/**
 * Create a new booking (shipper only)
 */
const createBooking = async (shipperId, { tripId, weight, paymentMethod, paymentRef, notes }) => {
    // 1. Get trip details
    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*, users!carrier_id(id, company_id, companies(name))')
        .eq('id', tripId)
        .single();

    if (tripError || !trip) {
        const error = new Error('Trip not found');
        error.statusCode = 404;
        throw error;
    }

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
    const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('trip_id', tripId)
        .eq('shipper_id', shipperId)
        .limit(1);

    if (existing && existing.length > 0) {
        const error = new Error('You have already booked this trip');
        error.statusCode = 409;
        throw error;
    }

    // 6. Calculate price
    const pricePerKg = Number(trip.price_per_kg) || 0;
    const totalPrice = (Number(weight) * pricePerKg).toFixed(2);

    // 7. Insert booking
    const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
            trip_id: tripId,
            shipper_id: shipperId,
            carrier_id: trip.carrier_id,
            weight,
            total_price: totalPrice,
            payment_method: paymentMethod,
            payment_ref: paymentRef || null,
            notes: notes || null,
        })
        .select()
        .single();

    if (insertError) throw new Error(insertError.message);

    return {
        ...booking,
        trip_origin: trip.origin,
        trip_destination: trip.destination,
        carrier_company: trip.users?.companies?.name || '',
    };
};

/**
 * Get bookings for the current user (as shipper or carrier)
 */
const getMyBookings = async (userId) => {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            trips(origin, destination, departure_date, vehicle_type, price_per_kg),
            shipper:users!shipper_id(company_id, shipper_company:companies(name)),
            carrier:users!carrier_id(company_id, carrier_company:companies(name))
        `)
        .or(`shipper_id.eq.${userId},carrier_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Flatten nested relations
    return (data || []).map(b => ({
        ...b,
        trip_origin: b.trips?.origin,
        trip_destination: b.trips?.destination,
        departure_date: b.trips?.departure_date,
        vehicle_type: b.trips?.vehicle_type,
        price_per_kg: b.trips?.price_per_kg,
        shipper_company: b.shipper?.shipper_company?.name || '',
        carrier_company: b.carrier?.carrier_company?.name || '',
        trips: undefined,
        shipper: undefined,
        carrier: undefined,
    }));
};

/**
 * Get a single booking by ID
 */
const getBookingById = async (bookingId) => {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            trips(origin, destination, departure_date, vehicle_type, price_per_kg),
            shipper:users!shipper_id(company_id, shipper_company:companies(name)),
            carrier:users!carrier_id(company_id, carrier_company:companies(name))
        `)
        .eq('id', bookingId)
        .single();

    if (error || !data) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
    }

    return {
        ...data,
        trip_origin: data.trips?.origin,
        trip_destination: data.trips?.destination,
        departure_date: data.trips?.departure_date,
        vehicle_type: data.trips?.vehicle_type,
        price_per_kg: data.trips?.price_per_kg,
        shipper_company: data.shipper?.shipper_company?.name || '',
        carrier_company: data.carrier?.carrier_company?.name || '',
        trips: undefined,
        shipper: undefined,
        carrier: undefined,
    };
};

/**
 * Update booking status (carrier confirms, marks in_transit, delivered)
 */
const updateBookingStatus = async (bookingId, carrierId, status) => {
    const { data: existing } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('carrier_id', carrierId)
        .single();

    if (!existing) {
        const error = new Error('Booking not found or not authorized');
        error.statusCode = 404;
        throw error;
    }

    const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Update payment status
 */
const updatePaymentStatus = async (bookingId, paymentStatus) => {
    const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', bookingId)
        .select()
        .single();

    if (error || !data) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
    }

    return data;
};

module.exports = { createBooking, getMyBookings, getBookingById, updateBookingStatus, updatePaymentStatus };
