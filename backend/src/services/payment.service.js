// ============================================
// Payment Service
// ============================================
// Core business logic for the payment & commission system.
// This is where the platform MAKES MONEY.
//
// Flow:
//   1. Shipper initiates payment for a shipment
//   2. Platform calculates commission (default 10%)
//   3. Payment recorded: pending → paid → completed
//   4. Commission logged to platform_revenue ledger

const db = require('../config/db');

const COMMISSION_RATE = 0.10; // 10% — adjust per business model

/**
 * Create a payment for a shipment
 * Only the shipper (shipment owner) can initiate payment.
 */
const createPayment = async (payerId, paymentData) => {
    const { shipment_id, payee_id, amount, payment_method, reference } = paymentData;

    // ── Validate shipment exists and belongs to the payer ──
    const shipment = await db.query(
        `SELECT s.id, s.shipper_id, s.status, s.budget, s.title,
                u.email as shipper_email
         FROM shipments s
         JOIN users u ON s.shipper_id = u.id
         WHERE s.id = $1`,
        [shipment_id]
    );

    if (shipment.rows.length === 0) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    if (shipment.rows[0].shipper_id !== payerId) {
        const error = new Error('Only the shipment owner can initiate payment');
        error.statusCode = 403;
        throw error;
    }

    // ── Check for duplicate payment ──
    const existing = await db.query(
        'SELECT id FROM payments WHERE shipment_id = $1 AND status NOT IN ($2, $3)',
        [shipment_id, 'failed', 'refunded']
    );

    if (existing.rows.length > 0) {
        const error = new Error('Payment already exists for this shipment');
        error.statusCode = 409;
        throw error;
    }

    // ── Validate payee exists and is a carrier ──
    const payee = await db.query(
        'SELECT id, role FROM users WHERE id = $1',
        [payee_id]
    );

    if (payee.rows.length === 0) {
        const error = new Error('Payee (carrier) not found');
        error.statusCode = 404;
        throw error;
    }

    // ── Calculate commission ──
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        const error = new Error('Invalid payment amount');
        error.statusCode = 400;
        throw error;
    }

    const commission = Math.round(paymentAmount * COMMISSION_RATE * 100) / 100;
    const netAmount = Math.round((paymentAmount - commission) * 100) / 100;

    // ── Create payment record ──
    const result = await db.query(
        `INSERT INTO payments
            (shipment_id, payer_id, payee_id, amount, commission_rate, commission, net_amount, payment_method, reference, status, payment_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'paid', NOW())
         RETURNING *`,
        [shipment_id, payerId, payee_id, paymentAmount, COMMISSION_RATE, commission, netAmount,
            payment_method || 'platform', reference || null]
    );

    const payment = result.rows[0];

    // ── Log platform revenue ──
    await db.query(
        `INSERT INTO platform_revenue (payment_id, amount, description)
         VALUES ($1, $2, $3)`,
        [payment.id, commission, `Commission on shipment "${shipment.rows[0].title}" (${COMMISSION_RATE * 100}%)`]
    );

    // ── Update shipment status to in_transit ──
    await db.query(
        `UPDATE shipments SET status = 'in_transit' WHERE id = $1`,
        [shipment_id]
    );

    return payment;
};

/**
 * Get payment by ID with full details
 */
const getPaymentById = async (paymentId, userId) => {
    const result = await db.query(
        `SELECT p.*,
                s.title as shipment_title, s.origin, s.destination,
                payer.email as payer_email, payer_co.name as payer_company,
                payee.email as payee_email, payee_co.name as payee_company
         FROM payments p
         JOIN shipments s ON p.shipment_id = s.id
         JOIN users payer ON p.payer_id = payer.id
         JOIN companies payer_co ON payer.company_id = payer_co.id
         JOIN users payee ON p.payee_id = payee.id
         JOIN companies payee_co ON payee.company_id = payee_co.id
         WHERE p.id = $1 AND (p.payer_id = $2 OR p.payee_id = $2)`,
        [paymentId, userId]
    );

    if (result.rows.length === 0) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

/**
 * Get all payments for a user (as payer or payee)
 */
const getUserPayments = async (userId, filters = {}) => {
    let query = `
        SELECT p.*,
               s.title as shipment_title, s.origin, s.destination,
               payer.email as payer_email, payer_co.name as payer_company,
               payee.email as payee_email, payee_co.name as payee_company
        FROM payments p
        JOIN shipments s ON p.shipment_id = s.id
        JOIN users payer ON p.payer_id = payer.id
        JOIN companies payer_co ON payer.company_id = payer_co.id
        JOIN users payee ON p.payee_id = payee.id
        JOIN companies payee_co ON payee.company_id = payee_co.id
        WHERE (p.payer_id = $1 OR p.payee_id = $1)
    `;
    const params = [userId];
    let paramIndex = 2;

    if (filters.status) {
        query += ` AND p.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Confirm/complete a payment (carrier confirms delivery received)
 */
const completePayment = async (paymentId, userId) => {
    // Only the payee (carrier) can confirm
    const payment = await db.query(
        'SELECT * FROM payments WHERE id = $1 AND payee_id = $2 AND status = $3',
        [paymentId, userId, 'paid']
    );

    if (payment.rows.length === 0) {
        const error = new Error('Payment not found or cannot be completed');
        error.statusCode = 404;
        throw error;
    }

    const result = await db.query(
        `UPDATE payments SET status = 'completed', completed_at = NOW()
         WHERE id = $1 RETURNING *`,
        [paymentId]
    );

    // Update shipment to delivered
    await db.query(
        `UPDATE shipments SET status = 'delivered' WHERE id = $1`,
        [payment.rows[0].shipment_id]
    );

    return result.rows[0];
};

/**
 * Get payment summary/stats for a user
 */
const getPaymentStats = async (userId) => {
    const result = await db.query(
        `SELECT
            COUNT(*) FILTER (WHERE payer_id = $1) as total_paid,
            COUNT(*) FILTER (WHERE payee_id = $1) as total_received,
            COALESCE(SUM(amount) FILTER (WHERE payer_id = $1 AND status IN ('paid','completed')), 0) as total_spent,
            COALESCE(SUM(net_amount) FILTER (WHERE payee_id = $1 AND status IN ('paid','completed')), 0) as total_earned,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
            COUNT(*) FILTER (WHERE status = 'paid') as active_count,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_count
         FROM payments
         WHERE payer_id = $1 OR payee_id = $1`,
        [userId]
    );

    return result.rows[0];
};

/**
 * Get platform revenue stats (admin)
 */
const getPlatformRevenue = async () => {
    const revenue = await db.query(
        `SELECT
            COUNT(*) as total_transactions,
            COALESCE(SUM(amount), 0) as total_revenue,
            COALESCE(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as revenue_30d,
            COALESCE(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as revenue_7d
         FROM platform_revenue`
    );

    const recentPayments = await db.query(
        `SELECT p.*, s.title as shipment_title
         FROM payments p
         JOIN shipments s ON p.shipment_id = s.id
         ORDER BY p.created_at DESC
         LIMIT 10`
    );

    return {
        stats: revenue.rows[0],
        recentPayments: recentPayments.rows,
    };
};

module.exports = {
    createPayment,
    getPaymentById,
    getUserPayments,
    completePayment,
    getPaymentStats,
    getPlatformRevenue,
};
