import { Truck, MapPin, Calendar, Weight, ArrowRight, Package } from 'lucide-react';
import './TripCard.css';

export default function TripCard({ trip, onMatch, onBook, showCarrier = true }) {
    const departureDate = new Date(trip.departure_date).toLocaleDateString('en-DZ', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const initials = trip.company_name
        ? trip.company_name.split(' ').map(w => w[0]).join('').slice(0, 2)
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
                    <span className="trip-detail-label">Departure</span>
                    <span className="trip-detail-value">
                        <Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {departureDate}
                    </span>
                </div>
                <div className="trip-detail">
                    <span className="trip-detail-label">Capacity</span>
                    <span className="trip-detail-value">
                        <Weight size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {Number(trip.available_capacity).toLocaleString()} kg
                    </span>
                </div>
                {trip.price_per_kg && (
                    <div className="trip-detail">
                        <span className="trip-detail-label">Price/kg</span>
                        <span className="trip-detail-value">
                            {Number(trip.price_per_kg).toLocaleString()} DZD
                        </span>
                    </div>
                )}
                <div className="trip-detail">
                    <span className="trip-detail-label">Status</span>
                    <span className={`status-badge status-${trip.status}`}>
                        {trip.status}
                    </span>
                </div>
            </div>

            <div className="trip-card-footer">
                {showCarrier && trip.company_name ? (
                    <div className="trip-carrier-info">
                        <div className="trip-carrier-avatar">{initials}</div>
                        <span>{trip.company_name}</span>
                    </div>
                ) : (
                    <div />
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                    {onMatch && (
                        <button className="trip-match-btn" onClick={() => onMatch(trip.id)}>
                            🤝 Find Matches
                        </button>
                    )}
                    {onBook && (
                        <button className="trip-book-btn" onClick={() => onBook(trip)}>
                            <Package size={14} /> Book Shipment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

