// ============================================
// Error Handling Middleware
// ============================================
// Centralized error handling for the entire API.
// All errors flow through here for consistent responses.

const env = require('../config/env');

/**
 * 404 handler — catches requests to undefined routes.
 */
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

/**
 * Global error handler.
 * Must have 4 parameters (err, req, res, next) for Express to recognize it.
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 if no status code is set
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the full error in development
    if (env.NODE_ENV === 'development') {
        console.error('🔴 Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only include stack trace in development
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
