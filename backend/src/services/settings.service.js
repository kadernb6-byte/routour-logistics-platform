// ============================================
// Settings Service (Supabase)
// ============================================
// Business logic for user settings.

const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

/**
 * Get full profile for settings page
 */
const getFullProfile = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, role, is_active, created_at, last_login, companies(name, type, address, phone)')
        .eq('id', userId)
        .single();

    if (error || !data) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return {
        ...data,
        company_name: data.companies?.name,
        company_type: data.companies?.type,
        company_address: data.companies?.address,
        company_phone: data.companies?.phone,
        companies: undefined,
    };
};

/**
 * Update profile info (name, phone)
 */
const updateProfile = async (userId, { firstName, lastName, phone }) => {
    const updates = {};
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (phone !== undefined) updates.phone = phone;

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('id, email, first_name, last_name, phone, role')
        .single();

    if (error || !data) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return data;
};

/**
 * Change password (requires current password verification)
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
    // 1. Fetch current hash
    const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

    if (error || !user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        const err = new Error('Current password is incorrect');
        err.statusCode = 400;
        throw err;
    }

    // 3. Validate new password
    if (newPassword.length < 6) {
        const err = new Error('New password must be at least 6 characters');
        err.statusCode = 400;
        throw err;
    }

    // 4. Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', userId);

    if (updateError) throw new Error(updateError.message);

    return { message: 'Password changed successfully' };
};

/**
 * Change email (requires password verification)
 */
const changeEmail = async (userId, { newEmail, password }) => {
    // 1. Verify password
    const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

    if (error || !user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('Password is incorrect');
        err.statusCode = 400;
        throw err;
    }

    // 2. Check if new email is already taken
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .neq('id', userId)
        .limit(1);

    if (existing && existing.length > 0) {
        const err = new Error('This email is already in use');
        err.statusCode = 409;
        throw err;
    }

    // 3. Update email
    const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', userId)
        .select('id, email')
        .single();

    if (updateError) throw new Error(updateError.message);
    return updated;
};

/**
 * Deactivate account (soft delete — requires password verification)
 */
const deactivateAccount = async (userId, password) => {
    // 1. Verify password
    const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

    if (error || !user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('Password is incorrect');
        err.statusCode = 400;
        throw err;
    }

    // 2. Soft-delete
    const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

    if (updateError) throw new Error(updateError.message);

    return { message: 'Account deactivated' };
};

module.exports = {
    getFullProfile,
    updateProfile,
    changePassword,
    changeEmail,
    deactivateAccount,
};
