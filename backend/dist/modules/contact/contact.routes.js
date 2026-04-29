"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
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
const createInquirySchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        location: zod_1.z.string().max(100).optional(),
        message: zod_1.z.string().min(10, 'Message must be at least 10 characters').max(2000),
    }),
});
const updateInquirySchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
        notes: zod_1.z.string().max(1000).optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string() }),
});
// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class ContactService {
    async submit(data) {
        const inquiry = await database_1.prisma.contactInquiry.create({ data });
        // Send emails in background (don't block response)
        Promise.all([
            email_1.emailService.sendContactConfirmation(data.name, data.email),
            email_1.emailService.sendAdminNewInquiry(data),
        ]).catch(() => { });
        return inquiry;
    }
    async findAll(query) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = query.status ? { status: query.status } : {};
        const [inquiries, total] = await Promise.all([
            database_1.prisma.contactInquiry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.contactInquiry.count({ where }),
        ]);
        return { inquiries, meta: (0, response_1.buildPaginationMeta)(total, page, limit) };
    }
    async findById(id) {
        const inquiry = await database_1.prisma.contactInquiry.findUnique({ where: { id } });
        if (!inquiry)
            throw new AppError_1.NotFoundError('Inquiry');
        // Auto-mark as read
        if (inquiry.status === 'PENDING') {
            await database_1.prisma.contactInquiry.update({ where: { id }, data: { status: 'READ' } });
        }
        return inquiry;
    }
    async update(id, data) {
        const inquiry = await database_1.prisma.contactInquiry.findUnique({ where: { id } });
        if (!inquiry)
            throw new AppError_1.NotFoundError('Inquiry');
        const updateData = { ...data };
        if (data.status === 'REPLIED')
            updateData.repliedAt = new Date();
        return database_1.prisma.contactInquiry.update({ where: { id }, data: updateData });
    }
    async delete(id) {
        const exists = await database_1.prisma.contactInquiry.findUnique({ where: { id } });
        if (!exists)
            throw new AppError_1.NotFoundError('Inquiry');
        await database_1.prisma.contactInquiry.delete({ where: { id } });
    }
    async getStats() {
        const [total, pending, read, replied, archived] = await Promise.all([
            database_1.prisma.contactInquiry.count(),
            database_1.prisma.contactInquiry.count({ where: { status: 'PENDING' } }),
            database_1.prisma.contactInquiry.count({ where: { status: 'READ' } }),
            database_1.prisma.contactInquiry.count({ where: { status: 'REPLIED' } }),
            database_1.prisma.contactInquiry.count({ where: { status: 'ARCHIVED' } }),
        ]);
        return { total, pending, read, replied, archived };
    }
}
const contactService = new ContactService();
// ─────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────
class ContactController {
    async submit(req, res) {
        const inquiry = await contactService.submit(req.body);
        (0, response_1.sendCreated)(res, { id: inquiry.id }, "Message received! We'll be in touch within 24 hours.");
    }
    async list(req, res) {
        const { page, limit } = (0, response_1.parsePagination)(req.query);
        const result = await contactService.findAll({
            page,
            limit,
            status: req.query.status,
        });
        (0, response_1.sendSuccess)(res, result.inquiries, undefined, 200, result.meta);
    }
    async getOne(req, res) {
        const inquiry = await contactService.findById(req.params.id);
        (0, response_1.sendSuccess)(res, inquiry);
    }
    async update(req, res) {
        const inquiry = await contactService.update(req.params.id, req.body);
        (0, response_1.sendSuccess)(res, inquiry, 'Inquiry updated');
    }
    async remove(req, res) {
        await contactService.delete(req.params.id);
        (0, response_1.sendNoContent)(res);
    }
    async stats(req, res) {
        const stats = await contactService.getStats();
        (0, response_1.sendSuccess)(res, stats);
    }
}
const ctrl = new ContactController();
// ─────────────────────────────────────────────────────────
// Routes — /api/v1/contact
// ─────────────────────────────────────────────────────────
exports.contactRouter = (0, express_1.Router)();
// Public
exports.contactRouter.post('/', rateLimit_middleware_1.strictLimiter, (0, validate_middleware_1.validate)(createInquirySchema), (req, res) => ctrl.submit(req, res));
// Admin only
exports.contactRouter.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (req, res) => ctrl.list(req, res));
exports.contactRouter.get('/stats', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (req, res) => ctrl.stats(req, res));
exports.contactRouter.get('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (req, res) => ctrl.getOne(req, res));
exports.contactRouter.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validate)(updateInquirySchema), (req, res) => ctrl.update(req, res));
exports.contactRouter.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (req, res) => ctrl.remove(req, res));
//# sourceMappingURL=contact.routes.js.map