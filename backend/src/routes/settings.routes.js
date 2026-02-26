// ============================================
// Settings Routes
// ============================================

const { Router } = require('express');
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// GET /api/v1/settings/profile
router.get('/profile', settingsController.getProfile);

// PUT /api/v1/settings/profile
router.put('/profile', settingsController.updateProfile);

// PUT /api/v1/settings/password
router.put('/password', settingsController.changePassword);

// PUT /api/v1/settings/email
router.put('/email', settingsController.changeEmail);

// DELETE /api/v1/settings/account
router.delete('/account', settingsController.deactivateAccount);

module.exports = router;
