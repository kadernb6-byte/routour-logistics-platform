// ============================================
// Environment Configuration
// ============================================
// Centralizes all environment variables in one place.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,
    API_PREFIX: process.env.API_PREFIX || '/api/v1',

    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Warn if using defaults in production
if (env.NODE_ENV === 'production') {
    const requiredVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
    requiredVars.forEach((key) => {
        if (!process.env[key]) {
            console.warn(`⚠️  WARNING: ${key} is not set in production!`);
        }
    });
}

module.exports = env;
