// ============================================
// Validation Middleware
// ============================================
// Uses express-validator to validate request bodies.
// This file contains reusable validation chains.

const { body, validationResult } = require('express-validator');

/**
 * Middleware that checks validation results and returns errors if any.
 * Place this AFTER your validation chains in the route.
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

// --------------- Auth Validations ---------------

const validateSignup = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('companyName')
        .trim()
        .notEmpty()
        .withMessage('Company name is required'),
    body('role')
        .isIn(['carrier', 'shipper'])
        .withMessage('Role must be either "carrier" or "shipper"'),
    handleValidation,
];

const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidation,
];

// --------------- Shipment Validations ---------------

const validateShipment = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Shipment title is required'),
    body('origin')
        .trim()
        .notEmpty()
        .withMessage('Origin location is required'),
    body('destination')
        .trim()
        .notEmpty()
        .withMessage('Destination location is required'),
    body('weight')
        .isFloat({ min: 0.1 })
        .withMessage('Weight must be a positive number'),
    body('pickupDate')
        .isISO8601()
        .withMessage('Pickup date must be a valid date'),
    handleValidation,
];

module.exports = {
    handleValidation,
    validateSignup,
    validateLogin,
    validateShipment,
};
