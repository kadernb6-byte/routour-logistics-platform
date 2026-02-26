import { Package, MapPin, Calendar, Weight, ArrowRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './ShipmentCard.css';

export default function ShipmentCard({ shipment, actionLabel, onAction, showShipper = true }) {
    const { t } = useLang();

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return '—';
        }
    };

    const initials = shipment.company_name
        ? shipment.company_name.split(' ').map(w => w[0]).join('').slice(0, 2)
        : '??';

    return (
        <div className="shipment-card">
            <div className="shipment-card-title">
                <Package size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#f59e0b' }} />
                {shipment.title}
            </div>

            <div className="shipment-card-route">
                <MapPin size={14} />
                <span>{shipment.origin}</span>
                <ArrowRight size={14} />
                <span>{shipment.destination}</span>
            </div>

            <div className="shipment-card-details">
                <div className="shipment-detail">
                    <span className="shipment-detail-label">{t('pickup')}</span>
                    <span className="shipment-detail-value">
                        <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {formatDate(shipment.pickup_date)}
                    </span>
                </div>
                {shipment.weight && (
                    <div className="shipment-detail">
                        <span className="shipment-detail-label">{t('weightCap')}</span>
                        <span className="shipment-detail-value">
                            <Weight size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            {Number(shipment.weight).toLocaleString()} kg
                        </span>
                    </div>
                )}
                {shipment.budget && (
                    <div className="shipment-detail">
                        <span className="shipment-detail-label">{t('budget')}</span>
                        <span className="shipment-detail-value shipment-budget">
                            {Number(shipment.budget).toLocaleString()} DZD
                        </span>
                    </div>
                )}
                <div className="shipment-detail">
                    <span className="shipment-detail-label">{t('status')}</span>
                    <span className={`status-badge status-${shipment.status}`}>
                        {t(shipment.status || 'pending')}
                    </span>
                </div>
            </div>

            <div className="shipment-card-footer">
                {showShipper && shipment.company_name ? (
                    <div className="shipment-shipper-info">
                        <div className="shipment-shipper-avatar">{initials}</div>
                        <span>{shipment.company_name}</span>
                    </div>
                ) : (
                    <div />
                )}
                {onAction && (
                    <button className="shipment-action-btn" onClick={() => onAction(shipment.id)}>
                        {actionLabel || t('view')}
                    </button>
                )}
            </div>
        </div>
    );
}
