"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const zod_1 = require("zod");
const slugify_1 = __importDefault(require("slugify"));
const express_1 = require("express");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
const cloudinary_1 = require("../../shared/utils/cloudinary");
// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(200),
        category: zod_1.z.string().min(1).max(100),
        year: zod_1.z.string().regex(/^\d{4}$/),
        summary: zod_1.z.string().min(1).max(500),
        description: zod_1.z.string().optional(),
        coverImage: zod_1.z.string().url(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        featured: zod_1.z.boolean().default(false),
        published: zod_1.z.boolean().default(true),
        order: zod_1.z.number().int().default(0),
    }),
});
const updateProjectSchema = zod_1.z.object({
    body: createProjectSchema.shape.body.partial(),
    params: zod_1.z.object({ id: zod_1.z.string() }),
});
// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class ProjectsService {
    async findAll(query) {
        const cacheKey = `${redis_1.CACHE_KEYS.projects}:${JSON.stringify(query)}`;
        const cached = await redis_1.cache.get(cacheKey);
        if (cached)
            return cached;
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {
            ...(query.published !== undefined && { published: query.published }),
            ...(query.featured !== undefined && { featured: query.featured }),
            ...(query.category && { category: { contains: query.category, mode: 'insensitive' } }),
        };
        const [projects, total] = await Promise.all([
            database_1.prisma.project.findMany({
                where,
                orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
                include: { images: { orderBy: { order: 'asc' }, take: 5 } },
            }),
            database_1.prisma.project.count({ where }),
        ]);
        const result = { projects, meta: (0, response_1.buildPaginationMeta)(total, page, limit) };
        await redis_1.cache.set(cacheKey, result, 300); // 5 min
        return result;
    }
    async findBySlug(slug) {
        const cacheKey = redis_1.CACHE_KEYS.project(slug);
        const cached = await redis_1.cache.get(cacheKey);
        if (cached)
            return cached;
        const project = await database_1.prisma.project.findUnique({
            where: { slug },
            include: { images: { orderBy: { order: 'asc' } } },
        });
        if (!project)
            throw new AppError_1.NotFoundError('Project');
        // Increment view count (fire-and-forget)
        database_1.prisma.project.update({ where: { id: project.id }, data: { viewCount: { increment: 1 } } }).catch(() => { });
        await redis_1.cache.set(cacheKey, project, 600);
        return project;
    }
    async create(data) {
        const slug = (0, slugify_1.default)(data.title, { lower: true, strict: true });
        const existing = await database_1.prisma.project.findUnique({ where: { slug } });
        if (existing)
            throw new AppError_1.ConflictError('A project with this title already exists');
        const project = await database_1.prisma.project.create({ data: { ...data, slug } });
        await redis_1.cache.invalidatePattern('projects:*');
        return project;
    }
    async update(id, data) {
        const project = await database_1.prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new AppError_1.NotFoundError('Project');
        let slug = project.slug;
        if (data.title && data.title !== project.title) {
            slug = (0, slugify_1.default)(data.title, { lower: true, strict: true });
            const existing = await database_1.prisma.project.findFirst({ where: { slug, NOT: { id } } });
            if (existing)
                throw new AppError_1.ConflictError('Title already taken');
        }
        const updated = await database_1.prisma.project.update({
            where: { id },
            data: { ...data, slug },
            include: { images: true },
        });
        await redis_1.cache.invalidatePattern('projects:*');
        await redis_1.cache.del(redis_1.CACHE_KEYS.project(project.slug));
        return updated;
    }
    async delete(id) {
        const project = await database_1.prisma.project.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!project)
            throw new AppError_1.NotFoundError('Project');
        // Delete all Cloudinary images
        await Promise.allSettled([
            ...project.images.map((img) => (0, cloudinary_1.deleteImage)(img.publicId)),
        ]);
        await database_1.prisma.project.delete({ where: { id } });
        await redis_1.cache.invalidatePattern('projects:*');
        await redis_1.cache.del(redis_1.CACHE_KEYS.project(project.slug));
    }
}
const projectsService = new ProjectsService();
// ─────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────
class ProjectsController {
    async list(req, res) {
        const { page, limit } = (0, response_1.parsePagination)(req.query);
        const isAdmin = !!req.user;
        const result = await projectsService.findAll({
            page,
            limit,
            published: isAdmin ? undefined : true,
            featured: req.query.featured === 'true' ? true : undefined,
            category: req.query.category,
        });
        (0, response_1.sendSuccess)(res, result.projects, undefined, 200, result.meta);
    }
    async getBySlug(req, res) {
        const project = await projectsService.findBySlug(req.params.slug);
        (0, response_1.sendSuccess)(res, project);
    }
    async create(req, res) {
        const project = await projectsService.create(req.body);
        (0, response_1.sendCreated)(res, project, 'Project created');
    }
    async update(req, res) {
        const project = await projectsService.update(req.params.id, req.body);
        (0, response_1.sendSuccess)(res, project, 'Project updated');
    }
    async remove(req, res) {
        await projectsService.delete(req.params.id);
        (0, response_1.sendNoContent)(res);
    }
}
const ctrl = new ProjectsController();
// ─────────────────────────────────────────────────────────
// Routes — /api/v1/projects
// ─────────────────────────────────────────────────────────
exports.projectsRouter = (0, express_1.Router)();
exports.projectsRouter.get('/', (req, res) => ctrl.list(req, res));
exports.projectsRouter.get('/:slug', (req, res) => ctrl.getBySlug(req, res));
exports.projectsRouter.post('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validate)(createProjectSchema), (req, res) => ctrl.create(req, res));
exports.projectsRouter.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validate)(updateProjectSchema), (req, res) => ctrl.update(req, res));
exports.projectsRouter.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (req, res) => ctrl.remove(req, res));
//# sourceMappingURL=projects.routes.js.map