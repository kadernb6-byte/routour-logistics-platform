import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(null);

/**
 * AuthProvider — connects directly to Supabase (no backend needed).
 * Signup: creates company + user in Supabase, auto-enters.
 * Login: checks email + password against Supabase, auto-enters.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if there's a stored user
    useEffect(() => {
        const storedUser = localStorage.getItem('routeur_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('routeur_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Find user by email
            const { data: users, error } = await supabase
                .from('users')
                .select('id, email, password_hash, first_name, last_name, role, company_id, companies(name)')
                .eq('email', email)
                .limit(1);

            if (error) throw new Error(error.message);
            if (!users || users.length === 0) {
                return { success: false, message: 'Invalid email or password' };
            }

            const dbUser = users[0];

            // Verify password with bcrypt
            const isMatch = await bcrypt.compare(password, dbUser.password_hash);
            if (!isMatch) {
                return { success: false, message: 'Invalid email or password' };
            }

            // Build user object
            const userData = {
                id: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.first_name || '',
                lastName: dbUser.last_name || '',
                role: dbUser.role,
                companyId: dbUser.company_id,
                companyName: dbUser.companies?.name || '',
            };

            localStorage.setItem('routeur_token', 'supabase-direct-auth');
            localStorage.setItem('routeur_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const signup = async (data) => {
        try {
            const { email, password, companyName, role } = data;

            // Check if email already exists
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .limit(1);

            if (existing && existing.length > 0) {
                return { success: false, message: 'Email already registered' };
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create company
            const { data: company, error: compError } = await supabase
                .from('companies')
                .insert({ name: companyName, type: role })
                .select('id, name')
                .single();

            if (compError) throw new Error(compError.message);

            // Create user
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                    email,
                    password_hash: passwordHash,
                    role,
                    company_id: company.id,
                })
                .select('id, email, first_name, last_name, role, company_id')
                .single();

            if (userError) throw new Error(userError.message);

            // Auto-login
            const userData = {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name || '',
                lastName: newUser.last_name || '',
                role: newUser.role,
                companyId: newUser.company_id,
                companyName: company.name,
            };

            localStorage.setItem('routeur_token', 'supabase-direct-auth');
            localStorage.setItem('routeur_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Signup failed' };
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
