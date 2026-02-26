// ============================================
// Environment Configuration
// ============================================
// Centralizes all environment variables in one place.
// This makes it easy to see what the app needs and
// provides defaults for development.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,
    API_PREFIX: process.env.API_PREFIX || '/api/v1',

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    DB_NAME: process.env.DB_NAME || 'routeur_logistics',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Warn if using defaults in production
if (env.NODE_ENV === 'production') {
    const requiredVars = ['JWT_SECRET', 'DB_PASSWORD'];
    requiredVars.forEach((key) => {
        if (!process.env[key]) {
            console.warn(`⚠️  WARNING: ${key} is not set in production!`);
        }
    });
}

module.exports = env;
