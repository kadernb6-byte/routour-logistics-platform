// ============================================
// API Response Helpers
// ============================================
// Standardizes all API responses for consistency.
// Every response follows the same shape.

/**
 * Success response
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Created response (201)
 */
const created = (res, data = null, message = 'Created successfully') => {
    return success(res, data, message, 201);
};

/**
 * Error response
 */
const error = (res, message = 'Something went wrong', statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

/**
 * Paginated response
 */
const paginated = (res, data, page, limit, total) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

module.exports = { success, created, error, paginated };
