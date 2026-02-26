// ============================================
// Trip Service
// ============================================
// Business logic for carrier trips.
// A trip = a carrier publishing "I'm going from A to B with X capacity."

const db = require('../config/db');

/**
 * Create a new trip (carrier only)
 */
const createTrip = async (carrierId, tripData) => {
    const { origin, destination, departure_date, capacity, price_per_kg, vehicle_type, notes } = tripData;

    const result = await db.query(
        `INSERT INTO trips (carrier_id, origin, destination, departure_date, available_capacity, price_per_kg, vehicle_type, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [carrierId, origin, destination, departure_date, capacity, price_per_kg || null, vehicle_type || null, notes || null]
    );

    return result.rows[0];
};

/**
 * Get all active trips with optional filters
 */
const getAllTrips = async (filters = {}) => {
    let query = `
        SELECT t.*, u.first_name, u.last_name, u.email,
               c.name as company_name
        FROM trips t
        JOIN users u ON t.carrier_id = u.id
        JOIN companies c ON u.company_id = c.id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by origin
    if (filters.origin) {
        query += ` AND LOWER(t.origin) LIKE LOWER($${paramIndex})`;
        params.push(`%${filters.origin}%`);
        paramIndex++;
    }

    // Filter by destination
    if (filters.destination) {
        query += ` AND LOWER(t.destination) LIKE LOWER($${paramIndex})`;
        params.push(`%${filters.destination}%`);
        paramIndex++;
    }

    // Filter by status (default: active only)
    if (filters.status) {
        query += ` AND t.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
    } else {
        query += ` AND t.status = 'active'`;
    }

    query += ' ORDER BY t.departure_date ASC';

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Get trips by carrier
 */
const getMyTrips = async (carrierId) => {
    const result = await db.query(
        `SELECT * FROM trips WHERE carrier_id = $1 ORDER BY created_at DESC`,
        [carrierId]
    );
    return result.rows;
};

/**
 * Match shipments to a trip (MVP matching logic)
 * Finds shipments with the same origin → destination route
 */
const matchShipmentsToTrip = async (tripId) => {
    // Get the trip details
    const tripResult = await db.query(
        'SELECT * FROM trips WHERE id = $1',
        [tripId]
    );

    if (tripResult.rows.length === 0) {
        const error = new Error('Trip not found');
        error.statusCode = 404;
        throw error;
    }

    const trip = tripResult.rows[0];

    // Find matching shipments: same origin + destination, pending status, weight fits capacity
    const matches = await db.query(
        `SELECT s.*, u.first_name, u.last_name, u.email,
                c.name as company_name
         FROM shipments s
         JOIN users u ON s.shipper_id = u.id
         JOIN companies c ON u.company_id = c.id
         WHERE LOWER(s.origin) = LOWER($1)
           AND LOWER(s.destination) = LOWER($2)
           AND s.status = 'pending'
           AND (s.weight IS NULL OR s.weight <= $3)
         ORDER BY s.created_at DESC`,
        [trip.origin, trip.destination, trip.available_capacity]
    );

    return {
        trip,
        matchCount: matches.rows.length,
        matches: matches.rows,
    };
};

/**
 * Update a trip (carrier only, own trips)
 */
const updateTrip = async (tripId, carrierId, updates) => {
    // Verify ownership
    const existing = await db.query(
        'SELECT id FROM trips WHERE id = $1 AND carrier_id = $2',
        [tripId, carrierId]
    );

    if (existing.rows.length === 0) {
        const error = new Error('Trip not found or not authorized');
        error.statusCode = 404;
        throw error;
    }

    const result = await db.query(
        `UPDATE trips SET
            origin = COALESCE($1, origin),
            destination = COALESCE($2, destination),
            departure_date = COALESCE($3, departure_date),
            available_capacity = COALESCE($4, available_capacity),
            status = COALESCE($5, status)
         WHERE id = $6
         RETURNING *`,
        [updates.origin, updates.destination, updates.departure_date, updates.capacity, updates.status, tripId]
    );

    return result.rows[0];
};

module.exports = { createTrip, getAllTrips, getMyTrips, matchShipmentsToTrip, updateTrip };
