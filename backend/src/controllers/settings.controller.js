// ============================================
// Settings Controller
// ============================================

const settingsService = require('../services/settings.service');
const response = require('../utils/apiResponse');

const getProfile = async (req, res, next) => {
    try {
        const profile = await settingsService.getFullProfile(req.user.id);
        return response.success(res, profile);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const updated = await settingsService.updateProfile(req.user.id, req.body);
        return response.success(res, updated, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const result = await settingsService.changePassword(req.user.id, req.body);
        return response.success(res, result, 'Password changed successfully');
    } catch (error) {
        next(error);
    }
};

const changeEmail = async (req, res, next) => {
    try {
        const result = await settingsService.changeEmail(req.user.id, req.body);
        return response.success(res, result, 'Email changed successfully');
    } catch (error) {
        next(error);
    }
};

const deactivateAccount = async (req, res, next) => {
    try {
        const result = await settingsService.deactivateAccount(req.user.id, req.body.password);
        return response.success(res, result, 'Account deactivated');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    changeEmail,
    deactivateAccount,
};
