// ============================================
// Verification Middleware (Supabase)
// ============================================
// Blocks unverified companies from creating trips or shipments.
// Must be used AFTER authenticate middleware.

const { supabase } = require('../config/db');

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

        const { data: company, error } = await supabase
            .from('companies')
            .select('verified, verification_status')
            .eq('id', req.user.companyId)
            .single();

        if (error || !company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found.',
            });
        }

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
