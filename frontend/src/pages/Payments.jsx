import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../services/supabaseClient';
import {
    DollarSign, ArrowUpRight, ArrowDownLeft, CheckCircle,
    Clock, Loader2, AlertCircle, CreditCard,
    Receipt,
} from 'lucide-react';
import './Payments.css';

export default function Payments() {
    const { user } = useAuth();
    const { t } = useLang();
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
            // In a real app, we'd join with shipments table to get more info
            // For now, let's fetch payments related to the user's company
            let query = supabase
                .from('payments')
                .select('*, sender:companies!sender_company_id(name), receiver:companies!receiver_company_id(name)');
            
            if (isCarrier) {
                query = query.eq('receiver_company_id', user.companyId);
            } else {
                query = query.eq('sender_company_id', user.companyId);
            }

            const { data, error: payError } = await query.order('created_at', { ascending: false });
            if (payError) throw payError;
            
            setPayments(data || []);
            
            // Calculate stats
            const totalEarned = data.filter(p => p.receiver_company_id === user.companyId && (p.status === 'paid' || p.status === 'completed'))
                                    .reduce((sum, p) => sum + (Number(p.amount) - Number(p.commission || 0)), 0);
            const totalSpent = data.filter(p => p.sender_company_id === user.companyId)
                                   .reduce((sum, p) => sum + Number(p.amount), 0);
            const activeCount = data.filter(p => p.status === 'pending' || p.status === 'paid').length;
            const completedCount = data.filter(p => p.status === 'completed').length;

            setStats({
                total_earned: totalEarned,
                total_spent: totalSpent,
                active_count: activeCount,
                completed_count: completedCount,
                total_transactions: data.length
            });
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
            const { error } = await supabase
                .from('payments')
                .update({ status: 'completed' })
                .eq('id', paymentId);
            
            if (error) throw error;
            setSuccessMsg(t('paymentCompletedMsg'));
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
                <p>{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1><CreditCard size={24} /> {t('payments')}</h1>
                    <p>{isCarrier ? t('carrierPaymentsDesc') : t('shipperPaymentsDesc')}</p>
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
                                {isCarrier ? t('totalEarned') : t('totalSpent')}
                            </span>
                        </div>
                    </div>

                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
                            <Receipt size={22} />
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">
                                {stats.total_transactions}
                            </span>
                            <span className="payment-stat-label">{t('totalTransactions')}</span>
                        </div>
                    </div>

                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                            <Clock size={22} />
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">{stats.active_count || 0}</span>
                            <span className="payment-stat-label">{t('inProgress')}</span>
                        </div>
                    </div>

                    <div className="payment-stat-card glass-card">
                        <div className="payment-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                            <CheckCircle size={22} />
                        </div>
                        <div className="payment-stat-info">
                            <span className="payment-stat-value">{stats.completed_count || 0}</span>
                            <span className="payment-stat-label">{t('statusCompleted')}</span>
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
                        {f === 'all' ? t('all') : t(f)}
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
                    <h3>{t('noPaymentsYet')}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isCarrier
                            ? t('noPaymentsCarrier')
                            : t('noPaymentsShipper')}
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
                                        {payment.description || t('shipmentPayment')}
                                    </div>
                                    <div className="payment-row-meta">
                                        {isCarrier ? payment.sender?.name : payment.receiver?.name}
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
                                        {formatAmount(payment.amount)}
                                    </div>
                                    {isCarrier && (
                                        <div className="payment-row-commission">
                                            {t('fee')}: -{formatAmount(payment.commission || 0)}
                                        </div>
                                    )}
                                </div>

                                <div className="payment-row-actions">
                                    <span className={`status-badge status-${payment.status}`}>
                                        {t(payment.status)}
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
                                            {t('confirmDelivery')}
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
