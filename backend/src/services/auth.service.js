// ============================================
// Auth Service (Supabase)
// ============================================
// Business logic for authentication using Supabase JS client.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');
const env = require('../config/env');

/**
 * Generate JWT token for a user
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
};

/**
 * Register a new user + company
 */
const signup = async ({ email, password, companyName, role }) => {
    // Check if user already exists
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

    if (existing && existing.length > 0) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the company first
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName, type: role })
        .select('id, name, type')
        .single();

    if (companyError) throw new Error(companyError.message);

    // Create the user linked to the company
    const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
            email,
            password_hash: hashedPassword,
            role,
            company_id: company.id,
        })
        .select('id, email, first_name, last_name, role, company_id, created_at')
        .single();

    if (userError) throw new Error(userError.message);

    // Generate token
    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            companyId: user.company_id,
            companyName: company.name,
        },
        token,
    };
};

/**
 * Log in an existing user
 */
const login = async ({ email, password }) => {
    // Find user with company info
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, password_hash, first_name, last_name, role, company_id, companies(name)')
        .eq('email', email)
        .limit(1);

    if (error) throw new Error(error.message);

    if (!users || users.length === 0) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    // Generate token
    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            companyId: user.company_id,
            companyName: user.companies?.name || '',
        },
        token,
    };
};

/**
 * Get current user profile
 */
const getProfile = async (userId) => {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, company_id, created_at, companies(name, type)')
        .eq('id', userId)
        .limit(1);

    if (error) throw new Error(error.message);

    if (!users || users.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const user = users[0];
    return {
        ...user,
        company_name: user.companies?.name,
        company_type: user.companies?.type,
    };
};

module.exports = { signup, login, getProfile };
