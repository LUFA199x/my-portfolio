"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const auth_schema_1 = require("./auth.schema");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const response_1 = require("../../shared/utils/response");
const validate_middleware_1 = require("../../middleware/validate.middleware");
// ─────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────
class AuthController {
    async login(req, res) {
        const result = await auth_service_1.authService.login(req.body, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        (0, response_1.sendSuccess)(res, result, 'Login successful');
    }
    async refresh(req, res) {
        const { tokens } = await auth_service_1.authService.refresh(req.body.refreshToken);
        (0, response_1.sendSuccess)(res, { tokens }, 'Tokens refreshed');
    }
    async logout(req, res) {
        await auth_service_1.authService.logout(req.body.refreshToken);
        (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
    }
    async logoutAll(req, res) {
        await auth_service_1.authService.logoutAll(req.user.id);
        (0, response_1.sendSuccess)(res, null, 'All sessions terminated');
    }
    async me(req, res) {
        const user = await auth_service_1.authService.getProfile(req.user.id);
        (0, response_1.sendSuccess)(res, user);
    }
    async changePassword(req, res) {
        await auth_service_1.authService.changePassword(req.user.id, req.body);
        (0, response_1.sendSuccess)(res, null, 'Password changed — please log in again');
    }
}
const ctrl = new AuthController();
// ─────────────────────────────────────────────────────────
// Routes — /api/v1/auth
// ─────────────────────────────────────────────────────────
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), (req, res) => ctrl.login(req, res));
exports.authRouter.post('/refresh', (0, validate_middleware_1.validate)(auth_schema_1.refreshSchema), (req, res) => ctrl.refresh(req, res));
exports.authRouter.post('/logout', (req, res) => ctrl.logout(req, res));
exports.authRouter.post('/logout-all', auth_middleware_1.authenticate, (req, res) => ctrl.logoutAll(req, res));
exports.authRouter.get('/me', auth_middleware_1.authenticate, (req, res) => ctrl.me(req, res));
exports.authRouter.patch('/change-password', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(auth_schema_1.changePasswordSchema), (req, res) => ctrl.changePassword(req, res));
//# sourceMappingURL=auth.routes.js.map