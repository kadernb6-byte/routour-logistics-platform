import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../services/supabaseClient';
import TripCard from '../components/TripCard';
import ShipmentCard from '../components/ShipmentCard';
import BookingModal from '../components/BookingModal';
import {
    Truck, Plus, Loader2, AlertCircle, X, Search,
} from 'lucide-react';
import './Trips.css';

export default function Trips() {
    const { user } = useAuth();
    const { t } = useLang();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    const [searchOrigin, setSearchOrigin] = useState('');
    const [bookingTrip, setBookingTrip] = useState(null);

    const isCarrier = user?.role === 'carrier';

    const [formData, setFormData] = useState({
        origin: '', destination: '', departure_date: '',
        capacity: '', vehicle_type: '', price_per_kg: '',
    });

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('trips')
                .select('*, companies(name)');
            
            if (isCarrier) {
                query = query.eq('company_id', user.companyId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            setTrips(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { error } = await supabase
                .from('trips')
                .insert({
                    ...formData,
                    company_id: user.companyId,
                    status: 'active'
                });
            if (error) throw error;
            setShowForm(false);
            setFormData({ origin: '', destination: '', departure_date: '', capacity: '', vehicle_type: '', price_per_kg: '' });
            fetchTrips();
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleMatch = async (tripId) => {
        try {
            const trip = trips.find(t => t.id === tripId);
            if (!trip) return;

            // Simple client-side matching for now, or direct query
            const { data: matches, error } = await supabase
                .from('shipments')
                .select('*')
                .eq('status', 'pending')
                .ilike('origin', `%${trip.origin}%`)
                .ilike('destination', `%${trip.destination}%`);

            if (error) throw error;
            setMatchResult({
                trip,
                matches,
                matchCount: matches.length
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBook = (trip) => {
        setBookingTrip(trip);
    };

    const filteredTrips = searchOrigin
        ? trips.filter(t =>
            t.origin.toLowerCase().includes(searchOrigin.toLowerCase()) ||
            t.destination.toLowerCase().includes(searchOrigin.toLowerCase())
        )
        : trips;

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
                    <h1><Truck size={24} /> {isCarrier ? t('myTrips') : t('availableTrips')}</h1>
                    <p>{isCarrier ? t('carrierTripsDesc') : t('shipperTripsDesc')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {isCarrier && (
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            <Plus size={16} /> {t('newTrip')}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Create trip form */}
            {showForm && (
                <div className="glass-card trip-form">
                    <div className="trip-form-header">
                        <h3>{t('publishTrip')}</h3>
                        <button onClick={() => setShowForm(false)} className="close-btn"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>{t('origin')} *</label>
                                <input
                                    type="text" placeholder={t('originPlaceholder')} required
                                    value={formData.origin}
                                    onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('destination')} *</label>
                                <input
                                    type="text" placeholder={t('destinationPlaceholder')} required
                                    value={formData.destination}
                                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('departureDate')} *</label>
                                <input
                                    type="date" required
                                    value={formData.departure_date}
                                    onChange={e => setFormData({ ...formData, departure_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('availableCapacity')} *</label>
                                <input
                                    type="number" placeholder="5000" required min="1"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('vehicleType')}</label>
                                <select
                                    value={formData.vehicle_type}
                                    onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                                >
                                    <option value="">{t('select')}...</option>
                                    <option value="flatbed">Flatbed</option>
                                    <option value="refrigerated">Refrigerated</option>
                                    <option value="van">Van</option>
                                    <option value="container">Container</option>
                                    <option value="tanker">Tanker</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('pricePerKg')}</label>
                                <input
                                    type="number" placeholder={t('optional')}
                                    value={formData.price_per_kg}
                                    onChange={e => setFormData({ ...formData, price_per_kg: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginTop: 16 }}>
                            {creating ? <><Loader2 size={16} className="spinner" /> {t('loading')}</> : <><Truck size={16} /> {t('publishTrip')}</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Match results */}
            {matchResult && (
                <div className="match-results glass-card">
                    <div className="match-results-header">
                        <h3>🤝 {t('matchingShipments')} ({matchResult.matchCount})</h3>
                        <button onClick={() => setMatchResult(null)} className="btn btn-secondary">{t('close')}</button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                        {t('route')}: {matchResult.trip.origin} → {matchResult.trip.destination}
                    </p>
                    {matchResult.matches.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>{t('noMatchFound')}</p>
                    ) : (
                        <div className="cards-grid">
                            {matchResult.matches.map(s => (
                                <ShipmentCard key={s.id} shipment={s} actionLabel={t('contactShipper')} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Search bar */}
            <div className="search-bar" style={{ marginBottom: 20 }}>
                <Search size={18} />
                <input
                    type="text"
                    placeholder={t('searchTrips')}
                    value={searchOrigin}
                    onChange={e => setSearchOrigin(e.target.value)}
                />
            </div>

            {/* Trips grid */}
            {filteredTrips.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-state-icon">🚚</div>
                    <h3>{isCarrier ? t('noTripsYet') : t('noTripsAvailable')}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isCarrier
                            ? t('noTripsDesc')
                            : t('noTripsAvailableDesc')}
                    </p>
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredTrips.map(trip => (
                        <TripCard
                            key={trip.id}
                            trip={{
                                ...trip,
                                carrier_name: trip.companies?.name
                            }}
                            onMatch={isCarrier ? handleMatch : undefined}
                            onBook={!isCarrier ? handleBook : undefined}
                            showCarrier={!isCarrier}
                        />
                    ))}
                </div>
            )}

            {/* Booking modal */}
            {bookingTrip && (
                <BookingModal
                    trip={bookingTrip}
                    onClose={() => setBookingTrip(null)}
                    onSuccess={() => fetchTrips()}
                />
            )}
        </div>
    );
}
