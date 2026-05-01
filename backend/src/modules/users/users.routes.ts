import { z } from 'zod'
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../config/database'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent } from '../../shared/utils/response'
import { NotFoundError, ConflictError } from '../../shared/errors/AppError'

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a digit'),
    name: z.string().min(1).max(100),
    role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
  }),
})

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    role: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
    avatar: z.string().url().optional().nullable(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  }),
  params: z.object({ id: z.string() }),
})

export const usersRouter = Router()

// All user routes require admin
usersRouter.use(authenticate, requireAdmin)

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })
  sendSuccess(res, users)
})

usersRouter.post('/', validate(createUserSchema), async (req, res) => {
  const { email, password, name, role } = req.body as z.infer<typeof createUserSchema>['body']

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new ConflictError('A user with this email already exists')

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  sendCreated(res, user, 'Admin user created')
})

usersRouter.patch('/:id', validate(updateUserSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) throw new NotFoundError('User')

  const { password, ...rest } = req.body
  const data: Record<string, unknown> = { ...rest }
  if (password) data.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, email: true, name: true, role: true, avatar: true, updatedAt: true },
  })
  sendSuccess(res, updated, 'User updated')
})

usersRouter.delete('/:id', async (req, res) => {
  if (req.params.id === req.user!.id) {
    throw new ConflictError('You cannot delete your own account')
  }
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) throw new NotFoundError('User')

  await prisma.session.deleteMany({ where: { userId: req.params.id } })
  await prisma.user.delete({ where: { id: req.params.id } })
  sendNoContent(res)
})
