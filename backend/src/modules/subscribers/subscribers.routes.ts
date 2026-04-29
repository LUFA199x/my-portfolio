import { z } from 'zod'
import { Router, Request, Response } from 'express'
import { prisma } from '../../config/database'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { strictLimiter } from '../../middleware/rateLimit.middleware'
import { validate } from '../../middleware/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent, parsePagination, buildPaginationMeta } from '../../shared/utils/response'
import { ConflictError, NotFoundError } from '../../shared/errors/AppError'
import { emailService } from '../../shared/utils/email'

// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    source: z.string().max(50).optional(),
  }),
})

// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class SubscribersService {
  async subscribe(email: string, source?: string) {
    const existing = await prisma.subscriber.findUnique({ where: { email } })

    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new ConflictError("You're already subscribed!")
      }
      // Re-subscribe if previously unsubscribed
      const updated = await prisma.subscriber.update({
        where: { email },
        data: { status: 'ACTIVE', source },
      })
      return { subscriber: updated, isNew: false }
    }

    const subscriber = await prisma.subscriber.create({ data: { email, source } })

    // Send welcome email in background
    emailService.sendSubscriberWelcome(email, subscriber.unsubToken).catch(() => {})

    return { subscriber, isNew: true }
  }

  async unsubscribe(token: string) {
    const subscriber = await prisma.subscriber.findFirst({
      where: { unsubToken: token },
    })
    if (!subscriber) throw new NotFoundError('Subscription')

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: 'UNSUBSCRIBED' },
    })
  }

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 50 } = query
    const skip = (page - 1) * limit
    const where = query.status ? { status: query.status as never } : {}

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, email: true, status: true, source: true, createdAt: true },
      }),
      prisma.subscriber.count({ where }),
    ])

    return { subscribers, meta: buildPaginationMeta(total, page, limit) }
  }

  async getStats() {
    const [total, active, unsubscribed] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
    ])
    return { total, active, unsubscribed }
  }
}

const subscribersService = new SubscribersService()

// ─────────────────────────────────────────────────────────
// Routes — /api/v1/subscribers
// ─────────────────────────────────────────────────────────
export const subscribersRouter = Router()

subscribersRouter.post('/', strictLimiter, validate(subscribeSchema), async (req, res) => {
  const { email, source } = req.body
  const { isNew } = await subscribersService.subscribe(email, source)
  const message = isNew ? "You're on the list!" : 'Welcome back!'
  sendCreated(res, null, message)
})

subscribersRouter.post('/unsubscribe', async (req, res) => {
  const { token } = req.body
  await subscribersService.unsubscribe(token)
  sendSuccess(res, null, 'Successfully unsubscribed')
})

subscribersRouter.get('/', authenticate, requireAdmin, async (req, res) => {
  const { page, limit } = parsePagination(req.query as Record<string, string>)
  const result = await subscribersService.findAll({
    page,
    limit,
    status: req.query.status as string | undefined,
  })
  sendSuccess(res, result.subscribers, undefined, 200, result.meta)
})

subscribersRouter.get('/stats', authenticate, requireAdmin, async (_req, res) => {
  const stats = await subscribersService.getStats()
  sendSuccess(res, stats)
})
