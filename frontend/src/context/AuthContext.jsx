import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: userData, token } = response.data;

            localStorage.setItem('routeur_token', token);
            localStorage.setItem('routeur_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const signup = async (data) => {
        try {
            const response = await api.post('/auth/signup', data);
            const { user: userData, token } = response.data;

            localStorage.setItem('routeur_token', token);
            localStorage.setItem('routeur_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed',
            };
        }
    };

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
