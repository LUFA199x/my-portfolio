import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─────────────────────────────────────────────────────
  // Admin user
  // ─────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.upsert({
    where: { email: 'bookarhday@gmail.com' },
    update: {},
    create: {
      email: 'bookarhday@gmail.com',
      password: hashedPassword,
      name: 'Adegheosa',
      role: Role.SUPER_ADMIN,
    },
  })
  console.log('✅ Admin user created: bookarhday@gmail.com / Admin@1234')

  // ─────────────────────────────────────────────────────
  // Services
  // ─────────────────────────────────────────────────────
  const services = [
    { name: 'Photography', slug: 'photography', order: 1 },
    { name: 'Portrait', slug: 'portrait', order: 2 },
    { name: 'Fashion Shoots', slug: 'fashion-shoots', order: 3 },
    { name: 'Street', slug: 'street', order: 4 },
    { name: 'Creative Direction', slug: 'creative-direction', order: 5 },
    { name: 'Couples', slug: 'couples', order: 6 },
    { name: 'iPhone Shots', slug: 'iphone-shots', order: 7 },
    { name: 'Film', slug: 'film', order: 8 },
  ]

  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: s })
  }
  console.log('✅ Services seeded')

  // ─────────────────────────────────────────────────────
  // Testimonials
  // ─────────────────────────────────────────────────────
  const testimonials = [
    {
      name: 'Michael Johnson',
      role: 'Marketing Manager',
      text: "It felt like every photo had its own narrative. Her use of lighting and color is next-level, and the turnaround time was super fast without compromising quality. If you're looking for someone with both vision and vibe, she's the one.",
      likes: 14,
      featured: true,
      order: 1,
    },
    {
      name: 'Florent Ademaj',
      role: 'Creative Director',
      text: "I hired her for my engagement photos, and honestly, I'm still emotional. She didn't pose us in stiff, forced ways — she let us be ourselves and just captured magic.",
      likes: 9,
      order: 2,
    },
    {
      name: 'Emily Parker',
      role: 'Creative Lead',
      text: 'She played music, adjusted the mood, gave clear direction, and somehow made the awkward moments disappear. The photos were honest, bold, and emotionally charged.',
      likes: 33,
      featured: true,
      order: 3,
    },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t }).catch(() => {}) // skip duplicates on re-seed
  }
  console.log('✅ Testimonials seeded')

  // ─────────────────────────────────────────────────────
  // Sample Projects
  // ─────────────────────────────────────────────────────
  const projects = [
    {
      title: 'Studio Series',
      slug: 'studio-series',
      category: 'Portrait',
      year: '2024',
      summary: 'Clean studio work with a focus on natural light and effortless posing.',
      coverImage: 'https://picsum.photos/seed/proj1/800/1000',
      tags: ['studio', 'portrait', 'fashion'],
      featured: true,
      order: 1,
    },
    {
      title: 'Smoke & Silence',
      slug: 'smoke-and-silence',
      category: 'Portrait',
      year: '2024',
      summary: 'Black and white portraiture exploring masculine stillness.',
      coverImage: 'https://picsum.photos/seed/proj2/800/1000',
      tags: ['bw', 'portrait', 'masculine'],
      order: 2,
    },
    {
      title: 'Golden Field',
      slug: 'golden-field',
      category: 'Outdoor',
      year: '2023',
      summary: 'Chasing golden hour on the edge of Lagos.',
      coverImage: 'https://picsum.photos/seed/proj5/800/1000',
      tags: ['outdoor', 'golden-hour', 'lifestyle'],
      order: 3,
    },
  ]

  for (const p of projects) {
    await prisma.project.upsert({ where: { slug: p.slug }, update: {}, create: p })
  }
  console.log('✅ Projects seeded')

  // ─────────────────────────────────────────────────────
  // Site Settings
  // ─────────────────────────────────────────────────────
  const settings = [
    { key: 'site.name', value: 'ARHDAY Photography', label: 'Site Name' },
    { key: 'site.tagline', value: 'Lights, Lens and Adegheosa.', label: 'Tagline' },
    { key: 'contact.email', value: 'bookarhday@gmail.com', label: 'Contact Email' },
    { key: 'contact.instagram', value: '@_arhday_photography', label: 'Instagram' },
    { key: 'contact.location', value: 'Lagos, Nigeria', label: 'Location' },
  ]

  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s })
  }
  console.log('✅ Site settings seeded')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
