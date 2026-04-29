"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = void 0;
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
exports.requireRole = requireRole;
const client_1 = require("@prisma/client");
const jwt_1 = require("../shared/utils/jwt");
const AppError_1 = require("../shared/errors/AppError");
const database_1 = require("../config/database");
// ─────────────────────────────────────────────────────────
// Require valid JWT
// ─────────────────────────────────────────────────────────
async function authenticate(req, _res, next) {
    const token = (0, jwt_1.extractBearerToken)(req.headers.authorization);
    const payload = (0, jwt_1.verifyAccessToken)(token);
    // Verify user still exists in DB
    const user = await database_1.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, name: true },
    });
    if (!user) {
        throw new AppError_1.UnauthorizedError('User account no longer exists');
    }
    req.user = user;
    next();
}
// ─────────────────────────────────────────────────────────
// Optional auth — attaches user if token present, no error if missing
// ─────────────────────────────────────────────────────────
async function optionalAuth(req, _res, next) {
    try {
        if (!req.headers.authorization) {
            next();
            return;
        }
        const token = (0, jwt_1.extractBearerToken)(req.headers.authorization);
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await database_1.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true, name: true },
        });
        if (user)
            req.user = user;
    }
    catch {
        // silently ignore — optional auth
    }
    next();
}
// ─────────────────────────────────────────────────────────
// Role guard factory
// ─────────────────────────────────────────────────────────
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError();
        }
        if (!roles.includes(req.user.role)) {
            throw new AppError_1.ForbiddenError(`Requires one of: ${roles.join(', ')}`);
        }
        next();
    };
}
// Convenience guards
exports.requireAdmin = requireRole(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN);
exports.requireSuperAdmin = requireRole(client_1.Role.SUPER_ADMIN);
//# sourceMappingURL=auth.middleware.js.map