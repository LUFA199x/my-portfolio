"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialsRouter = void 0;
const zod_1 = require("zod");
const express_1 = require("express");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const testimonialSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100),
        role: zod_1.z.string().min(1).max(100),
        company: zod_1.z.string().max(100).optional(),
        text: zod_1.z.string().min(20).max(1000),
        avatar: zod_1.z.string().url().optional(),
        featured: zod_1.z.boolean().default(false),
        published: zod_1.z.boolean().default(true),
        order: zod_1.z.number().int().default(0),
    }),
});
// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class TestimonialsService {
    async findAll(publishedOnly = true) {
        const cacheKey = `${redis_1.CACHE_KEYS.testimonials}:${publishedOnly}`;
        const cached = await redis_1.cache.get(cacheKey);
        if (cached)
            return cached;
        const testimonials = await database_1.prisma.testimonial.findMany({
            where: publishedOnly ? { published: true } : {},
            orderBy: [{ featured: 'desc' }, { order: 'asc' }],
        });
        await redis_1.cache.set(cacheKey, testimonials, 300);
        return testimonials;
    }
    async create(data) {
        const testimonial = await database_1.prisma.testimonial.create({ data });
        await redis_1.cache.invalidatePattern(`${redis_1.CACHE_KEYS.testimonials}*`);
        return testimonial;
    }
    async update(id, data) {
        const exists = await database_1.prisma.testimonial.findUnique({ where: { id } });
        if (!exists)
            throw new AppError_1.NotFoundError('Testimonial');
        const updated = await database_1.prisma.testimonial.update({ where: { id }, data });
        await redis_1.cache.invalidatePattern(`${redis_1.CACHE_KEYS.testimonials}*`);
        return updated;
    }
    async delete(id) {
        const exists = await database_1.prisma.testimonial.findUnique({ where: { id } });
        if (!exists)
            throw new AppError_1.NotFoundError('Testimonial');
        await database_1.prisma.testimonial.delete({ where: { id } });
        await redis_1.cache.invalidatePattern(`${redis_1.CACHE_KEYS.testimonials}*`);
    }
    async toggleLike(id, ipAddress) {
        const testimonial = await database_1.prisma.testimonial.findUnique({ where: { id } });
        if (!testimonial)
            throw new AppError_1.NotFoundError('Testimonial');
        const existingLike = await database_1.prisma.testimonialLike.findUnique({
            where: { testimonialId_ipAddress: { testimonialId: id, ipAddress } },
        });
        if (existingLike) {
            // Unlike
            await Promise.all([
                database_1.prisma.testimonialLike.delete({ where: { id: existingLike.id } }),
                database_1.prisma.testimonial.update({
                    where: { id },
                    data: { likes: { decrement: 1 } },
                }),
            ]);
            return { liked: false, likes: Math.max(0, testimonial.likes - 1) };
        }
        else {
            // Like
            const [, updated] = await Promise.all([
                database_1.prisma.testimonialLike.create({ data: { testimonialId: id, ipAddress } }),
                database_1.prisma.testimonial.update({
                    where: { id },
                    data: { likes: { increment: 1 } },
                }),
            ]);
            return { liked: true, likes: updated.likes };
        }
    }
    async getLikeStatus(id, ipAddress) {
        const like = await database_1.prisma.testimonialLike.findUnique({
            where: { testimonialId_ipAddress: { testimonialId: id, ipAddress } },
        });
        return !!like;
    }
}
const testimonialsService = new TestimonialsService();
// ─────────────────────────────────────────────────────────
// Routes — /api/v1/testimonials
// ─────────────────────────────────────────────────────────
exports.testimonialsRouter = (0, express_1.Router)();
exports.testimonialsRouter.get('/', async (req, res) => {
    const isAdmin = !!req.user;
    const list = await testimonialsService.findAll(!isAdmin);
    (0, response_1.sendSuccess)(res, list);
});
exports.testimonialsRouter.post('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validate)(testimonialSchema), async (req, res) => {
    const t = await testimonialsService.create(req.body);
    (0, response_1.sendCreated)(res, t, 'Testimonial created');
});
exports.testimonialsRouter.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    const t = await testimonialsService.update(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, t, 'Testimonial updated');
});
exports.testimonialsRouter.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    await testimonialsService.delete(req.params.id);
    (0, response_1.sendNoContent)(res);
});
// Like toggle — public with IP deduplication
exports.testimonialsRouter.post('/:id/like', rateLimit_middleware_1.strictLimiter, async (req, res) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const result = await testimonialsService.toggleLike(req.params.id, ip);
    (0, response_1.sendSuccess)(res, result);
});
exports.testimonialsRouter.get('/:id/like-status', async (req, res) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const liked = await testimonialsService.getLikeStatus(req.params.id, ip);
    (0, response_1.sendSuccess)(res, { liked });
});
//# sourceMappingURL=testimonials.routes.js.map