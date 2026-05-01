import { z } from 'zod'
import slugify from 'slugify'
import { Router, Request, Response } from 'express'
import { prisma } from '../../config/database'
import { cache, CACHE_KEYS } from '../../config/redis'
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent } from '../../shared/utils/response'
import { NotFoundError } from '../../shared/errors/AppError'

const serviceSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    active: z.boolean().default(true),
    order: z.number().int().default(0),
  }),
})

export const servicesRouter = Router()

servicesRouter.get('/', optionalAuth, async (req, res) => {
  const cached = await cache.get(CACHE_KEYS.services)
  if (cached) { sendSuccess(res, cached); return }

  const isAdmin = !!req.user
  const services = await prisma.service.findMany({
    where: isAdmin ? {} : { active: true },
    orderBy: { order: 'asc' },
  })

  await cache.set(CACHE_KEYS.services, services, 600)
  sendSuccess(res, services)
})

servicesRouter.post('/', authenticate, requireAdmin, validate(serviceSchema), async (req, res) => {
  const slug = slugify(req.body.name, { lower: true, strict: true })
  const service = await prisma.service.create({ data: { ...req.body, slug } })
  await cache.del(CACHE_KEYS.services)
  sendCreated(res, service, 'Service created')
})

servicesRouter.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } })
  if (!service) throw new NotFoundError('Service')
  const updated = await prisma.service.update({ where: { id: req.params.id }, data: req.body })
  await cache.del(CACHE_KEYS.services)
  sendSuccess(res, updated, 'Service updated')
})

servicesRouter.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } })
  if (!service) throw new NotFoundError('Service')
  await prisma.service.delete({ where: { id: req.params.id } })
  await cache.del(CACHE_KEYS.services)
  sendNoContent(res)
})

// Reorder services
servicesRouter.post('/reorder', authenticate, requireAdmin, async (req, res) => {
  const { order }: { order: { id: string; order: number }[] } = req.body
  await Promise.all(
    order.map(({ id, order: o }) => prisma.service.update({ where: { id }, data: { order: o } }))
  )
  await cache.del(CACHE_KEYS.services)
  sendSuccess(res, null, 'Services reordered')
})
