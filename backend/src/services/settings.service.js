// ============================================
// Settings Service
// ============================================
// Business logic for user settings:
//   • Update profile (name, phone)
//   • Change password
//   • Change email
//   • Deactivate account

const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * Get full profile for settings page
 */
const getFullProfile = async (userId) => {
    const result = await db.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
                u.role, u.is_active, u.created_at, u.last_login,
                c.name as company_name, c.type as company_type,
                c.address as company_address, c.phone as company_phone
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

/**
 * Update profile info (name, phone)
 */
const updateProfile = async (userId, { firstName, lastName, phone }) => {
    const result = await db.query(
        `UPDATE users
         SET first_name = COALESCE($2, first_name),
             last_name  = COALESCE($3, last_name),
             phone      = COALESCE($4, phone)
         WHERE id = $1
         RETURNING id, email, first_name, last_name, phone, role`,
        [userId, firstName, lastName, phone]
    );

    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

/**
 * Change password (requires current password verification)
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
    // 1. Fetch current hash
    const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 400;
        throw error;
    }

    // 3. Validate new password
    if (newPassword.length < 6) {
        const error = new Error('New password must be at least 6 characters');
        error.statusCode = 400;
        throw error;
    }

    // 4. Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query(
        'UPDATE users SET password_hash = $2 WHERE id = $1',
        [userId, hashedPassword]
    );

    return { message: 'Password changed successfully' };
};

/**
 * Change email (requires password verification)
 */
const changeEmail = async (userId, { newEmail, password }) => {
    // 1. Verify password
    const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isMatch) {
        const error = new Error('Password is incorrect');
        error.statusCode = 400;
        throw error;
    }

    // 2. Check if new email is already taken
    const existing = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [newEmail, userId]
    );

    if (existing.rows.length > 0) {
        const error = new Error('This email is already in use');
        error.statusCode = 409;
        throw error;
    }

    // 3. Update email
    const result = await db.query(
        'UPDATE users SET email = $2 WHERE id = $1 RETURNING id, email',
        [userId, newEmail]
    );

    return result.rows[0];
};

/**
 * Deactivate account (soft delete — requires password verification)
 */
const deactivateAccount = async (userId, password) => {
    // 1. Verify password
    const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isMatch) {
        const error = new Error('Password is incorrect');
        error.statusCode = 400;
        throw error;
    }

    // 2. Soft-delete: set is_active = false
    await db.query(
        'UPDATE users SET is_active = false WHERE id = $1',
        [userId]
    );

    return { message: 'Account deactivated' };
};

module.exports = {
    getFullProfile,
    updateProfile,
    changePassword,
    changeEmail,
    deactivateAccount,
};
