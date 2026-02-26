import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Trips from './pages/Trips';
import Verification from './pages/Verification';
import Payments from './pages/Payments';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Wraps dashboard pages to enforce authentication.
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary)',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            border: '3px solid var(--border-color)',
                            borderTopColor: 'var(--color-primary)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * GuestRoute — redirects to /dashboard if already logged in.
 * Prevents logged-in users from seeing login/signup pages.
 */
const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <LangProvider>
                <AuthProvider>
                    <Routes>
                        {/* Public / Guest routes */}
                        <Route
                            path="/login"
                            element={
                                <GuestRoute>
                                    <Login />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <GuestRoute>
                                    <Signup />
                                </GuestRoute>
                            }
                        />

                        {/* Protected dashboard routes */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/shipments" element={<Shipments />} />
                            {/* Add more dashboard routes here as you build them */}
                            <Route path="/analytics" element={<ComingSoon title="Analytics" />} />
                            <Route path="/trips" element={<Trips />} />
                            <Route path="/bids" element={<ComingSoon title="Bids & Quotes" />} />
                            <Route path="/payments" element={<Payments />} />
                            <Route path="/verification" element={<Verification />} />
                            <Route path="/company" element={<ComingSoon title="Company Profile" />} />
                            <Route path="/team" element={<ComingSoon title="Team Members" />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* 404 fallback */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AuthProvider>
            </LangProvider>
        </BrowserRouter>
    );
}

/**
 * Placeholder for pages not yet built.
 * Shows a clean "coming soon" message.
 */
function ComingSoon({ title }) {
    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>{title}</h1>
                <p>This page is under construction.</p>
            </div>
            <div className="glass-card empty-state">
                <div className="empty-state-icon">🚧</div>
                <h3>Coming Soon</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    We're building this feature. Check back soon!
                </p>
            </div>
        </div>
    );
}

export default App;
