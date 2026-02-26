import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    Shield, Upload, FileText, CheckCircle, XCircle,
    Clock, AlertCircle, Loader2, File, Trash2,
} from 'lucide-react';
import './Verification.css';

const DOCUMENT_TYPES = [
    { value: 'registre_commerce', label: 'Registre de Commerce (RC)', required: true, icon: '📜' },
    { value: 'nif', label: 'NIF (Numéro d\'Identification Fiscale)', required: true, icon: '🏛️' },
    { value: 'license', label: 'Transport License', required: false, icon: '🚚' },
    { value: 'insurance', label: 'Insurance Certificate', required: false, icon: '🛡️' },
    { value: 'id_card', label: 'National ID / Passport', required: false, icon: '🪪' },
    { value: 'other', label: 'Other Document', required: false, icon: '📄' },
];

export default function Verification() {
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [selectedType, setSelectedType] = useState('registre_commerce');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/documents/status');
            setStatus(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('document_type', selectedType);

            const token = localStorage.getItem('routeur_token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || '/api/v1'}/documents/upload`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setSuccessMsg(data.message);
            fetchStatus();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
    };

    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) handleUpload(e.target.files[0]);
    };

    const getStatusIcon = (s) => {
        switch (s) {
            case 'approved': return <CheckCircle size={16} className="status-icon-approved" />;
            case 'rejected': return <XCircle size={16} className="status-icon-rejected" />;
            default: return <Clock size={16} className="status-icon-pending" />;
        }
    };

    const getVerificationBadge = () => {
        if (!status?.company) return null;
        const vs = status.company.verification_status || (status.company.verified ? 'verified' : 'unverified');

        const badges = {
            verified: { text: 'Verified', className: 'badge-verified', icon: <CheckCircle size={16} /> },
            pending: { text: 'Under Review', className: 'badge-pending', icon: <Clock size={16} /> },
            rejected: { text: 'Rejected', className: 'badge-rejected', icon: <XCircle size={16} /> },
            unverified: { text: 'Not Verified', className: 'badge-unverified', icon: <AlertCircle size={16} /> },
        };

        const badge = badges[vs] || badges.unverified;
        return (
            <div className={`verification-badge ${badge.className}`}>
                {badge.icon} {badge.text}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 size={40} className="spinner" />
                <p>Loading verification status...</p>
            </div>
        );
    }

    const progress = status
        ? Math.round(((status.requiredDocuments.length - status.missingDocuments.length) / status.requiredDocuments.length) * 100)
        : 0;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1><Shield size={24} /> Company Verification</h1>
                    <p>Upload your business documents to get verified and start using the platform.</p>
                </div>
                {getVerificationBadge()}
            </div>

            {/* Messages */}
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

            {/* Progress section */}
            <div className="glass-card verification-progress-card">
                <div className="progress-header">
                    <h3>Verification Progress</h3>
                    <span className="progress-percent">{progress}%</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-details">
                    {DOCUMENT_TYPES.filter(dt => dt.required).map(dt => {
                        const uploaded = status?.documents?.find(d => d.document_type === dt.value);
                        return (
                            <div key={dt.value} className={`progress-item ${uploaded ? 'done' : 'missing'}`}>
                                {uploaded ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                <span>{dt.label}</span>
                                {uploaded && (
                                    <span className={`mini-badge mini-${uploaded.status}`}>
                                        {uploaded.status}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upload section */}
            <div className="glass-card upload-section">
                <h3><Upload size={20} /> Upload Document</h3>

                <div className="upload-type-selector">
                    <label>Document Type</label>
                    <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                        {DOCUMENT_TYPES.map(dt => (
                            <option key={dt.value} value={dt.value}>
                                {dt.icon} {dt.label} {dt.required ? '(Required)' : '(Optional)'}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        hidden
                    />
                    {uploading ? (
                        <>
                            <Loader2 size={40} className="spinner" />
                            <p>Uploading document...</p>
                        </>
                    ) : (
                        <>
                            <div className="drop-zone-icon">
                                <Upload size={36} />
                            </div>
                            <p className="drop-zone-text">
                                <strong>Drag & drop</strong> your document here or <strong>click to browse</strong>
                            </p>
                            <p className="drop-zone-hint">PDF, JPEG, PNG, DOC — Max 10 MB</p>
                        </>
                    )}
                </div>
            </div>

            {/* Uploaded documents */}
            {status?.documents?.length > 0 && (
                <div className="glass-card documents-list">
                    <h3><FileText size={20} /> Uploaded Documents ({status.documents.length})</h3>
                    <div className="documents-grid">
                        {status.documents.map(doc => (
                            <div key={doc.id} className={`document-item doc-${doc.status}`}>
                                <div className="document-icon">
                                    <File size={24} />
                                </div>
                                <div className="document-info">
                                    <div className="document-name">{doc.file_name}</div>
                                    <div className="document-type-label">
                                        {DOCUMENT_TYPES.find(dt => dt.value === doc.document_type)?.label || doc.document_type}
                                    </div>
                                    <div className="document-date">
                                        {new Date(doc.created_at).toLocaleDateString('en-DZ', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="document-status">
                                    {getStatusIcon(doc.status)}
                                    <span className={`doc-status-text status-text-${doc.status}`}>
                                        {doc.status}
                                    </span>
                                </div>
                                {doc.review_note && (
                                    <div className="document-note">
                                        <AlertCircle size={12} /> {doc.review_note}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
