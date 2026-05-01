import { z } from 'zod'
import { Router, Request, Response } from 'express'
import { prisma } from '../../config/database'
import { cache, CACHE_KEYS } from '../../config/redis'
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware'
import { strictLimiter } from '../../middleware/rateLimit.middleware'
import { validate } from '../../middleware/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent } from '../../shared/utils/response'
import { NotFoundError } from '../../shared/errors/AppError'

// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const testimonialSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    role: z.string().min(1).max(100),
    company: z.string().max(100).optional(),
    text: z.string().min(20).max(1000),
    avatar: z.string().url().optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    order: z.number().int().default(0),
  }),
})

// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class TestimonialsService {
  async findAll(publishedOnly = true) {
    const cacheKey = `${CACHE_KEYS.testimonials}:${publishedOnly}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    const testimonials = await prisma.testimonial.findMany({
      where: publishedOnly ? { published: true } : {},
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    })

    await cache.set(cacheKey, testimonials, 300)
    return testimonials
  }

  async create(data: z.infer<typeof testimonialSchema>['body']) {
    const testimonial = await prisma.testimonial.create({ data })
    await cache.invalidatePattern(`${CACHE_KEYS.testimonials}*`)
    return testimonial
  }

  async update(id: string, data: Partial<z.infer<typeof testimonialSchema>['body']>) {
    const exists = await prisma.testimonial.findUnique({ where: { id } })
    if (!exists) throw new NotFoundError('Testimonial')
    const updated = await prisma.testimonial.update({ where: { id }, data })
    await cache.invalidatePattern(`${CACHE_KEYS.testimonials}*`)
    return updated
  }

  async delete(id: string) {
    const exists = await prisma.testimonial.findUnique({ where: { id } })
    if (!exists) throw new NotFoundError('Testimonial')
    await prisma.testimonial.delete({ where: { id } })
    await cache.invalidatePattern(`${CACHE_KEYS.testimonials}*`)
  }

  async toggleLike(id: string, ipAddress: string): Promise<{ liked: boolean; likes: number }> {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } })
    if (!testimonial) throw new NotFoundError('Testimonial')

    const existingLike = await prisma.testimonialLike.findUnique({
      where: { testimonialId_ipAddress: { testimonialId: id, ipAddress } },
    })

    if (existingLike) {
      // Unlike
      await Promise.all([
        prisma.testimonialLike.delete({ where: { id: existingLike.id } }),
        prisma.testimonial.update({
          where: { id },
          data: { likes: { decrement: 1 } },
        }),
      ])
      return { liked: false, likes: Math.max(0, testimonial.likes - 1) }
    } else {
      // Like
      const [, updated] = await Promise.all([
        prisma.testimonialLike.create({ data: { testimonialId: id, ipAddress } }),
        prisma.testimonial.update({
          where: { id },
          data: { likes: { increment: 1 } },
        }),
      ])
      return { liked: true, likes: updated.likes }
    }
  }

  async getLikeStatus(id: string, ipAddress: string): Promise<boolean> {
    const like = await prisma.testimonialLike.findUnique({
      where: { testimonialId_ipAddress: { testimonialId: id, ipAddress } },
    })
    return !!like
  }
}

const testimonialsService = new TestimonialsService()

// ─────────────────────────────────────────────────────────
// Routes — /api/v1/testimonials
// ─────────────────────────────────────────────────────────
export const testimonialsRouter = Router()

testimonialsRouter.get('/', optionalAuth, async (req, res) => {
  const isAdmin = !!req.user
  const list = await testimonialsService.findAll(!isAdmin)
  sendSuccess(res, list)
})

testimonialsRouter.post('/', authenticate, requireAdmin, validate(testimonialSchema), async (req, res) => {
  const t = await testimonialsService.create(req.body)
  sendCreated(res, t, 'Testimonial created')
})

testimonialsRouter.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const t = await testimonialsService.update(req.params.id, req.body)
  sendSuccess(res, t, 'Testimonial updated')
})

testimonialsRouter.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await testimonialsService.delete(req.params.id)
  sendNoContent(res)
})

// Like toggle — public with IP deduplication
testimonialsRouter.post('/:id/like', strictLimiter, async (req, res) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown'
  const result = await testimonialsService.toggleLike(req.params.id, ip)
  sendSuccess(res, result)
})

testimonialsRouter.get('/:id/like-status', async (req, res) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown'
  const liked = await testimonialsService.getLikeStatus(req.params.id, ip)
  sendSuccess(res, { liked })
})
