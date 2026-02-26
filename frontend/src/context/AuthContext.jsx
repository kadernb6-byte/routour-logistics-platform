import { createContext, useContext, useState, useEffect } from 'react';
// import api from '../services/api'; // Disabled for DEMO MODE

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides:
 * - user: current logged-in user object
 * - login / signup / logout functions
 * - loading: true while checking stored token
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if there's a stored token
    useEffect(() => {
        const token = localStorage.getItem('routeur_token');
        const storedUser = localStorage.getItem('routeur_user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('routeur_token');
                localStorage.removeItem('routeur_user');
            }
        }
        setLoading(false);
    }, []);

    // ============ DEMO MODE — Fake Auth (no backend needed) ============
    const login = async (email, _password) => {
        const fakeUser = {
            id: 'demo-user-001',
            name: 'Guest User',
            email: email,
            companyName: 'Demo Company',
            role: 'shipper',
        };
        const fakeToken = 'fake-jwt-token-demo';

        localStorage.setItem('routeur_token', fakeToken);
        localStorage.setItem('routeur_user', JSON.stringify(fakeUser));
        setUser(fakeUser);

        return { success: true };
    };

    const signup = async (data) => {
        const fakeUser = {
            id: 'demo-user-' + Date.now(),
            name: data.companyName || 'New User',
            email: data.email,
            companyName: data.companyName || 'Demo Company',
            role: data.role || 'shipper',
        };
        const fakeToken = 'fake-jwt-token-demo';

        localStorage.setItem('routeur_token', fakeToken);
        localStorage.setItem('routeur_user', JSON.stringify(fakeUser));
        setUser(fakeUser);

        return { success: true };
    };
    // ============ END DEMO MODE ============

    const logout = () => {
        localStorage.removeItem('routeur_token');
        localStorage.removeItem('routeur_user');
        setUser(null);
    };

    const updateUser = (updatedData) => {
        const merged = { ...user, ...updatedData };
        localStorage.setItem('routeur_user', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access auth context anywhere.
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
