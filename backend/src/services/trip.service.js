// ============================================
// Trip Service (Supabase)
// ============================================
// Business logic for carrier trips.

const { supabase } = require('../config/db');

/**
 * Create a new trip (carrier only)
 */
const createTrip = async (carrierId, tripData) => {
    const { origin, destination, departure_date, capacity, price_per_kg, vehicle_type, notes } = tripData;

    const { data, error } = await supabase
        .from('trips')
        .insert({
            carrier_id: carrierId,
            origin,
            destination,
            departure_date,
            available_capacity: capacity,
            price_per_kg: price_per_kg || null,
            vehicle_type: vehicle_type || null,
            notes: notes || null,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Get all active trips with optional filters
 */
const getAllTrips = async (filters = {}) => {
    let query = supabase
        .from('trips')
        .select('*, users!carrier_id(first_name, last_name, email, company_id, companies(name))');

    if (filters.origin) query = query.ilike('origin', `%${filters.origin}%`);
    if (filters.destination) query = query.ilike('destination', `%${filters.destination}%`);

    if (filters.status) {
        query = query.eq('status', filters.status);
    } else {
        query = query.eq('status', 'active');
    }

    query = query.order('departure_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Flatten nested relations
    return (data || []).map(t => ({
        ...t,
        first_name: t.users?.first_name,
        last_name: t.users?.last_name,
        email: t.users?.email,
        company_name: t.users?.companies?.name || '',
        users: undefined,
    }));
};

/**
 * Get trips by carrier
 */
const getMyTrips = async (carrierId) => {
    const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('carrier_id', carrierId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

/**
 * Match shipments to a trip
 */
const matchShipmentsToTrip = async (tripId) => {
    // Get the trip
    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

    if (tripError || !trip) {
        const error = new Error('Trip not found');
        error.statusCode = 404;
        throw error;
    }

    // Find matching shipments
    let query = supabase
        .from('shipments')
        .select('*, users!shipper_id(first_name, last_name, email, company_id, companies(name))')
        .ilike('origin', trip.origin)
        .ilike('destination', trip.destination)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (trip.available_capacity) {
        query = query.lte('weight', trip.available_capacity);
    }

    const { data: matches, error: matchError } = await query;
    if (matchError) throw new Error(matchError.message);

    const flatMatches = (matches || []).map(s => ({
        ...s,
        first_name: s.users?.first_name,
        last_name: s.users?.last_name,
        email: s.users?.email,
        company_name: s.users?.companies?.name || '',
        users: undefined,
    }));

    return {
        trip,
        matchCount: flatMatches.length,
        matches: flatMatches,
    };
};

/**
 * Update a trip (carrier only, own trips)
 */
const updateTrip = async (tripId, carrierId, updates) => {
    // Verify ownership
    const { data: existing } = await supabase
        .from('trips')
        .select('id')
        .eq('id', tripId)
        .eq('carrier_id', carrierId)
        .single();

    if (!existing) {
        const error = new Error('Trip not found or not authorized');
        error.statusCode = 404;
        throw error;
    }

    const updateObj = {};
    if (updates.origin !== undefined) updateObj.origin = updates.origin;
    if (updates.destination !== undefined) updateObj.destination = updates.destination;
    if (updates.departure_date !== undefined) updateObj.departure_date = updates.departure_date;
    if (updates.capacity !== undefined) updateObj.available_capacity = updates.capacity;
    if (updates.status !== undefined) updateObj.status = updates.status;

    const { data, error } = await supabase
        .from('trips')
        .update(updateObj)
        .eq('id', tripId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

module.exports = { createTrip, getAllTrips, getMyTrips, matchShipmentsToTrip, updateTrip };
