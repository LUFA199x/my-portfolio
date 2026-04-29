"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const cloudinary_1 = require("../../shared/utils/cloudinary");
const database_1 = require("../../config/database");
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
const config_1 = require("../../config");
// ─────────────────────────────────────────────────────────
// Multer — memory storage (buffer → Cloudinary)
// ─────────────────────────────────────────────────────────
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter(_req, file, cb) {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            cb(new AppError_1.BadRequestError('Only JPEG, PNG, and WebP images are allowed'));
            return;
        }
        cb(null, true);
    },
});
// ─────────────────────────────────────────────────────────
// Routes — /api/v1/uploads
// ─────────────────────────────────────────────────────────
exports.uploadsRouter = (0, express_1.Router)();
// Upload single image (general purpose)
exports.uploadsRouter.post('/image', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file)
        throw new AppError_1.BadRequestError('No image file provided');
    const folder = req.query.folder || config_1.config.CLOUDINARY_UPLOAD_FOLDER;
    const result = await (0, cloudinary_1.uploadImageBuffer)(req.file.buffer, folder);
    (0, response_1.sendCreated)(res, result, 'Image uploaded');
});
// Upload project cover image
exports.uploadsRouter.post('/projects/:id/cover', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file)
        throw new AppError_1.BadRequestError('No image file provided');
    const project = await database_1.prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    const result = await (0, cloudinary_1.uploadImageBuffer)(req.file.buffer, `${config_1.config.CLOUDINARY_UPLOAD_FOLDER}/projects`, {
        tags: ['project', 'cover'],
    });
    const updated = await database_1.prisma.project.update({
        where: { id: req.params.id },
        data: { coverImage: result.secureUrl },
    });
    (0, response_1.sendSuccess)(res, { project: updated, image: result }, 'Cover image updated');
});
// Upload project gallery images (up to 10 at once)
exports.uploadsRouter.post('/projects/:id/images', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload.array('images', 10), async (req, res) => {
    const files = req.files;
    if (!files?.length)
        throw new AppError_1.BadRequestError('No images provided');
    const project = await database_1.prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project)
        throw new AppError_1.NotFoundError('Project');
    const uploaded = await Promise.all(files.map((file, i) => (0, cloudinary_1.uploadImageBuffer)(file.buffer, `${config_1.config.CLOUDINARY_UPLOAD_FOLDER}/projects`, {
        tags: ['project', 'gallery'],
    }).then((result) => database_1.prisma.projectImage.create({
        data: {
            projectId: req.params.id,
            url: result.secureUrl,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            order: i,
        },
    }))));
    (0, response_1.sendCreated)(res, uploaded, `${uploaded.length} image(s) uploaded`);
});
// Delete a project gallery image
exports.uploadsRouter.delete('/images/:imageId', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    const image = await database_1.prisma.projectImage.findUnique({ where: { id: req.params.imageId } });
    if (!image)
        throw new AppError_1.NotFoundError('Image');
    await Promise.all([
        (0, cloudinary_1.deleteImage)(image.publicId),
        database_1.prisma.projectImage.delete({ where: { id: image.id } }),
    ]);
    (0, response_1.sendSuccess)(res, null, 'Image deleted');
});
// Upload testimonial avatar
exports.uploadsRouter.post('/testimonials/:id/avatar', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload.single('avatar'), async (req, res) => {
    if (!req.file)
        throw new AppError_1.BadRequestError('No image file provided');
    const result = await (0, cloudinary_1.uploadImageBuffer)(req.file.buffer, `${config_1.config.CLOUDINARY_UPLOAD_FOLDER}/avatars`, {
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    });
    const updated = await database_1.prisma.testimonial.update({
        where: { id: req.params.id },
        data: { avatar: result.secureUrl },
    });
    (0, response_1.sendSuccess)(res, { testimonial: updated, image: result }, 'Avatar uploaded');
});
//# sourceMappingURL=uploads.routes.js.map