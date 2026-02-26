import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
    X, Package, CreditCard, Banknote, Building2, FileText,
    Loader2, CheckCircle2, Weight, Calculator, ArrowRight, MapPin,
    Truck
} from 'lucide-react';
import './BookingModal.css';

const getPaymentMethods = (t) => [
    {
        id: 'cash_on_delivery',
        label: t('cashOnDelivery'),
        icon: Banknote,
        description: t('cashOnDeliveryDesc'),
        color: '#10b981',
    },
    {
        id: 'bank_transfer',
        label: t('bankTransfer'),
        icon: Building2,
        description: t('bankTransferDesc'),
        color: '#3b82f6',
        hasRef: true,
        refLabel: t('transactionRef'),
    },
    {
        id: 'company_invoice',
        label: t('companyInvoice'),
        icon: FileText,
        description: t('companyInvoiceDesc'),
        color: '#8b5cf6',
        hasRef: true,
        refLabel: t('invoiceNumber'),
    },
];

export default function BookingModal({ trip, onClose, onSuccess }) {
    const { user } = useAuth();
    const { t } = useLang();
    const [step, setStep] = useState(1);
    const [weight, setWeight] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentRef, setPaymentRef] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(null);

    const pricePerKg = Number(trip.price_per_kg) || 0;
    const totalPrice = weight ? (Number(weight) * pricePerKg).toFixed(2) : '0.00';
    const maxWeight = Number(trip.available_capacity || trip.capacity);

    const paymentMethods = getPaymentMethods(t);
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            // Create shipment and link it to trip (simplified for mockup)
            const { data: newShipment, error: shipError } = await supabase
                .from('shipments')
                .insert({
                    company_id: user.companyId,
                    title: `Shipment for Trip #${trip.id.slice(0, 5)}`,
                    origin: trip.origin,
                    destination: trip.destination,
                    weight: Number(weight),
                    budget: Number(totalPrice),
                    status: 'pending',
                    pickup_date: trip.departure_date,
                    description: notes || ''
                })
                .select()
                .single();

            if (shipError) throw shipError;

            // Update trip capacity (simplified)
            await supabase
                .from('trips')
                .update({ capacity: maxWeight - Number(weight) })
                .eq('id', trip.id);

            setBooking(newShipment);
            setStep(4); // success
            onSuccess?.();
        } catch (err) {
            setError(err.message || t('bookingFailed'));
            setSubmitting(false);
        }
    };

    const canProceedStep1 = weight && Number(weight) > 0 && Number(weight) <= maxWeight;
    const canProceedStep2 = paymentMethod !== '';
    const canProceedStep3 = !selectedMethod?.hasRef || paymentRef.trim();

    return (
        <div className="booking-overlay" onClick={onClose}>
            <div className="booking-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="booking-header">
                    <div className="booking-header-left">
                        <Package size={20} />
                        <h2>{t('bookShipment')}</h2>
                    </div>
                    <button className="booking-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Trip summary bar */}
                <div className="booking-trip-bar">
                    <div className="booking-trip-route">
                        <MapPin size={14} />
                        <span>{trip.origin}</span>
                        <ArrowRight size={14} />
                        <span>{trip.destination}</span>
                    </div>
                    <div className="booking-trip-meta">
                        {trip.vehicle_type && (
                            <span className="booking-trip-badge">
                                <Truck size={12} /> {trip.vehicle_type}
                            </span>
                        )}
                        <span className="booking-trip-badge">
                            <Weight size={12} /> {maxWeight.toLocaleString()} kg
                        </span>
                        {pricePerKg > 0 && (
                            <span className="booking-trip-badge booking-trip-price">
                                {pricePerKg.toLocaleString()} DZD/kg
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress steps */}
                <div className="booking-steps">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`booking-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                            <div className="booking-step-dot">{step > s ? '✓' : s}</div>
                            <span>{s === 1 ? t('weightTab') : s === 2 ? t('paymentTab') : t('confirmTab')}</span>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="booking-error">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {/* Step 1: Weight */}
                {step === 1 && (
                    <div className="booking-step-content animate-fadeIn">
                        <h3><Weight size={18} /> {t('shipmentWeight')}</h3>
                        <p className="booking-hint">
                            {t('weightHint')}
                        </p>
                        <div className="booking-weight-input">
                            <input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                placeholder="e.g. 2000"
                                min="1"
                                max={maxWeight}
                                autoFocus
                            />
                            <span className="booking-weight-unit">kg</span>
                        </div>
                        <div className="booking-capacity-bar">
                            <div
                                className="booking-capacity-fill"
                                style={{ width: `${Math.min((Number(weight) / maxWeight) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="booking-capacity-label">
                            {weight || 0} / {maxWeight.toLocaleString()} kg {t('capacity')}
                        </span>

                        {pricePerKg > 0 && weight && (
                            <div className="booking-price-preview">
                                <Calculator size={16} />
                                <span>{Number(weight).toLocaleString()} kg × {pricePerKg.toLocaleString()} DZD</span>
                                <strong>= {Number(totalPrice).toLocaleString()} DZD</strong>
                            </div>
                        )}

                        <div className="booking-actions">
                            <button className="booking-btn-secondary" onClick={onClose}>{t('cancel')}</button>
                            <button
                                className="booking-btn-primary"
                                disabled={!canProceedStep1}
                                onClick={() => setStep(2)}
                            >
                                {t('continue')} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment method */}
                {step === 2 && (
                    <div className="booking-step-content animate-fadeIn">
                        <h3><CreditCard size={18} /> {t('paymentMethod')}</h3>
                        <p className="booking-hint">
                            {t('paymentHint')}
                        </p>
                        <div className="booking-payment-options">
                            {paymentMethods.map(method => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        className={`booking-payment-card ${paymentMethod === method.id ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod(method.id)}
                                        style={{ '--method-color': method.color }}
                                    >
                                        <div className="booking-payment-icon">
                                            <Icon size={24} />
                                        </div>
                                        <div className="booking-payment-info">
                                            <strong>{method.label}</strong>
                                            <span>{method.description}</span>
                                        </div>
                                        <div className={`booking-payment-radio ${paymentMethod === method.id ? 'checked' : ''}`} />
                                    </button>
                                );
                            })}
                        </div>
                        <div className="booking-actions">
                            <button className="booking-btn-secondary" onClick={() => setStep(1)}>{t('back')}</button>
                            <button
                                className="booking-btn-primary"
                                disabled={!canProceedStep2}
                                onClick={() => setStep(3)}
                            >
                                {t('continue')} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div className="booking-step-content animate-fadeIn">
                        <h3><CheckCircle2 size={18} /> {t('confirmBooking')}</h3>

                        {selectedMethod?.hasRef && (
                            <div className="booking-ref-input">
                                <label>{selectedMethod.refLabel}</label>
                                <input
                                    type="text"
                                    value={paymentRef}
                                    onChange={e => setPaymentRef(e.target.value)}
                                    placeholder={`${t('enter')} ${selectedMethod.refLabel.toLowerCase()}`}
                                />
                            </div>
                        )}

                        <div className="booking-ref-input">
                            <label>{t('notesOptional')}</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={t('notesPlaceholder')}
                                rows={2}
                            />
                        </div>

                        <div className="booking-summary">
                            <div className="booking-summary-row">
                                <span>{t('route')}</span>
                                <strong>{trip.origin} → {trip.destination}</strong>
                            </div>
                            <div className="booking-summary-row">
                                <span>{t('weightCap')}</span>
                                <strong>{Number(weight).toLocaleString()} kg</strong>
                            </div>
                            <div className="booking-summary-row">
                                <span>{t('payment')}</span>
                                <strong>{selectedMethod?.label}</strong>
                            </div>
                            {pricePerKg > 0 && (
                                <>
                                    <div className="booking-summary-divider" />
                                    <div className="booking-summary-row booking-summary-total">
                                        <span>{t('total')}</span>
                                        <strong>{Number(totalPrice).toLocaleString()} DZD</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="booking-actions">
                            <button className="booking-btn-secondary" onClick={() => setStep(2)}>{t('back')}</button>
                            <button
                                className="booking-btn-primary booking-btn-confirm"
                                disabled={submitting || !canProceedStep3}
                                onClick={handleSubmit}
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="spinner" /> {t('loading')}</>
                                ) : (
                                    <><CheckCircle2 size={16} /> {t('confirmBooking')}</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && booking && (
                    <div className="booking-step-content booking-success animate-fadeIn">
                        <div className="booking-success-icon">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3>{t('bookingConfirmed')}</h3>
                        <p>{t('bookingConfirmedDesc')}</p>

                        <div className="booking-success-details">
                            <div className="booking-success-row">
                                <span>{t('bookingId')}</span>
                                <code>{booking.id?.slice(0, 8)}...</code>
                            </div>
                            <div className="booking-success-row">
                                <span>{t('status')}</span>
                                <span className="status-badge status-pending">{t('pending')}</span>
                            </div>
                            <div className="booking-success-row">
                                <span>{t('payment')}</span>
                                <span className="status-badge status-pending">{selectedMethod?.label}</span>
                            </div>
                            {pricePerKg > 0 && (
                                <div className="booking-success-row">
                                    <span>{t('total')}</span>
                                    <strong>{Number(totalPrice).toLocaleString()} DZD</strong>
                                </div>
                            )}
                        </div>

                        <button className="booking-btn-primary" onClick={onClose} style={{ width: '100%', marginTop: 16 }}>
                            {t('done')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
