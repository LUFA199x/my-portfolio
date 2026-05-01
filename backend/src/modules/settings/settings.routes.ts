import { z } from 'zod'
import { Router } from 'express'
import { prisma } from '../../config/database'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { cache, CACHE_KEYS } from '../../config/redis'
import { sendSuccess } from '../../shared/utils/response'

const updateSettingSchema = z.object({
  body: z.object({ value: z.string(), label: z.string().optional() }),
  params: z.object({ key: z.string() }),
})

const batchUpdateSchema = z.object({
  body: z.object({
    settings: z.array(z.object({ key: z.string(), value: z.string() })),
  }),
})

export const settingsRouter = Router()

// Public — frontend reads site settings
settingsRouter.get('/', async (_req, res) => {
  const cached = await cache.get(CACHE_KEYS.settings)
  if (cached) { sendSuccess(res, cached); return }

  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
  await cache.set(CACHE_KEYS.settings, settings, 600)
  sendSuccess(res, settings)
})

// Admin — batch update multiple settings at once
settingsRouter.patch(
  '/batch',
  authenticate,
  requireAdmin,
  validate(batchUpdateSchema),
  async (req, res) => {
    const { settings } = req.body as { settings: { key: string; value: string }[] }
    const results = await prisma.$transaction(
      settings.map(({ key, value }) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, label: key },
        })
      )
    )
    await cache.del(CACHE_KEYS.settings)
    sendSuccess(res, results, 'Settings saved')
  }
)

// Admin — update a single setting by key
settingsRouter.patch(
  '/:key',
  authenticate,
  requireAdmin,
  validate(updateSettingSchema),
  async (req, res) => {
    const { key } = req.params
    const { value, label } = req.body as { value: string; label?: string }
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value, ...(label ? { label } : {}) },
      create: { key, value, label: label ?? key },
    })
    await cache.del(CACHE_KEYS.settings)
    sendSuccess(res, setting, 'Setting updated')
  }
)
