// ============================================
// Auth Routes
// ============================================

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

const router = Router();

// POST /api/v1/auth/signup
router.post('/signup', validateSignup, authController.signup);

// POST /api/v1/auth/login
router.post('/login', validateLogin, authController.login);

// GET /api/v1/auth/me  (protected)
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
