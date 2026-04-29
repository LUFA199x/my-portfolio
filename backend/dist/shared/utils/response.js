"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendNoContent = exports.sendCreated = exports.sendSuccess = void 0;
exports.buildPaginationMeta = buildPaginationMeta;
exports.parsePagination = parsePagination;
// ─────────────────────────────────────────────────────────
// Response builders
// ─────────────────────────────────────────────────────────
const sendSuccess = (res, data, message, statusCode = 200, meta) => {
    const body = { success: true };
    if (message)
        body.message = message;
    if (data !== undefined)
        body.data = data;
    if (meta)
        body.meta = meta;
    res.status(statusCode).json(body);
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message) => {
    (0, exports.sendSuccess)(res, data, message ?? 'Created successfully', 201);
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    res.status(204).send();
};
exports.sendNoContent = sendNoContent;
const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details) => {
    const body = {
        success: false,
        error: { code, message },
    };
    if (details)
        body.error.details = details;
    res.status(statusCode).json(body);
};
exports.sendError = sendError;
// ─────────────────────────────────────────────────────────
// Pagination builder
// ─────────────────────────────────────────────────────────
function buildPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
//# sourceMappingURL=response.js.map