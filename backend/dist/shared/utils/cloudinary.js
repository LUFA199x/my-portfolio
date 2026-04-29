"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageBuffer = uploadImageBuffer;
exports.deleteImage = deleteImage;
exports.getOptimisedUrl = getOptimisedUrl;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../../config");
const AppError_1 = require("../errors/AppError");
cloudinary_1.v2.config({
    cloud_name: config_1.config.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.config.CLOUDINARY_API_KEY,
    api_secret: config_1.config.CLOUDINARY_API_SECRET,
    secure: true,
});
// ─────────────────────────────────────────────────────────
// Upload from buffer (multer memory storage)
// ─────────────────────────────────────────────────────────
async function uploadImageBuffer(buffer, folder = config_1.config.CLOUDINARY_UPLOAD_FOLDER, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
            max_bytes: 10 * 1024 * 1024, // 10 MB
            transformation: options.transformation ?? [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
            tags: options.tags,
            public_id: options.filename,
        }, (error, result) => {
            if (error || !result) {
                reject(new AppError_1.AppError(`Image upload failed: ${error?.message}`, 500));
                return;
            }
            resolve(mapUploadResult(result));
        });
        uploadStream.end(buffer);
    });
}
// ─────────────────────────────────────────────────────────
// Delete image
// ─────────────────────────────────────────────────────────
async function deleteImage(publicId) {
    await cloudinary_1.v2.uploader.destroy(publicId);
}
// ─────────────────────────────────────────────────────────
// Generate optimised URL variants
// ─────────────────────────────────────────────────────────
function getOptimisedUrl(publicId, options = {}) {
    return cloudinary_1.v2.url(publicId, {
        quality: options.quality ?? 'auto:good',
        fetch_format: 'auto',
        width: options.width,
        height: options.height,
        crop: options.width || options.height ? 'fill' : undefined,
        secure: true,
    });
}
// ─────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────
function mapUploadResult(result) {
    return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
    };
}
//# sourceMappingURL=cloudinary.js.map