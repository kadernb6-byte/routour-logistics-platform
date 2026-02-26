// ============================================
// Auth Service
// ============================================
// Business logic for authentication.
// Services contain the "brain" — controllers just call services.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
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
    const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
    }

    // Hash the password (salt rounds = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the company first
    const companyResult = await db.query(
        `INSERT INTO companies (name, type)
     VALUES ($1, $2)
     RETURNING id, name, type`,
        [companyName, role]
    );
    const company = companyResult.rows[0];

    // Create the user linked to the company
    const userResult = await db.query(
        `INSERT INTO users (email, password_hash, role, company_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, first_name, last_name, role, company_id, created_at`,
        [email, hashedPassword, role, company.id]
    );
    const user = userResult.rows[0];

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
    const result = await db.query(
        `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.role, u.company_id,
            c.name as company_name
     FROM users u
     JOIN companies c ON u.company_id = c.id
     WHERE u.email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
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
            companyName: user.company_name,
        },
        token,
    };
};

/**
 * Get current user profile
 */
const getProfile = async (userId) => {
    const result = await db.query(
        `SELECT u.id, u.email, u.role, u.company_id, u.created_at,
            c.name as company_name, c.type as company_type
     FROM users u
     JOIN companies c ON u.company_id = c.id
     WHERE u.id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

module.exports = { signup, login, getProfile };
