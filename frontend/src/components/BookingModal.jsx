import { useState } from 'react';
import { createBooking } from '../services/api';
import {
    X, Package, CreditCard, Banknote, Building2, FileText,
    Loader2, CheckCircle2, Weight, Calculator, ArrowRight, MapPin,
    Truck
} from 'lucide-react';
import './BookingModal.css';

const PAYMENT_METHODS = [
    {
        id: 'cash_on_delivery',
        label: 'Cash on Delivery',
        labelFr: 'Paiement à la livraison',
        icon: Banknote,
        description: 'Pay the driver upon delivery',
        color: '#10b981',
    },
    {
        id: 'bank_transfer',
        label: 'Bank Transfer',
        labelFr: 'Virement bancaire',
        icon: Building2,
        description: 'Transfer to carrier\'s bank account',
        color: '#3b82f6',
        hasRef: true,
        refLabel: 'Transaction Reference',
    },
    {
        id: 'company_invoice',
        label: 'Company Invoice',
        labelFr: 'Facture entreprise',
        icon: FileText,
        description: 'Receive an invoice, pay within terms',
        color: '#8b5cf6',
        hasRef: true,
        refLabel: 'PO / Invoice Number',
    },
];

export default function BookingModal({ trip, onClose, onSuccess }) {
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
    const maxWeight = Number(trip.available_capacity);

    const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await createBooking({
                tripId: trip.id,
                weight: Number(weight),
                paymentMethod,
                paymentRef: paymentRef || undefined,
                notes: notes || undefined,
            });
            setBooking(res.data);
            setStep(4); // success
            onSuccess?.();
        } catch (err) {
            setError(err.message || 'Booking failed');
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
                        <h2>Book Shipment</h2>
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
                            <Weight size={12} /> {Number(trip.available_capacity).toLocaleString()} kg
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
                            <span>{s === 1 ? 'Weight' : s === 2 ? 'Payment' : 'Confirm'}</span>
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
                    <div className="booking-step-content">
                        <h3><Weight size={18} /> Shipment Weight</h3>
                        <p className="booking-hint">
                            Enter the weight of goods you want to ship on this trip.
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
                            {weight || 0} / {maxWeight.toLocaleString()} kg capacity
                        </span>

                        {pricePerKg > 0 && weight && (
                            <div className="booking-price-preview">
                                <Calculator size={16} />
                                <span>{Number(weight).toLocaleString()} kg × {pricePerKg.toLocaleString()} DZD</span>
                                <strong>= {Number(totalPrice).toLocaleString()} DZD</strong>
                            </div>
                        )}

                        <div className="booking-actions">
                            <button className="booking-btn-secondary" onClick={onClose}>Cancel</button>
                            <button
                                className="booking-btn-primary"
                                disabled={!canProceedStep1}
                                onClick={() => setStep(2)}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment method */}
                {step === 2 && (
                    <div className="booking-step-content">
                        <h3><CreditCard size={18} /> Payment Method</h3>
                        <p className="booking-hint">
                            Select how you'd like to pay for this shipment.
                        </p>
                        <div className="booking-payment-options">
                            {PAYMENT_METHODS.map(method => {
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
                            <button className="booking-btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="booking-btn-primary"
                                disabled={!canProceedStep2}
                                onClick={() => setStep(3)}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div className="booking-step-content">
                        <h3><CheckCircle2 size={18} /> Confirm Booking</h3>

                        {selectedMethod?.hasRef && (
                            <div className="booking-ref-input">
                                <label>{selectedMethod.refLabel}</label>
                                <input
                                    type="text"
                                    value={paymentRef}
                                    onChange={e => setPaymentRef(e.target.value)}
                                    placeholder={`Enter ${selectedMethod.refLabel.toLowerCase()}`}
                                />
                            </div>
                        )}

                        <div className="booking-ref-input">
                            <label>Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Special instructions, cargo details..."
                                rows={2}
                            />
                        </div>

                        <div className="booking-summary">
                            <div className="booking-summary-row">
                                <span>Route</span>
                                <strong>{trip.origin} → {trip.destination}</strong>
                            </div>
                            <div className="booking-summary-row">
                                <span>Weight</span>
                                <strong>{Number(weight).toLocaleString()} kg</strong>
                            </div>
                            <div className="booking-summary-row">
                                <span>Payment</span>
                                <strong>{selectedMethod?.label}</strong>
                            </div>
                            {pricePerKg > 0 && (
                                <>
                                    <div className="booking-summary-divider" />
                                    <div className="booking-summary-row booking-summary-total">
                                        <span>Total</span>
                                        <strong>{Number(totalPrice).toLocaleString()} DZD</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="booking-actions">
                            <button className="booking-btn-secondary" onClick={() => setStep(2)}>Back</button>
                            <button
                                className="booking-btn-primary booking-btn-confirm"
                                disabled={submitting || !canProceedStep3}
                                onClick={handleSubmit}
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="spinner" /> Processing...</>
                                ) : (
                                    <><CheckCircle2 size={16} /> Confirm Booking</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && booking && (
                    <div className="booking-step-content booking-success">
                        <div className="booking-success-icon">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3>Booking Confirmed!</h3>
                        <p>Your shipment has been booked successfully.</p>

                        <div className="booking-success-details">
                            <div className="booking-success-row">
                                <span>Booking ID</span>
                                <code>{booking.id?.slice(0, 8)}...</code>
                            </div>
                            <div className="booking-success-row">
                                <span>Status</span>
                                <span className="status-badge status-pending">Pending</span>
                            </div>
                            <div className="booking-success-row">
                                <span>Payment</span>
                                <span className="status-badge status-pending">{selectedMethod?.label}</span>
                            </div>
                            {pricePerKg > 0 && (
                                <div className="booking-success-row">
                                    <span>Total</span>
                                    <strong>{Number(totalPrice).toLocaleString()} DZD</strong>
                                </div>
                            )}
                        </div>

                        <button className="booking-btn-primary" onClick={onClose} style={{ width: '100%', marginTop: 16 }}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
