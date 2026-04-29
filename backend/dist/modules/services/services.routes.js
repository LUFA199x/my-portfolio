"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicesRouter = void 0;
const zod_1 = require("zod");
const slugify_1 = __importDefault(require("slugify"));
const express_1 = require("express");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
const serviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(500).optional(),
        icon: zod_1.z.string().optional(),
        active: zod_1.z.boolean().default(true),
        order: zod_1.z.number().int().default(0),
    }),
});
exports.servicesRouter = (0, express_1.Router)();
exports.servicesRouter.get('/', async (req, res) => {
    const cached = await redis_1.cache.get(redis_1.CACHE_KEYS.services);
    if (cached) {
        (0, response_1.sendSuccess)(res, cached);
        return;
    }
    const isAdmin = !!req.user;
    const services = await database_1.prisma.service.findMany({
        where: isAdmin ? {} : { active: true },
        orderBy: { order: 'asc' },
    });
    await redis_1.cache.set(redis_1.CACHE_KEYS.services, services, 600);
    (0, response_1.sendSuccess)(res, services);
});
exports.servicesRouter.post('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validate)(serviceSchema), async (req, res) => {
    const slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true });
    const service = await database_1.prisma.service.create({ data: { ...req.body, slug } });
    await redis_1.cache.del(redis_1.CACHE_KEYS.services);
    (0, response_1.sendCreated)(res, service, 'Service created');
});
exports.servicesRouter.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    const service = await database_1.prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service)
        throw new AppError_1.NotFoundError('Service');
    const updated = await database_1.prisma.service.update({ where: { id: req.params.id }, data: req.body });
    await redis_1.cache.del(redis_1.CACHE_KEYS.services);
    (0, response_1.sendSuccess)(res, updated, 'Service updated');
});
exports.servicesRouter.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    const service = await database_1.prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service)
        throw new AppError_1.NotFoundError('Service');
    await database_1.prisma.service.delete({ where: { id: req.params.id } });
    await redis_1.cache.del(redis_1.CACHE_KEYS.services);
    (0, response_1.sendNoContent)(res);
});
// Reorder services
exports.servicesRouter.post('/reorder', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    const { order } = req.body;
    await Promise.all(order.map(({ id, order: o }) => database_1.prisma.service.update({ where: { id }, data: { order: o } })));
    await redis_1.cache.del(redis_1.CACHE_KEYS.services);
    (0, response_1.sendSuccess)(res, null, 'Services reordered');
});
//# sourceMappingURL=services.routes.js.map