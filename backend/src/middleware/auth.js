// ============================================
// Authentication Middleware
// ============================================
// Protects routes by verifying JWT tokens.
// Also provides role-based access control.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Verify JWT token from the Authorization header.
 * Attaches the decoded user to req.user.
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Attach user info to the request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,       // 'carrier' or 'shipper'
            companyId: decoded.companyId,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please log in again.',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
};

/**
 * Role-based authorization.
 * Usage: authorize('carrier', 'admin')
 * Must be used AFTER authenticate middleware.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}`,
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
