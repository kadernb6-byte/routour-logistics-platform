// ============================================
// Auth Controller
// ============================================
// Thin layer that receives HTTP requests,
// calls the auth service, and sends responses.

const authService = require('../services/auth.service');
const response = require('../utils/apiResponse');

const signup = async (req, res, next) => {
    try {
        const result = await authService.signup(req.body);
        return response.created(res, result, 'Account created successfully');
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        return response.success(res, result, 'Login successful');
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);
        return response.success(res, user);
    } catch (error) {
        next(error);
    }
};

module.exports = { signup, login, getProfile };
