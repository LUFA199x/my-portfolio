"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const AppError_1 = require("../shared/errors/AppError");
const response_1 = require("../shared/utils/response");
const logger_1 = require("../shared/utils/logger");
const config_1 = require("../config");
// ─────────────────────────────────────────────────────────
// Not Found handler (attach BEFORE error handler)
// ─────────────────────────────────────────────────────────
function notFoundHandler(req, res) {
    (0, response_1.sendError)(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
}
// ─────────────────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────────────────
function errorHandler(err, req, res, _next) {
    // Log every error
    logger_1.logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });
    // Operational errors (our own AppError subclasses)
    if (err instanceof AppError_1.AppError) {
        (0, response_1.sendError)(res, err.message, err.statusCode, err.code);
        return;
    }
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const details = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        (0, response_1.sendError)(res, 'Validation failed', 422, 'VALIDATION_ERROR', details);
        return;
    }
    // Prisma errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint
                (0, response_1.sendError)(res, 'A record with this value already exists', 409, 'CONFLICT');
                return;
            case 'P2025': // Record not found
                (0, response_1.sendError)(res, 'Record not found', 404, 'NOT_FOUND');
                return;
            case 'P2003': // Foreign key constraint
                (0, response_1.sendError)(res, 'Related record not found', 400, 'BAD_REQUEST');
                return;
            default:
                (0, response_1.sendError)(res, 'Database error', 500, 'DATABASE_ERROR');
                return;
        }
    }
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        (0, response_1.sendError)(res, 'Invalid data provided', 400, 'BAD_REQUEST');
        return;
    }
    // JWT errors (should be caught by auth middleware, but just in case)
    if (err.name === 'JsonWebTokenError') {
        (0, response_1.sendError)(res, 'Invalid token', 401, 'UNAUTHORIZED');
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, response_1.sendError)(res, 'Token expired', 401, 'TOKEN_EXPIRED');
        return;
    }
    // Multer file errors
    if (err.name === 'MulterError') {
        (0, response_1.sendError)(res, err.message, 400, 'FILE_UPLOAD_ERROR');
        return;
    }
    // Unknown errors — don't leak stack traces in production
    const message = config_1.config.NODE_ENV === 'development' ? err.message : 'Something went wrong';
    (0, response_1.sendError)(res, message, 500, 'INTERNAL_ERROR');
}
//# sourceMappingURL=error.middleware.js.map