import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    DollarSign, ArrowUpRight, ArrowDownLeft, CheckCircle,
    Clock, Loader2, AlertCircle, TrendingUp, CreditCard,
    Receipt, Banknote,
} from 'lucide-react';
import './Payments.css';

export default function Payments() {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [completing, setCompleting] = useState(null);
    const [filter, setFilter] = useState('all');

    const isCarrier = user?.role === 'carrier';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, statsRes] = await Promise.all([
                api.get('/payments'),
                api.get('/payments/stats'),
            ]);
            setPayments(paymentsRes.data || []);
            setStats(statsRes.data || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (paymentId) => {
        setCompleting(paymentId);
        setError(null);
        try {
            await api.put(`/payments/${paymentId}/complete`);
            setSuccessMsg('Payment completed — delivery confirmed!');
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setCompleting(null);
        }
    };

    const filteredPayments = filter === 'all'
        ? payments
        : payments.filter(p => p.status === filter);

    const formatAmount = (val) => {
        return Number(val).toLocaleString('fr-DZ') + ' DZD';
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 size={40} className="spinner" />
                <p>Loading payments...</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1><CreditCard size={24} /> Payments</h1>
                    <p>{isCarrier ? 'Track your earnings and incoming payments' : 'Manage your shipment payments'}</p>
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    <AlertCircle size={18} /> <span>{error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}
            {successMsg && (
                <div className="verification-success">
                    <CheckCircle size={18} /> <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg(null)}>✕</button>
                </div>
            )}

            {/* Financial Stats */}
            {stats && (
                <div className="payment-stats-grid">
                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                            {isCarrier ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">
                                {formatAmount(isCarrier ? stats.total_earned : stats.total_spent)}
                            </span>
                            <span className="payment-stat-label">
                                {isCarrier ? 'Total Earned' : 'Total Spent'}
                            </span>
                        </div>
                    </div>

                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
                            <Receipt size={22} />
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">
                                {Number(stats.total_paid || 0) + Number(stats.total_received || 0)}
                            </span>
                            <span className="payment-stat-label">Total Transactions</span>
                        </div>
                    </div>

                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                            <Clock size={22} />
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">{stats.active_count || 0}</span>
                            <span className="payment-stat-label">In Progress</span>
                        </div>
                    </div>

                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                            <CheckCircle size={22} />
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">{stats.completed_count || 0}</span>
                            <span className="payment-stat-label">Completed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="payment-filters">
                {['all', 'pending', 'paid', 'completed', 'refunded'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f !== 'all' && (
                            <span className="filter-count">
                                {payments.filter(p => p.status === f).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Payments List */}
            {filteredPayments.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-state-icon">💰</div>
                    <h3>No payments yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isCarrier
                            ? 'When shippers pay for your deliveries, they\'ll appear here.'
                            : 'Pay for shipments to see your transaction history.'}
                    </p>
                </div>
            ) : (
                <div className="payments-list">
                    {filteredPayments.map(payment => (
                        <div key={payment.id} className={`payment-row glass-card payment-${payment.status}`}>
                            <div className="payment-row-left">
                                <div className={`payment-direction ${isCarrier ? 'incoming' : 'outgoing'}`}>
                                    {isCarrier
                                        ? <ArrowDownLeft size={20} />
                                        : <ArrowUpRight size={20} />}
                                </div>
                                <div className="payment-row-info">
                                    <div className="payment-row-title">
                                        {payment.shipment_title || 'Shipment Payment'}
                                    </div>
                                    <div className="payment-row-route">
                                        {payment.origin} → {payment.destination}
                                    </div>
                                    <div className="payment-row-meta">
                                        {isCarrier ? payment.payer_company : payment.payee_company}
                                        {' · '}
                                        {new Date(payment.created_at).toLocaleDateString('en-DZ', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="payment-row-right">
                                <div className="payment-row-amounts">
                                    <div className="payment-row-amount">
                                        {isCarrier ? formatAmount(payment.net_amount) : formatAmount(payment.amount)}
                                    </div>
                                    {!isCarrier && (
                                        <div className="payment-row-commission">
                                            Commission: {formatAmount(payment.commission)}
                                        </div>
                                    )}
                                    {isCarrier && (
                                        <div className="payment-row-commission">
                                            Total: {formatAmount(payment.amount)} (−{formatAmount(payment.commission)} fee)
                                        </div>
                                    )}
                                </div>

                                <div className="payment-row-actions">
                                    <span className={`status-badge status-${payment.status}`}>
                                        {payment.status}
                                    </span>
                                    {isCarrier && payment.status === 'paid' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleComplete(payment.id)}
                                            disabled={completing === payment.id}
                                        >
                                            {completing === payment.id
                                                ? <Loader2 size={14} className="spinner" />
                                                : <CheckCircle size={14} />}
                                            Confirm Delivery
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
