import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { config } from '../../config'
import { AppError } from '../errors/AppError'

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)

export interface UploadResult {
  url: string
  secureUrl: string
  publicId: string   // storage path within bucket — used for deletion
  width: number | null
  height: number | null
  format: string
  bytes: number
}

// ─────────────────────────────────────────────────────────
// Upload from buffer (multer memory storage) → Supabase Storage
// ─────────────────────────────────────────────────────────
export async function uploadImageBuffer(
  buffer: Buffer,
  folder = config.SUPABASE_STORAGE_FOLDER,
  options: { filename?: string; mimetype?: string } = {}
): Promise<UploadResult> {
  const mimetype = options.mimetype ?? 'image/jpeg'
  const ext = mimetype.split('/')[1] ?? 'jpg'
  const name = options.filename ?? randomBytes(16).toString('hex')
  const storagePath = `${folder}/${name}.${ext}`

  const { error } = await supabase.storage
    .from(config.SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: mimetype, upsert: false })

  if (error) throw new AppError(`Image upload failed: ${error.message}`, 500)

  const { data } = supabase.storage
    .from(config.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(storagePath)

  return {
    url: data.publicUrl,
    secureUrl: data.publicUrl,
    publicId: storagePath,
    width: null,
    height: null,
    format: ext,
    bytes: buffer.length,
  }
}

// ─────────────────────────────────────────────────────────
// Delete image by storage path
// ─────────────────────────────────────────────────────────
export async function deleteImage(publicId: string): Promise<void> {
  const { error } = await supabase.storage
    .from(config.SUPABASE_STORAGE_BUCKET)
    .remove([publicId])
  if (error) throw new AppError(`Image deletion failed: ${error.message}`, 500)
}

// ─────────────────────────────────────────────────────────
// Get public URL for a stored path
// ─────────────────────────────────────────────────────────
export function getOptimisedUrl(publicId: string): string {
  const { data } = supabase.storage
    .from(config.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(publicId)
  return data.publicUrl
}
