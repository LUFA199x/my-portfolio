"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribersRouter = void 0;
const zod_1 = require("zod");
const express_1 = require("express");
const database_1 = require("../../config/database");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
const email_1 = require("../../shared/utils/email");
// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const subscribeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        source: zod_1.z.string().max(50).optional(),
    }),
});
// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class SubscribersService {
    async subscribe(email, source) {
        const existing = await database_1.prisma.subscriber.findUnique({ where: { email } });
        if (existing) {
            if (existing.status === 'ACTIVE') {
                throw new AppError_1.ConflictError("You're already subscribed!");
            }
            // Re-subscribe if previously unsubscribed
            const updated = await database_1.prisma.subscriber.update({
                where: { email },
                data: { status: 'ACTIVE', source },
            });
            return { subscriber: updated, isNew: false };
        }
        const subscriber = await database_1.prisma.subscriber.create({ data: { email, source } });
        // Send welcome email in background
        email_1.emailService.sendSubscriberWelcome(email, subscriber.unsubToken).catch(() => { });
        return { subscriber, isNew: true };
    }
    async unsubscribe(token) {
        const subscriber = await database_1.prisma.subscriber.findFirst({
            where: { unsubToken: token },
        });
        if (!subscriber)
            throw new AppError_1.NotFoundError('Subscription');
        await database_1.prisma.subscriber.update({
            where: { id: subscriber.id },
            data: { status: 'UNSUBSCRIBED' },
        });
    }
    async findAll(query) {
        const { page = 1, limit = 50 } = query;
        const skip = (page - 1) * limit;
        const where = query.status ? { status: query.status } : {};
        const [subscribers, total] = await Promise.all([
            database_1.prisma.subscriber.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: { id: true, email: true, status: true, source: true, createdAt: true },
            }),
            database_1.prisma.subscriber.count({ where }),
        ]);
        return { subscribers, meta: (0, response_1.buildPaginationMeta)(total, page, limit) };
    }
    async getStats() {
        const [total, active, unsubscribed] = await Promise.all([
            database_1.prisma.subscriber.count(),
            database_1.prisma.subscriber.count({ where: { status: 'ACTIVE' } }),
            database_1.prisma.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
        ]);
        return { total, active, unsubscribed };
    }
}
const subscribersService = new SubscribersService();
// ─────────────────────────────────────────────────────────
// Routes — /api/v1/subscribers
// ─────────────────────────────────────────────────────────
exports.subscribersRouter = (0, express_1.Router)();
exports.subscribersRouter.post('/', rateLimit_middleware_1.strictLimiter, (0, validate_middleware_1.validate)(subscribeSchema), async (req, res) => {
    const { email, source } = req.body;
    const { isNew } = await subscribersService.subscribe(email, source);
    const message = isNew ? "You're on the list!" : 'Welcome back!';
    (0, response_1.sendCreated)(res, null, message);
});
exports.subscribersRouter.post('/unsubscribe', async (req, res) => {
    const { token } = req.body;
    await subscribersService.unsubscribe(token);
    (0, response_1.sendSuccess)(res, null, 'Successfully unsubscribed');
});
exports.subscribersRouter.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    const { page, limit } = (0, response_1.parsePagination)(req.query);
    const result = await subscribersService.findAll({
        page,
        limit,
        status: req.query.status,
    });
    (0, response_1.sendSuccess)(res, result.subscribers, undefined, 200, result.meta);
});
exports.subscribersRouter.get('/stats', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (_req, res) => {
    const stats = await subscribersService.getStats();
    (0, response_1.sendSuccess)(res, stats);
});
//# sourceMappingURL=subscribers.routes.js.map