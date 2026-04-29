import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { config } from '../../config'
import { AppError } from '../errors/AppError'

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadResult {
  url: string
  secureUrl: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

// ─────────────────────────────────────────────────────────
// Upload from buffer (multer memory storage)
// ─────────────────────────────────────────────────────────
export async function uploadImageBuffer(
  buffer: Buffer,
  folder = config.CLOUDINARY_UPLOAD_FOLDER,
  options: {
    transformation?: object[]
    tags?: string[]
    filename?: string
  } = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
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
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError(`Image upload failed: ${error?.message}`, 500))
          return
        }
        resolve(mapUploadResult(result))
      }
    )
    uploadStream.end(buffer)
  })
}

// ─────────────────────────────────────────────────────────
// Delete image
// ─────────────────────────────────────────────────────────
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

// ─────────────────────────────────────────────────────────
// Generate optimised URL variants
// ─────────────────────────────────────────────────────────
export function getOptimisedUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  return cloudinary.url(publicId, {
    quality: options.quality ?? 'auto:good',
    fetch_format: 'auto',
    width: options.width,
    height: options.height,
    crop: options.width || options.height ? 'fill' : undefined,
    secure: true,
  })
}

// ─────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────
function mapUploadResult(result: UploadApiResponse): UploadResult {
  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}
