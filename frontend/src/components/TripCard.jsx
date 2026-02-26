import { Truck, MapPin, Calendar, Weight, ArrowRight, Package } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './TripCard.css';

export default function TripCard({ trip, onMatch, onBook, showCarrier = true }) {
    const { t } = useLang();

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return '—';
        }
    };

    const initials = trip.carrier_name
        ? trip.carrier_name.split(' ').map(w => w[0]).join('').slice(0, 2)
        : '??';

    return (
        <div className="trip-card">
            <div className="trip-card-header">
                <div className="trip-route">
                    <MapPin size={18} />
                    <span>{trip.origin}</span>
                    <ArrowRight size={16} className="trip-route-arrow" />
                    <span>{trip.destination}</span>
                </div>
                {trip.vehicle_type && (
                    <span className="trip-vehicle-badge">
                        <Truck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {trip.vehicle_type}
                    </span>
                )}
            </div>

            <div className="trip-card-details">
                <div className="trip-detail">
                    <span className="trip-detail-label">{t('departureDate')}</span>
                    <span className="trip-detail-value">
                        <Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {formatDate(trip.departure_date)}
                    </span>
                </div>
                <div className="trip-detail">
                    <span className="trip-detail-label">{t('availableCapacity')}</span>
                    <span className="trip-detail-value">
                        <Weight size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {Number(trip.capacity || trip.available_capacity).toLocaleString()} kg
                    </span>
                </div>
                {trip.price_per_kg && (
                    <div className="trip-detail">
                        <span className="trip-detail-label">{t('pricePerKg')}</span>
                        <span className="trip-detail-value">
                            {Number(trip.price_per_kg).toLocaleString()} DZD
                        </span>
                    </div>
                )}
                <div className="trip-detail">
                    <span className="trip-detail-label">{t('status')}</span>
                    <span className={`status-badge status-${trip.status}`}>
                        {t(trip.status || 'active')}
                    </span>
                </div>
            </div>

            <div className="trip-card-footer">
                {showCarrier && trip.carrier_name ? (
                    <div className="trip-carrier-info">
                        <div className="trip-carrier-avatar">{initials}</div>
                        <span>{trip.carrier_name}</span>
                    </div>
                ) : (
                    <div />
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                    {onMatch && (
                        <button className="trip-match-btn" onClick={() => onMatch(trip.id)}>
                            🤝 {t('findMatches')}
                        </button>
                    )}
                    {onBook && (
                        <button className="trip-book-btn" onClick={() => onBook(trip)}>
                            <Package size={14} /> {t('bookShipment')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
