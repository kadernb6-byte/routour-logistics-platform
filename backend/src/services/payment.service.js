// ============================================
// Payment Service (Supabase)
// ============================================
// Core business logic for the payment & commission system.

const { supabase } = require('../config/db');

const COMMISSION_RATE = 0.10; // 10%

/**
 * Create a payment for a shipment
 */
const createPayment = async (payerId, paymentData) => {
    const { shipment_id, payee_id, amount, payment_method, reference } = paymentData;

    // Validate shipment exists and belongs to the payer
    const { data: shipments } = await supabase
        .from('shipments')
        .select('id, shipper_id, status, budget, title')
        .eq('id', shipment_id)
        .limit(1);

    if (!shipments || shipments.length === 0) {
        const error = new Error('Shipment not found');
        error.statusCode = 404;
        throw error;
    }

    if (shipments[0].shipper_id !== payerId) {
        const error = new Error('Only the shipment owner can initiate payment');
        error.statusCode = 403;
        throw error;
    }

    // Check for duplicate payment
    const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('shipment_id', shipment_id)
        .not('status', 'in', '("failed","refunded")')
        .limit(1);

    if (existing && existing.length > 0) {
        const error = new Error('Payment already exists for this shipment');
        error.statusCode = 409;
        throw error;
    }

    // Validate payee exists
    const { data: payee } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', payee_id)
        .single();

    if (!payee) {
        const error = new Error('Payee (carrier) not found');
        error.statusCode = 404;
        throw error;
    }

    // Calculate commission
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        const error = new Error('Invalid payment amount');
        error.statusCode = 400;
        throw error;
    }

    const commission = Math.round(paymentAmount * COMMISSION_RATE * 100) / 100;
    const netAmount = Math.round((paymentAmount - commission) * 100) / 100;

    // Create payment record
    const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert({
            shipment_id,
            payer_id: payerId,
            payee_id,
            amount: paymentAmount,
            commission_rate: COMMISSION_RATE,
            commission,
            net_amount: netAmount,
            payment_method: payment_method || 'platform',
            reference: reference || null,
            status: 'paid',
            payment_date: new Date().toISOString(),
        })
        .select()
        .single();

    if (payError) throw new Error(payError.message);

    // Log platform revenue
    await supabase
        .from('platform_revenue')
        .insert({
            payment_id: payment.id,
            amount: commission,
            description: `Commission on shipment "${shipments[0].title}" (${COMMISSION_RATE * 100}%)`,
        });

    // Update shipment status to in_transit
    await supabase
        .from('shipments')
        .update({ status: 'in_transit' })
        .eq('id', shipment_id);

    return payment;
};

/**
 * Get payment by ID with full details
 */
const getPaymentById = async (paymentId, userId) => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            shipments(title, origin, destination),
            payer:users!payer_id(email, companies(name)),
            payee:users!payee_id(email, companies(name))
        `)
        .eq('id', paymentId)
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .single();

    if (error || !data) {
        const err = new Error('Payment not found');
        err.statusCode = 404;
        throw err;
    }

    return {
        ...data,
        shipment_title: data.shipments?.title,
        origin: data.shipments?.origin,
        destination: data.shipments?.destination,
        payer_email: data.payer?.email,
        payer_company: data.payer?.companies?.name,
        payee_email: data.payee?.email,
        payee_company: data.payee?.companies?.name,
        shipments: undefined,
        payer: undefined,
        payee: undefined,
    };
};

/**
 * Get all payments for a user (as payer or payee)
 */
const getUserPayments = async (userId, filters = {}) => {
    let query = supabase
        .from('payments')
        .select(`
            *,
            shipments(title, origin, destination),
            payer:users!payer_id(email, companies(name)),
            payee:users!payee_id(email, companies(name))
        `)
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

    if (filters.status) query = query.eq('status', filters.status);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(p => ({
        ...p,
        shipment_title: p.shipments?.title,
        origin: p.shipments?.origin,
        destination: p.shipments?.destination,
        payer_email: p.payer?.email,
        payer_company: p.payer?.companies?.name,
        payee_email: p.payee?.email,
        payee_company: p.payee?.companies?.name,
        shipments: undefined,
        payer: undefined,
        payee: undefined,
    }));
};

/**
 * Confirm/complete a payment
 */
const completePayment = async (paymentId, userId) => {
    const { data: existing } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('payee_id', userId)
        .eq('status', 'paid')
        .single();

    if (!existing) {
        const error = new Error('Payment not found or cannot be completed');
        error.statusCode = 404;
        throw error;
    }

    const { data, error } = await supabase
        .from('payments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', paymentId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Update shipment to delivered
    await supabase
        .from('shipments')
        .update({ status: 'delivered' })
        .eq('id', existing.shipment_id);

    return data;
};

/**
 * Get payment summary/stats for a user
 */
const getPaymentStats = async (userId) => {
    // Get all payments for this user
    const { data: payments, error } = await supabase
        .from('payments')
        .select('payer_id, payee_id, amount, net_amount, status')
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

    if (error) throw new Error(error.message);

    const stats = {
        total_paid: 0,
        total_received: 0,
        total_spent: '0',
        total_earned: '0',
        pending_count: 0,
        active_count: 0,
        completed_count: 0,
    };

    let totalSpent = 0;
    let totalEarned = 0;

    (payments || []).forEach(p => {
        if (p.payer_id === userId) {
            stats.total_paid++;
            if (['paid', 'completed'].includes(p.status)) {
                totalSpent += parseFloat(p.amount) || 0;
            }
        }
        if (p.payee_id === userId) {
            stats.total_received++;
            if (['paid', 'completed'].includes(p.status)) {
                totalEarned += parseFloat(p.net_amount) || 0;
            }
        }
        if (p.status === 'pending') stats.pending_count++;
        if (p.status === 'paid') stats.active_count++;
        if (p.status === 'completed') stats.completed_count++;
    });

    stats.total_spent = totalSpent.toFixed(2);
    stats.total_earned = totalEarned.toFixed(2);

    return stats;
};

/**
 * Get platform revenue stats
 */
const getPlatformRevenue = async () => {
    const { data: revenueData, error: revError } = await supabase
        .from('platform_revenue')
        .select('amount, created_at');

    if (revError) throw new Error(revError.message);

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    let totalRevenue = 0;
    let revenue30d = 0;
    let revenue7d = 0;

    (revenueData || []).forEach(r => {
        const amt = parseFloat(r.amount) || 0;
        totalRevenue += amt;
        const createdAt = new Date(r.created_at);
        if (createdAt >= thirtyDaysAgo) revenue30d += amt;
        if (createdAt >= sevenDaysAgo) revenue7d += amt;
    });

    const { data: recentPayments, error: rpError } = await supabase
        .from('payments')
        .select('*, shipments(title)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (rpError) throw new Error(rpError.message);

    return {
        stats: {
            total_transactions: (revenueData || []).length,
            total_revenue: totalRevenue.toFixed(2),
            revenue_30d: revenue30d.toFixed(2),
            revenue_7d: revenue7d.toFixed(2),
        },
        recentPayments: (recentPayments || []).map(p => ({
            ...p,
            shipment_title: p.shipments?.title,
            shipments: undefined,
        })),
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
