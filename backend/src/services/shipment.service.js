// ============================================
// Shipment Service (Supabase)
// ============================================
// Business logic for shipment operations.

const { supabase } = require('../config/db');

/**
 * Create a new shipment (shipper only)
 */
const createShipment = async (shipmentData, userId) => {
    const { title, description, origin, destination, weight, dimensions, pickupDate, deliveryDate, budget } = shipmentData;

    const { data, error } = await supabase
        .from('shipments')
        .insert({
            title,
            description,
            origin,
            destination,
            weight,
            dimensions,
            pickup_date: pickupDate,
            delivery_date: deliveryDate,
            budget,
            shipper_id: userId,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Get all shipments with optional filters
 */
const getShipments = async ({ page = 1, limit = 10, status, origin, destination }) => {
    let query = supabase
        .from('shipments')
        .select('*, users!shipper_id(company_id, companies(name))', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (origin) query = query.ilike('origin', `%${origin}%`);
    if (destination) query = query.ilike('destination', `%${destination}%`);

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    // Flatten company_name from nested relation
    const shipments = (data || []).map(s => ({
        ...s,
        company_name: s.users?.companies?.name || '',
        users: undefined,
    }));

    return { shipments, total: count || 0 };
};

/**
 * Get a single shipment by ID
 */
const getShipmentById = async (id) => {
    const { data, error } = await supabase
        .from('shipments')
        .select('*, users!shipper_id(company_id, companies(name))')
        .eq('id', id)
        .single();

    if (error || !data) {
        const err = new Error('Shipment not found');
        err.statusCode = 404;
        throw err;
    }

    return {
        ...data,
        company_name: data.users?.companies?.name || '',
        users: undefined,
    };
};

/**
 * Update a shipment (only by the shipper who created it)
 */
const updateShipment = async (id, updateData, userId) => {
    // Verify ownership
    const { data: existing } = await supabase
        .from('shipments')
        .select('shipper_id')
        .eq('id', id)
        .single();

    if (!existing) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    if (existing.shipper_id !== userId) {
        const error = new Error('Not authorized to update this shipment');
        error.statusCode = 403;
        throw error;
    }

    const { title, description, origin, destination, weight, dimensions, pickupDate, deliveryDate, budget, status } = updateData;

    // Build update object with only provided fields
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (origin !== undefined) updates.origin = origin;
    if (destination !== undefined) updates.destination = destination;
    if (weight !== undefined) updates.weight = weight;
    if (dimensions !== undefined) updates.dimensions = dimensions;
    if (pickupDate !== undefined) updates.pickup_date = pickupDate;
    if (deliveryDate !== undefined) updates.delivery_date = deliveryDate;
    if (budget !== undefined) updates.budget = budget;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Delete a shipment
 */
const deleteShipment = async (id, userId) => {
    const { data: existing } = await supabase
        .from('shipments')
        .select('shipper_id')
        .eq('id', id)
        .single();

    if (!existing) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    if (existing.shipper_id !== userId) {
        const error = new Error('Not authorized to delete this shipment');
        error.statusCode = 403;
        throw error;
    }

    const { error } = await supabase.from('shipments').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return { message: 'Shipment deleted successfully' };
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
};
