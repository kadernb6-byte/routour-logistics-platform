import { useState, useEffect } from 'react';
import {
    Package, Plus, Search, Filter, MapPin, Calendar,
    Weight, DollarSign, X, Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../services/supabaseClient';

const Shipments = () => {
    const { user } = useAuth();
    const { t } = useLang();
    const isShipper = user?.role === 'shipper';

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', origin: '', destination: '',
        weight: '', dimensions: '', pickup_date: '', delivery_date: '',
        budget: '',
    });

    // Fetch shipments from Supabase
    const fetchShipments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('shipments')
                .select('*, users!shipper_id(email, companies(name))')
                .order('created_at', { ascending: false });

            // Shippers see only their own; carriers see all
            if (isShipper && user?.id) {
                query = query.eq('shipper_id', user.id);
            }

            const { data, error } = await query;
            if (error) throw error;
            setShipments(data || []);
        } catch (err) {
            console.error('Failed to load shipments:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchShipments(); }, [user]);

    // Create a new shipment
    const handleCreateShipment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('shipments')
                .insert({
                    title: formData.title,
                    description: formData.description || null,
                    origin: formData.origin,
                    destination: formData.destination,
                    weight: formData.weight ? parseFloat(formData.weight) : null,
                    dimensions: formData.dimensions || null,
                    pickup_date: formData.pickup_date || null,
                    delivery_date: formData.delivery_date || null,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
                    status: 'pending',
                    shipper_id: user.id,
                });

            if (error) throw error;

            setShowForm(false);
            setFormData({ title: '', description: '', origin: '', destination: '', weight: '', dimensions: '', pickup_date: '', delivery_date: '', budget: '' });
            fetchShipments();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter
    const filteredShipments = shipments.filter((s) => {
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        const matchesSearch =
            !searchQuery ||
            s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.destination?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusLabel = (status) => ({
        pending: t('statusPending'),
        in_transit: t('statusInTransit'),
        delivered: t('statusDelivered'),
        cancelled: t('statusCancelled'),
    }[status] || status);

    const formatCurrency = (amount) => {
        if (!amount) return '—';
        return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount);
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>📦 {t('shipments')}</h1>
                    <p>{isShipper ? t('shipperShipmentsDesc') : t('carrierShipmentsDesc')}</p>
                </div>
                {isShipper && (
                    <button className="btn btn-primary" id="create-shipment" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> {t('newShipment')}
                    </button>
                )}
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h2>{t('newShipment')}</h2>
                            <button className="btn btn-ghost" onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateShipment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div>
                                <label className="form-label">{t('shipmentTitle')} *</label>
                                <input className="form-input" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t('shipmentTitlePlaceholder')} />
                            </div>
                            <div>
                                <label className="form-label">{t('description')}</label>
                                <textarea className="form-input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('descriptionPlaceholder')} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label className="form-label">{t('origin')} *</label>
                                    <input className="form-input" required value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} placeholder={t('originPlaceholder')} />
                                </div>
                                <div>
                                    <label className="form-label">{t('destination')} *</label>
                                    <input className="form-input" required value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder={t('destinationPlaceholder')} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label className="form-label">{t('weightKg')}</label>
                                    <input className="form-input" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0" />
                                </div>
                                <div>
                                    <label className="form-label">{t('dimensions')}</label>
                                    <input className="form-input" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} placeholder="120x80x100 cm" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label className="form-label">{t('pickupDate')}</label>
                                    <input className="form-input" type="date" value={formData.pickup_date} onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">{t('deliveryDate')}</label>
                                    <input className="form-input" type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">{t('budgetDZD')}</label>
                                <input className="form-input" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0" />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <><Loader size={16} className="spin" /> {t('loading')}</> : <><Plus size={16} /> {t('create')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="glass-card" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input type="text" className="form-input" placeholder={t('searchShipments')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="shipment-search" style={{ background: 'transparent', border: 'none', padding: '8px' }} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                    <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                    {['all', 'pending', 'in_transit', 'delivered'].map((status) => (
                        <button key={status} className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStatus(status)}>
                            {status === 'all' ? t('all') : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                    <Loader size={24} className="spin" style={{ color: 'var(--color-primary)' }} />
                    <p style={{ marginTop: 'var(--space-sm)' }}>{t('loading')}</p>
                </div>
            )}

            {/* Shipment Grid */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-lg)' }}>
                    {filteredShipments.map((shipment, index) => (
                        <div key={shipment.id} className={`glass-card animate-fadeInUp stagger-${index + 1}`} style={{ cursor: 'pointer' }}>
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '4px' }}>
                                        {shipment.users?.companies?.name || t('noData')}
                                    </div>
                                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, lineHeight: 1.3 }}>
                                        {shipment.title}
                                    </h3>
                                </div>
                                <span className={`badge badge-${shipment.status}`}>{getStatusLabel(shipment.status)}</span>
                            </div>

                            {/* Route */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)' }}>
                                <MapPin size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{shipment.origin}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>→</span>
                                <MapPin size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{shipment.destination}</span>
                            </div>

                            {/* Details Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Weight size={14} />
                                    {shipment.weight ? `${shipment.weight} kg` : '—'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={14} />
                                    {shipment.pickup_date || '—'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success-light)', fontWeight: 600 }}>
                                    <DollarSign size={14} />
                                    {formatCurrency(shipment.budget)}
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                    {new Date(shipment.created_at).toLocaleDateString()}
                                </span>
                                <button className="btn btn-sm btn-secondary">
                                    {isShipper ? t('manage') : t('placeBid')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filteredShipments.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-state-icon">📭</div>
                    <h3>{t('noShipmentsYet')}</h3>
                    <p>{isShipper ? t('noShipmentsDesc') : t('noShipmentsPostedDesc')}</p>
                </div>
            )}
        </div>
    );
};

export default Shipments;
