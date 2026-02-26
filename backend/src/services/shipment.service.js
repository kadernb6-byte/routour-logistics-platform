// ============================================
// Shipment Service
// ============================================
// Business logic for shipment operations.
// Shippers create shipments; carriers can browse and bid.

const db = require('../config/db');

/**
 * Create a new shipment (shipper only)
 */
const createShipment = async (shipmentData, userId) => {
    const { title, description, origin, destination, weight, dimensions, pickupDate, deliveryDate, budget } = shipmentData;

    const result = await db.query(
        `INSERT INTO shipments (title, description, origin, destination, weight, dimensions, pickup_date, delivery_date, budget, shipper_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
     RETURNING *`,
        [title, description, origin, destination, weight, dimensions, pickupDate, deliveryDate, budget, userId]
    );

    return result.rows[0];
};

/**
 * Get all shipments with optional filters
 */
const getShipments = async ({ page = 1, limit = 10, status, origin, destination }) => {
    let queryText = 'SELECT s.*, c.name as company_name FROM shipments s JOIN users u ON s.shipper_id = u.id JOIN companies c ON u.company_id = c.id';
    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (status) {
        paramCount++;
        conditions.push(`s.status = $${paramCount}`);
        values.push(status);
    }

    if (origin) {
        paramCount++;
        conditions.push(`LOWER(s.origin) LIKE LOWER($${paramCount})`);
        values.push(`%${origin}%`);
    }

    if (destination) {
        paramCount++;
        conditions.push(`LOWER(s.destination) LIKE LOWER($${paramCount})`);
        values.push(`%${destination}%`);
    }

    if (conditions.length > 0) {
        queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Get total count
    const countResult = await db.query(
        `SELECT COUNT(*) FROM (${queryText}) as filtered`,
        values
    );
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    queryText += ` ORDER BY s.created_at DESC LIMIT $${paramCount}`;
    values.push(limit);
    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    values.push(offset);

    const result = await db.query(queryText, values);

    return { shipments: result.rows, total };
};

/**
 * Get a single shipment by ID
 */
const getShipmentById = async (id) => {
    const result = await db.query(
        `SELECT s.*, c.name as company_name
     FROM shipments s
     JOIN users u ON s.shipper_id = u.id
     JOIN companies c ON u.company_id = c.id
     WHERE s.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

/**
 * Update a shipment (only by the shipper who created it)
 */
const updateShipment = async (id, updateData, userId) => {
    // Verify ownership
    const existing = await db.query(
        'SELECT shipper_id FROM shipments WHERE id = $1',
        [id]
    );

    if (existing.rows.length === 0) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    if (existing.rows[0].shipper_id !== userId) {
        const error = new Error('Not authorized to update this shipment');
        error.statusCode = 403;
        throw error;
    }

    const { title, description, origin, destination, weight, dimensions, pickupDate, deliveryDate, budget, status } = updateData;

    const result = await db.query(
        `UPDATE shipments
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         origin = COALESCE($3, origin),
         destination = COALESCE($4, destination),
         weight = COALESCE($5, weight),
         dimensions = COALESCE($6, dimensions),
         pickup_date = COALESCE($7, pickup_date),
         delivery_date = COALESCE($8, delivery_date),
         budget = COALESCE($9, budget),
         status = COALESCE($10, status),
         updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
        [title, description, origin, destination, weight, dimensions, pickupDate, deliveryDate, budget, status, id]
    );

    return result.rows[0];
};

/**
 * Delete a shipment
 */
const deleteShipment = async (id, userId) => {
    const existing = await db.query(
        'SELECT shipper_id FROM shipments WHERE id = $1',
        [id]
    );

    if (existing.rows.length === 0) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    if (existing.rows[0].shipper_id !== userId) {
        const error = new Error('Not authorized to delete this shipment');
        error.statusCode = 403;
        throw error;
    }

    await db.query('DELETE FROM shipments WHERE id = $1', [id]);
    return { message: 'Shipment deleted successfully' };
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
};
