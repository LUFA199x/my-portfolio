import { z } from 'zod'
import { Router, Request, Response } from 'express'
import { prisma } from '../../config/database'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { strictLimiter } from '../../middleware/rateLimit.middleware'
import { validate } from '../../middleware/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent, parsePagination, buildPaginationMeta } from '../../shared/utils/response'
import { NotFoundError } from '../../shared/errors/AppError'
import { emailService } from '../../shared/utils/email'

// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const createInquirySchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    location: z.string().max(100).optional(),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  }),
})

const updateInquirySchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
    notes: z.string().max(1000).optional(),
  }),
  params: z.object({ id: z.string() }),
})

// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class ContactService {
  async submit(data: z.infer<typeof createInquirySchema>['body']) {
    const inquiry = await prisma.contactInquiry.create({ data })

    // Send emails in background (don't block response)
    Promise.all([
      emailService.sendContactConfirmation(data.name, data.email),
      emailService.sendAdminNewInquiry(data),
    ]).catch(() => {})

    return inquiry
  }

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where = query.status ? { status: query.status as never } : {}

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactInquiry.count({ where }),
    ])

    return { inquiries, meta: buildPaginationMeta(total, page, limit) }
  }

  async findById(id: string) {
    const inquiry = await prisma.contactInquiry.findUnique({ where: { id } })
    if (!inquiry) throw new NotFoundError('Inquiry')

    // Auto-mark as read
    if (inquiry.status === 'PENDING') {
      await prisma.contactInquiry.update({ where: { id }, data: { status: 'READ' } })
    }

    return inquiry
  }

  async update(id: string, data: { status?: string; notes?: string }) {
    const inquiry = await prisma.contactInquiry.findUnique({ where: { id } })
    if (!inquiry) throw new NotFoundError('Inquiry')

    const updateData: Record<string, unknown> = { ...data }
    if (data.status === 'REPLIED') updateData.repliedAt = new Date()

    return prisma.contactInquiry.update({ where: { id }, data: updateData as never })
  }

  async delete(id: string): Promise<void> {
    const exists = await prisma.contactInquiry.findUnique({ where: { id } })
    if (!exists) throw new NotFoundError('Inquiry')
    await prisma.contactInquiry.delete({ where: { id } })
  }

  async getStats() {
    const [total, pending, read, replied, archived] = await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'PENDING' } }),
      prisma.contactInquiry.count({ where: { status: 'READ' } }),
      prisma.contactInquiry.count({ where: { status: 'REPLIED' } }),
      prisma.contactInquiry.count({ where: { status: 'ARCHIVED' } }),
    ])
    return { total, pending, read, replied, archived }
  }
}

const contactService = new ContactService()

// ─────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────
class ContactController {
  async submit(req: Request, res: Response) {
    const inquiry = await contactService.submit(req.body)
    sendCreated(res, { id: inquiry.id }, "Message received! We'll be in touch within 24 hours.")
  }

  async list(req: Request, res: Response) {
    const { page, limit } = parsePagination(req.query as Record<string, string>)
    const result = await contactService.findAll({
      page,
      limit,
      status: req.query.status as string | undefined,
    })
    sendSuccess(res, result.inquiries, undefined, 200, result.meta)
  }

  async getOne(req: Request, res: Response) {
    const inquiry = await contactService.findById(req.params.id)
    sendSuccess(res, inquiry)
  }

  async update(req: Request, res: Response) {
    const inquiry = await contactService.update(req.params.id, req.body)
    sendSuccess(res, inquiry, 'Inquiry updated')
  }

  async remove(req: Request, res: Response) {
    await contactService.delete(req.params.id)
    sendNoContent(res)
  }

  async stats(req: Request, res: Response) {
    const stats = await contactService.getStats()
    sendSuccess(res, stats)
  }
}

const ctrl = new ContactController()

// ─────────────────────────────────────────────────────────
// Routes — /api/v1/contact
// ─────────────────────────────────────────────────────────
export const contactRouter = Router()

// Public
contactRouter.post('/', strictLimiter, validate(createInquirySchema), (req, res) => ctrl.submit(req, res))

// Admin only
contactRouter.get('/', authenticate, requireAdmin, (req, res) => ctrl.list(req, res))
contactRouter.get('/stats', authenticate, requireAdmin, (req, res) => ctrl.stats(req, res))
contactRouter.get('/:id', authenticate, requireAdmin, (req, res) => ctrl.getOne(req, res))
contactRouter.patch('/:id', authenticate, requireAdmin, validate(updateInquirySchema), (req, res) => ctrl.update(req, res))
contactRouter.delete('/:id', authenticate, requireAdmin, (req, res) => ctrl.remove(req, res))
