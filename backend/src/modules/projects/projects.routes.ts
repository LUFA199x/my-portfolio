import { z } from 'zod'
import slugify from 'slugify'
import { Router, Request, Response } from 'express'
import { prisma } from '../../config/database'
import { cache, CACHE_KEYS } from '../../config/redis'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent, parsePagination, buildPaginationMeta } from '../../shared/utils/response'
import { NotFoundError, ConflictError } from '../../shared/errors/AppError'
import { deleteImage } from '../../shared/utils/cloudinary'

// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    category: z.string().min(1).max(100),
    year: z.string().regex(/^\d{4}$/),
    summary: z.string().min(1).max(500),
    description: z.string().optional(),
    coverImage: z.string().url(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    order: z.number().int().default(0),
  }),
})

const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial(),
  params: z.object({ id: z.string() }),
})

type FindAllResult = {
  projects: Awaited<ReturnType<typeof prisma.project.findMany>>
  meta: ReturnType<typeof buildPaginationMeta>
}

// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────
class ProjectsService {

  async findAll(query: {
    page?: number
    limit?: number
    published?: boolean
    featured?: boolean
    category?: string
  }) {
    const cacheKey = `${CACHE_KEYS.projects}:${JSON.stringify(query)}`
    const cached = await cache.get<FindAllResult>(cacheKey)
    if (cached) return cached

    const { page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const where = {
      ...(query.published !== undefined && { published: query.published }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.category && { category: { contains: query.category, mode: 'insensitive' as const } }),
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: { images: { orderBy: { order: 'asc' }, take: 5 } },
      }),
      prisma.project.count({ where }),
    ])

    const result = { projects, meta: buildPaginationMeta(total, page, limit) }
    await cache.set(cacheKey, result, 300) // 5 min
    return result
  }

  async findBySlug(slug: string) {
    const cacheKey = CACHE_KEYS.project(slug)
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    const project = await prisma.project.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    if (!project) throw new NotFoundError('Project')

    // Increment view count (fire-and-forget)
    prisma.project.update({ where: { id: project.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

    await cache.set(cacheKey, project, 600)
    return project
  }

  async create(data: z.infer<typeof createProjectSchema>['body']) {
    const slug = slugify(data.title, { lower: true, strict: true })
    const existing = await prisma.project.findUnique({ where: { slug } })
    if (existing) throw new ConflictError('A project with this title already exists')

    const project = await prisma.project.create({ data: { ...data, slug } })
    await cache.invalidatePattern('projects:*')
    return project
  }

  async update(id: string, data: Partial<z.infer<typeof createProjectSchema>['body']>) {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) throw new NotFoundError('Project')

    let slug = project.slug
    if (data.title && data.title !== project.title) {
      slug = slugify(data.title, { lower: true, strict: true })
      const existing = await prisma.project.findFirst({ where: { slug, NOT: { id } } })
      if (existing) throw new ConflictError('Title already taken')
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { ...data, slug },
      include: { images: true },
    })

    await cache.invalidatePattern('projects:*')
    await cache.del(CACHE_KEYS.project(project.slug))
    return updated
  }

  async delete(id: string): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { images: true },
    })
    if (!project) throw new NotFoundError('Project')

    // Delete all Cloudinary images
    await Promise.allSettled([
      ...project.images.map((img) => deleteImage(img.publicId)),
    ])

    await prisma.project.delete({ where: { id } })
    await cache.invalidatePattern('projects:*')
    await cache.del(CACHE_KEYS.project(project.slug))
  }
}

const projectsService = new ProjectsService()

// ─────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────
class ProjectsController {
  async list(req: Request, res: Response) {
    const { page, limit } = parsePagination(req.query as Record<string, string>)
    const isAdmin = !!req.user
    const result = await projectsService.findAll({
      page,
      limit,
      published: isAdmin ? undefined : true,
      featured: req.query.featured === 'true' ? true : undefined,
      category: req.query.category as string | undefined,
    })
    sendSuccess(res, result.projects, undefined, 200, result.meta)
  }

  async getBySlug(req: Request, res: Response) {
    const project = await projectsService.findBySlug(req.params.slug)
    sendSuccess(res, project)
  }

  async create(req: Request, res: Response) {
    const project = await projectsService.create(req.body)
    sendCreated(res, project, 'Project created')
  }

  async update(req: Request, res: Response) {
    const project = await projectsService.update(req.params.id, req.body)
    sendSuccess(res, project, 'Project updated')
  }

  async remove(req: Request, res: Response) {
    await projectsService.delete(req.params.id)
    sendNoContent(res)
  }
}

const ctrl = new ProjectsController()

// ─────────────────────────────────────────────────────────
// Routes — /api/v1/projects
// ─────────────────────────────────────────────────────────
export const projectsRouter = Router()

projectsRouter.get('/', (req, res) => ctrl.list(req, res))
projectsRouter.get('/:slug', (req, res) => ctrl.getBySlug(req, res))
projectsRouter.post('/', authenticate, requireAdmin, validate(createProjectSchema), (req, res) => ctrl.create(req, res))
projectsRouter.patch('/:id', authenticate, requireAdmin, validate(updateProjectSchema), (req, res) => ctrl.update(req, res))
projectsRouter.delete('/:id', authenticate, requireAdmin, (req, res) => ctrl.remove(req, res))
