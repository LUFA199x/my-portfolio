"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.strictLimiter = exports.defaultLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
const response_1 = require("../shared/utils/response");
// ─────────────────────────────────────────────────────────
// Default limiter — applied globally
// ─────────────────────────────────────────────────────────
exports.defaultLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.RATE_LIMIT_WINDOW_MS,
    max: config_1.config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        (0, response_1.sendError)(res, 'Too many requests, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    },
});
// ─────────────────────────────────────────────────────────
// Strict limiter — for contact form / auth endpoints
// ─────────────────────────────────────────────────────────
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config_1.config.RATE_LIMIT_CONTACT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        (0, response_1.sendError)(res, 'You have submitted too many requests. Please wait before trying again.', 429, 'RATE_LIMIT_EXCEEDED');
    },
});
// ─────────────────────────────────────────────────────────
// Auth limiter — prevent brute-force login attacks
// ─────────────────────────────────────────────────────────
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    skipSuccessfulRequests: true, // only count failed attempts
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        (0, response_1.sendError)(res, 'Too many failed login attempts. Account temporarily locked.', 429, 'RATE_LIMIT_EXCEEDED');
    },
});
//# sourceMappingURL=rateLimit.middleware.js.map