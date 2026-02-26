import { useState } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    MapPin,
    Calendar,
    Weight,
    DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Shipments = () => {
    const { user } = useAuth();
    const isShipper = user?.role === 'shipper';

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Demo shipments data
    const shipments = [
        {
            id: 'SHP-001',
            title: 'Electronics Parts - Fragile',
            description: 'Palletized electronic components, requires careful handling',
            origin: 'Paris, France',
            destination: 'Berlin, Germany',
            weight: '1,500 kg',
            budget: '€2,500',
            pickupDate: '2026-03-01',
            status: 'pending',
            bidsCount: 5,
        },
        {
            id: 'SHP-002',
            title: 'Organic Produce - Temperature Controlled',
            description: 'Fresh organic vegetables, needs refrigerated transport',
            origin: 'Amsterdam, Netherlands',
            destination: 'Lyon, France',
            weight: '3,000 kg',
            budget: '€4,200',
            pickupDate: '2026-03-10',
            status: 'in_transit',
            bidsCount: 8,
        },
        {
            id: 'SHP-003',
            title: 'Industrial Machinery',
            description: 'Heavy equipment, flatbed required',
            origin: 'Lyon, France',
            destination: 'Munich, Germany',
            weight: '8,500 kg',
            budget: '€7,800',
            pickupDate: '2026-03-15',
            status: 'pending',
            bidsCount: 3,
        },
        {
            id: 'SHP-004',
            title: 'Pharmaceutical Shipment',
            description: 'Medical supplies, time-sensitive delivery',
            origin: 'Brussels, Belgium',
            destination: 'Milan, Italy',
            weight: '750 kg',
            budget: '€3,100',
            pickupDate: '2026-03-05',
            status: 'delivered',
            bidsCount: 12,
        },
        {
            id: 'SHP-005',
            title: 'Automotive Parts - Bulk',
            description: 'Car parts and components in bulk packaging',
            origin: 'Stuttgart, Germany',
            destination: 'Barcelona, Spain',
            weight: '4,200 kg',
            budget: '€5,600',
            pickupDate: '2026-03-20',
            status: 'pending',
            bidsCount: 0,
        },
    ];

    const filteredShipments = shipments.filter((s) => {
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        const matchesSearch =
            !searchQuery ||
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.destination.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusLabel = (status) => {
        return {
            pending: 'Pending',
            in_transit: 'In Transit',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        }[status] || status;
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div
                className="page-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 'var(--space-md)',
                }}
            >
                <div>
                    <h1>📦 Shipments</h1>
                    <p>
                        {isShipper
                            ? 'Manage and track your freight shipments'
                            : 'Browse available shipments and place bids'}
                    </p>
                </div>
                {isShipper && (
                    <button className="btn btn-primary" id="create-shipment">
                        <Plus size={18} /> New Shipment
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div
                className="glass-card"
                style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    alignItems: 'center',
                    marginBottom: 'var(--space-lg)',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        flex: 1,
                        minWidth: '200px',
                    }}
                >
                    <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search shipments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="shipment-search"
                        style={{ background: 'transparent', border: 'none', padding: '8px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                    <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                    {['all', 'pending', 'in_transit', 'delivered'].map((status) => (
                        <button
                            key={status}
                            className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilterStatus(status)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {status === 'all' ? 'All' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shipment Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: 'var(--space-lg)',
                }}
            >
                {filteredShipments.map((shipment, index) => (
                    <div
                        key={shipment.id}
                        className={`glass-card animate-fadeInUp stagger-${index + 1}`}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Card Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--space-md)',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-primary-light)',
                                        fontWeight: 600,
                                        marginBottom: '4px',
                                    }}
                                >
                                    {shipment.id}
                                </div>
                                <h3
                                    style={{
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 700,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {shipment.title}
                                </h3>
                            </div>
                            <span className={`badge badge-${shipment.status}`}>
                                {getStatusLabel(shipment.status)}
                            </span>
                        </div>

                        {/* Route */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-md)',
                                padding: 'var(--space-sm) var(--space-md)',
                                background: 'var(--bg-primary)',
                                borderRadius: 'var(--border-radius-md)',
                            }}
                        >
                            <MapPin size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                            <span style={{ fontWeight: 500 }}>{shipment.origin}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>→</span>
                            <MapPin size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                            <span style={{ fontWeight: 500 }}>{shipment.destination}</span>
                        </div>

                        {/* Details Row */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-muted)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Weight size={14} />
                                {shipment.weight}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={14} />
                                {shipment.pickupDate}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'var(--color-success-light)',
                                    fontWeight: 600,
                                }}
                            >
                                <DollarSign size={14} />
                                {shipment.budget}
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 'var(--space-md)',
                                paddingTop: 'var(--space-md)',
                                borderTop: '1px solid var(--border-color)',
                            }}
                        >
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                {shipment.bidsCount} bid{shipment.bidsCount !== 1 ? 's' : ''} received
                            </span>
                            <button className="btn btn-sm btn-secondary">
                                {isShipper ? 'Manage' : 'Place Bid'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredShipments.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-state-icon">📭</div>
                    <h3>No shipments found</h3>
                    <p>Try adjusting your filters or search query.</p>
                </div>
            )}
        </div>
    );
};

export default Shipments;
