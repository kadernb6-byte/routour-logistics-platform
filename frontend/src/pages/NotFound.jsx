import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="auth-page" style={{ textAlign: 'center' }}>
            <div className="auth-container animate-fadeInUp" style={{ maxWidth: '500px' }}>
                <div style={{ fontSize: '5rem', marginBottom: 'var(--space-lg)', opacity: 0.6 }}>
                    🗺️
                </div>
                <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
                    404
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xl)' }}>
                    This route doesn't exist on our map.
                </p>
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                    <Home size={18} /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
