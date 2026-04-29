"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.signTokenPair = signTokenPair;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.extractBearerToken = extractBearerToken;
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const AppError_1 = require("../errors/AppError");
// ─────────────────────────────────────────────────────────
// Sign tokens
// ─────────────────────────────────────────────────────────
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.config.JWT_ACCESS_SECRET, {
        expiresIn: config_1.config.JWT_ACCESS_EXPIRES_IN,
    });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.config.JWT_REFRESH_SECRET, {
        expiresIn: config_1.config.JWT_REFRESH_EXPIRES_IN,
    });
}
function signTokenPair(payload) {
    return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
    };
}
// ─────────────────────────────────────────────────────────
// Verify tokens
// ─────────────────────────────────────────────────────────
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.JWT_ACCESS_SECRET);
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new AppError_1.UnauthorizedError('Access token expired');
        }
        throw new AppError_1.UnauthorizedError('Invalid access token');
    }
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.JWT_REFRESH_SECRET);
    }
    catch {
        throw new AppError_1.UnauthorizedError('Invalid or expired refresh token');
    }
}
// ─────────────────────────────────────────────────────────
// Extract token from header
// ─────────────────────────────────────────────────────────
function extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError_1.UnauthorizedError('Missing or malformed Authorization header');
    }
    return authHeader.slice(7);
}
// ─────────────────────────────────────────────────────────
// Get refresh token expiry as Date
// ─────────────────────────────────────────────────────────
function getRefreshTokenExpiry() {
    const days = parseInt(config_1.config.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
//# sourceMappingURL=jwt.js.map