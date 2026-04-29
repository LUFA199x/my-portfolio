import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/config/database'

describe('POST /api/v1/contact', () => {
  afterAll(async () => {
    await prisma.contactInquiry.deleteMany()
    await prisma.$disconnect()
  })

  it('creates a contact inquiry and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        location: 'Lagos, Nigeria',
        message: 'Hello, I would like to book a portrait session.',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
  })

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({ email: 'not-an-email', name: 'Test', message: 'Hello hello hello hello hello' })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects message that is too short', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({ email: 'test@example.com', name: 'Test', message: 'Hi' })

    expect(res.status).toBe(422)
  })
})

describe('GET /api/v1/projects (public)', () => {
  it('returns published projects', async () => {
    const res = await request(app).get('/api/v1/projects')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('respects pagination', async () => {
    const res = await request(app).get('/api/v1/projects?page=1&limit=2')

    expect(res.status).toBe(200)
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 2,
    })
  })
})

describe('POST /api/v1/testimonials/:id/like', () => {
  it('toggles a like and returns liked status', async () => {
    // First get a testimonial
    const listRes = await request(app).get('/api/v1/testimonials')
    if (!listRes.body.data?.length) return // skip if no testimonials

    const id = listRes.body.data[0].id

    const res = await request(app).post(`/api/v1/testimonials/${id}/like`)
    expect(res.status).toBe(200)
    expect(typeof res.body.data.liked).toBe('boolean')
    expect(typeof res.body.data.likes).toBe('number')
  })
})
