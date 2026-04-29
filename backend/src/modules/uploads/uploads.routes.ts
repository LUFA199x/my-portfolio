import { Router, Request, Response } from 'express'
import multer from 'multer'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { uploadImageBuffer, deleteImage } from '../../shared/utils/cloudinary'
import { prisma } from '../../config/database'
import { sendSuccess, sendCreated } from '../../shared/utils/response'
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError'
import { config } from '../../config'

// ─────────────────────────────────────────────────────────
// Multer — memory storage (buffer → Supabase Storage)
// ─────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new BadRequestError('Only JPEG, PNG, and WebP images are allowed'))
      return
    }
    cb(null, true)
  },
})

// ─────────────────────────────────────────────────────────
// Routes — /api/v1/uploads
// ─────────────────────────────────────────────────────────
export const uploadsRouter = Router()

// Upload single image (general purpose)
uploadsRouter.post('/image', authenticate, requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('No image file provided')

  const folder = (req.query.folder as string) || config.SUPABASE_STORAGE_FOLDER
  const result = await uploadImageBuffer(req.file.buffer, folder, { mimetype: req.file.mimetype })
  sendCreated(res, result, 'Image uploaded')
})

// Upload project cover image
uploadsRouter.post('/projects/:id/cover', authenticate, requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('No image file provided')

  const project = await prisma.project.findUnique({ where: { id: req.params.id } })
  if (!project) throw new NotFoundError('Project')

  const result = await uploadImageBuffer(req.file.buffer, 'projects', { mimetype: req.file.mimetype })

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { coverImage: result.secureUrl },
  })

  sendSuccess(res, { project: updated, image: result }, 'Cover image updated')
})

// Upload project gallery images (up to 10 at once)
uploadsRouter.post('/projects/:id/images', authenticate, requireAdmin, upload.array('images', 10), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files?.length) throw new BadRequestError('No images provided')

  const project = await prisma.project.findUnique({ where: { id: req.params.id } })
  if (!project) throw new NotFoundError('Project')

  const uploaded = await Promise.all(
    files.map((file, i) =>
      uploadImageBuffer(file.buffer, 'projects', { mimetype: file.mimetype }).then((result) =>
        prisma.projectImage.create({
          data: {
            projectId: req.params.id,
            url: result.secureUrl,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            order: i,
          },
        })
      )
    )
  )

  sendCreated(res, uploaded, `${uploaded.length} image(s) uploaded`)
})

// Delete a project gallery image
uploadsRouter.delete('/images/:imageId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const image = await prisma.projectImage.findUnique({ where: { id: req.params.imageId } })
  if (!image) throw new NotFoundError('Image')

  await Promise.all([
    deleteImage(image.publicId),
    prisma.projectImage.delete({ where: { id: image.id } }),
  ])

  sendSuccess(res, null, 'Image deleted')
})

// Upload testimonial avatar
uploadsRouter.post('/testimonials/:id/avatar', authenticate, requireAdmin, upload.single('avatar'), async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('No image file provided')

  const result = await uploadImageBuffer(req.file.buffer, 'avatars', { mimetype: req.file.mimetype })

  const updated = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: { avatar: result.secureUrl },
  })

  sendSuccess(res, { testimonial: updated, image: result }, 'Avatar uploaded')
})
