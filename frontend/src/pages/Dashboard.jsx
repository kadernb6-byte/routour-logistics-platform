import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getTrips, getShipments } from '../services/api';
import api from '../services/api';
import {
    Package, Truck, CreditCard, Loader2, AlertCircle,
    RefreshCw, Plus, ArrowRight, DollarSign, Clock,
    Zap, Shield, ArrowUpRight, CheckCircle, TrendingUp,
    MapPin, BarChart3, Activity,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import './Dashboard.css';

// ── Inline Sparkline (tiny SVG chart) ──
function Sparkline({ data, color, width = 80, height = 28 }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((v - min) / range) * (height - 4) - 2;
            return `${x},${y}`;
        })
        .join(' ');
    return (
        <svg width={width} height={height} className="sparkline-svg">
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            <polygon
                fill={`url(#sg-${color.replace('#', '')})`}
                points={`0,${height} ${points} ${width},${height}`}
                opacity="0.5"
            />
        </svg>
    );
}

// ── Mock chart data ──
const monthlyData = [
    { month: 'Sep', expeditions: 12, revenue: 48000 },
    { month: 'Oct', expeditions: 19, revenue: 72000 },
    { month: 'Nov', expeditions: 15, revenue: 58000 },
    { month: 'Dec', expeditions: 25, revenue: 95000 },
    { month: 'Jan', expeditions: 22, revenue: 88000 },
    { month: 'Feb', expeditions: 30, revenue: 115000 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }}>
                    {entry.name}: <strong>{entry.value.toLocaleString()}</strong>
                </p>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const { user } = useAuth();
    const { t } = useLang();
    const navigate = useNavigate();

    const [trips, setTrips] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [paymentStats, setPaymentStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isCarrier = user?.role === 'carrier';

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [tripsRes, shipmentsRes, statsRes] = await Promise.all([
                getTrips(),
                getShipments(),
                api.get('/payments/stats').catch(() => ({ data: null })),
            ]);
            setTrips(tripsRes.data || []);
            setShipments(shipmentsRes.data || []);
            setPaymentStats(statsRes.data || null);
        } catch (err) {
            setError(err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    // ── Sparkline mock data per card ──
    const sparkData = {
        main: [3, 5, 4, 7, 6, 8, 9],
        pending: [6, 4, 5, 3, 4, 2, 3],
        done: [1, 2, 3, 3, 5, 6, 8],
        money: [20, 35, 28, 45, 52, 48, 60],
    };

    // ── Quick Actions ──
    const quickActions = isCarrier
        ? [
            { icon: Plus, label: t('publishTrip'), color: '#dc2626', path: '/trips' },
            { icon: Package, label: t('findShipments'), color: '#f59e0b', path: '/shipments' },
            { icon: CreditCard, label: t('payments'), color: '#10b981', path: '/payments' },
            { icon: Shield, label: t('verification'), color: '#8b5cf6', path: '/verification' },
        ]
        : [
            { icon: Plus, label: t('publishShipment'), color: '#dc2626', path: '/shipments' },
            { icon: Truck, label: t('findCarriers'), color: '#06b6d4', path: '/trips' },
            { icon: CreditCard, label: t('payShipment'), color: '#10b981', path: '/payments' },
            { icon: Shield, label: t('verifyCompany'), color: '#8b5cf6', path: '/verification' },
        ];

    // ── Recent items ──
    const recentItems = [
        ...shipments.slice(0, 3).map(s => ({
            type: 'shipment',
            label: s.title || `${s.origin} → ${s.destination}`,
            status: s.status,
            icon: Package,
            color: '#f59e0b',
        })),
        ...trips.slice(0, 3).map(tr => ({
            type: 'trip',
            label: `${tr.origin} → ${tr.destination}`,
            status: tr.status,
            icon: Truck,
            color: '#dc2626',
        })),
    ].slice(0, 5);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 size={40} className="spinner" />
                <p>{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page animate-fadeIn">
            {/* ══════════════ HERO BANNER ══════════════ */}
            <div className="dashboard-hero">
                <div className="hero-mesh-bg" />
                <div className="hero-content">
                    <div className="hero-text">
                        <span className="hero-greeting">👋 {t('welcomeBack')},</span>
                        <h1 className="hero-name">
                            {user?.companyName || user?.name || 'User'}
                        </h1>
                        <p className="hero-subtitle">
                            {isCarrier ? t('carrierWelcome') : t('shipperWelcome')}
                        </p>
                        <div className="hero-actions">
                            <button
                                className="hero-btn hero-btn-primary"
                                onClick={() => navigate(isCarrier ? '/trips' : '/shipments')}
                            >
                                <Plus size={18} />
                                {isCarrier ? t('publishTrip') : t('publishShipment')}
                            </button>
                        </div>
                    </div>
                    <div className="hero-illustration">
                        {/* Isometric logistics illustration — SVG art */}
                        <svg viewBox="0 0 320 240" className="hero-svg">
                            {/* Road */}
                            <path d="M0 180 Q80 160 160 170 Q240 180 320 160" stroke="rgba(255,255,255,0.08)" strokeWidth="40" fill="none" strokeLinecap="round" />
                            <path d="M0 180 Q80 160 160 170 Q240 180 320 160" stroke="rgba(255,255,255,0.04)" strokeWidth="2" fill="none" strokeDasharray="8 6" strokeLinecap="round" />
                            {/* Truck body */}
                            <rect x="120" y="120" width="80" height="45" rx="6" fill="rgba(220,38,38,0.7)" stroke="rgba(220,38,38,0.9)" strokeWidth="1.5" />
                            <rect x="85" y="130" width="38" height="35" rx="4" fill="rgba(220,38,38,0.5)" stroke="rgba(220,38,38,0.7)" strokeWidth="1" />
                            {/* Windshield */}
                            <rect x="89" y="134" width="28" height="18" rx="3" fill="rgba(100,200,255,0.15)" stroke="rgba(100,200,255,0.3)" strokeWidth="1" />
                            {/* Wheels */}
                            <circle cx="108" cy="168" r="10" fill="#1a1a2e" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                            <circle cx="108" cy="168" r="4" fill="rgba(255,255,255,0.1)" />
                            <circle cx="175" cy="168" r="10" fill="#1a1a2e" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                            <circle cx="175" cy="168" r="4" fill="rgba(255,255,255,0.1)" />
                            {/* Packages on truck */}
                            <rect x="130" y="128" width="18" height="18" rx="2" fill="rgba(245,158,11,0.6)" stroke="rgba(245,158,11,0.8)" strokeWidth="1" />
                            <rect x="152" y="125" width="20" height="21" rx="2" fill="rgba(245,158,11,0.4)" stroke="rgba(245,158,11,0.6)" strokeWidth="1" />
                            <rect x="176" y="130" width="16" height="16" rx="2" fill="rgba(245,158,11,0.5)" stroke="rgba(245,158,11,0.7)" strokeWidth="1" />
                            {/* Network nodes */}
                            <circle cx="60" cy="60" r="6" fill="rgba(6,182,212,0.4)" stroke="rgba(6,182,212,0.7)" strokeWidth="1.5" />
                            <circle cx="160" cy="40" r="8" fill="rgba(220,38,38,0.4)" stroke="rgba(220,38,38,0.7)" strokeWidth="1.5" />
                            <circle cx="260" cy="55" r="5" fill="rgba(16,185,129,0.4)" stroke="rgba(16,185,129,0.7)" strokeWidth="1.5" />
                            <circle cx="220" cy="85" r="6" fill="rgba(139,92,246,0.4)" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5" />
                            {/* Network lines */}
                            <line x1="60" y1="60" x2="160" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 3" />
                            <line x1="160" y1="40" x2="260" y2="55" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 3" />
                            <line x1="160" y1="40" x2="220" y2="85" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 3" />
                            <line x1="220" y1="85" x2="260" y2="55" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 3" />
                            {/* Location pin */}
                            <g transform="translate(160,20)">
                                <path d="M0-8 C4-8 8-4 8 0 C8 5 0 14 0 14 C0 14 -8 5 -8 0 C-8-4 -4-8 0-8Z" fill="rgba(220,38,38,0.6)" stroke="rgba(220,38,38,0.9)" strokeWidth="1" />
                                <circle cx="0" cy="-1" r="3" fill="rgba(255,255,255,0.3)" />
                            </g>
                            {/* Animated pulse rings */}
                            <circle cx="60" cy="60" r="12" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" className="pulse-ring" />
                            <circle cx="260" cy="55" r="10" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1" className="pulse-ring" style={{ animationDelay: '1s' }} />
                        </svg>
                    </div>
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* ══════════════ STAT CARDS WITH SPARKLINES ══════════════ */}
            <div className="stats-grid">
                <div className="stat-card stat-card-red">
                    <div className="stat-card-glow" style={{ '--glow-color': '220,38,38' }} />
                    <div className="stat-top">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(220, 38, 38, 0.12)', color: '#ef4444' }}>
                            {isCarrier ? <Truck size={22} /> : <Package size={22} />}
                        </div>
                        <Sparkline data={sparkData.main} color="#ef4444" />
                    </div>
                    <div className="stat-value">{isCarrier ? trips.length : shipments.length}</div>
                    <div className="stat-label">{isCarrier ? t('myTrips') : t('myShipments')}</div>
                    <div className="stat-trend up"><TrendingUp size={12} /> +12%</div>
                </div>

                <div className="stat-card stat-card-amber">
                    <div className="stat-card-glow" style={{ '--glow-color': '245,158,11' }} />
                    <div className="stat-top">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                            <RefreshCw size={22} />
                        </div>
                        <Sparkline data={sparkData.pending} color="#f59e0b" />
                    </div>
                    <div className="stat-value">
                        {isCarrier
                            ? trips.filter(t => t.status === 'active').length
                            : shipments.filter(s => s.status === 'pending').length}
                    </div>
                    <div className="stat-label">{isCarrier ? t('activeRoutes') : t('pending')}</div>
                    <div className="stat-trend down"><Activity size={12} /> -5%</div>
                </div>

                <div className="stat-card stat-card-green">
                    <div className="stat-card-glow" style={{ '--glow-color': '16,185,129' }} />
                    <div className="stat-top">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                            <CheckCircle size={22} />
                        </div>
                        <Sparkline data={sparkData.done} color="#10b981" />
                    </div>
                    <div className="stat-value">
                        {isCarrier
                            ? trips.filter(t => t.status === 'completed').length
                            : shipments.filter(s => s.status === 'delivered').length}
                    </div>
                    <div className="stat-label">{t('statusCompleted')}</div>
                    <div className="stat-trend up"><TrendingUp size={12} /> +28%</div>
                </div>

                <div className="stat-card stat-card-cyan">
                    <div className="stat-card-glow" style={{ '--glow-color': '6,182,212' }} />
                    <div className="stat-top">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                            <DollarSign size={22} />
                        </div>
                        <Sparkline data={sparkData.money} color="#06b6d4" />
                    </div>
                    <div className="stat-value">
                        {paymentStats ? paymentStats.total_amount : '0'} <span className="stat-currency">DA</span>
                    </div>
                    <div className="stat-label">{isCarrier ? t('totalEarned') : t('totalSpent')}</div>
                    <div className="stat-trend up"><TrendingUp size={12} /> +18%</div>
                </div>
            </div>

            {/* ══════════════ CHARTS SECTION ══════════════ */}
            <div className="charts-section">
                <div className="chart-card chart-card-main">
                    <div className="chart-header">
                        <div>
                            <h3><BarChart3 size={18} /> Expéditions — 6 derniers mois</h3>
                            <p className="chart-subtitle">Aperçu de vos expéditions mensuelles</p>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradExpeditions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="expeditions" name="Expéditions" stroke="#dc2626" strokeWidth={2.5} fill="url(#gradExpeditions)" dot={{ r: 4, fill: '#dc2626', stroke: '#1a1a2e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ef4444' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card chart-card-side">
                    <div className="chart-header">
                        <div>
                            <h3><DollarSign size={18} /> Revenus (DA)</h3>
                            <p className="chart-subtitle">Tendance mensuelle</p>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="Revenus" fill="url(#gradRevenue)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ══════════════ QUICK ACTIONS ══════════════ */}
            <div className="dashboard-quick-actions">
                <h2 className="section-title">
                    <Zap size={20} /> {t('quickActions')}
                </h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            className="quick-action-card"
                            onClick={() => navigate(action.path)}
                        >
                            <div
                                className="quick-action-icon"
                                style={{ background: `${action.color}15`, color: action.color }}
                            >
                                <action.icon size={24} />
                            </div>
                            <span className="quick-action-label">{action.label}</span>
                            <ArrowRight size={16} className="quick-action-arrow" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ══════════════ RECENT ACTIVITY ══════════════ */}
            {recentItems.length > 0 && (
                <div className="dashboard-recent">
                    <h2 className="section-title">
                        <Clock size={20} /> {t('recentActivity')}
                    </h2>
                    <div className="recent-list glass-card">
                        {recentItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="recent-item">
                                    <div className="recent-icon" style={{ background: `${item.color}15`, color: item.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="recent-label">{item.label}</span>
                                    <span className={`status-badge status-${item.status}`}>
                                        {item.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
