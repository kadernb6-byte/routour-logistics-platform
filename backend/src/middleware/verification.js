// ============================================
// Verification Middleware
// ============================================
// Blocks unverified companies from creating trips or shipments.
// Must be used AFTER authenticate middleware.

const db = require('../config/db');

/**
 * Require company to be verified before allowing the action.
 * Usage: router.post('/trips', authenticate, requireVerified, ...)
 */
const requireVerified = async (req, res, next) => {
    try {
        if (!req.user || !req.user.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        const result = await db.query(
            'SELECT verified, verification_status FROM companies WHERE id = $1',
            [req.user.companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company not found.',
            });
        }

        const company = result.rows[0];

        // Allow if either the old 'verified' flag or new 'verification_status' indicates verified
        const isVerified = company.verified === true || company.verification_status === 'verified';

        if (!isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Company verification required. Please upload your documents and wait for admin approval.',
                verificationStatus: company.verification_status || 'unverified',
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { requireVerified };
