export interface Project {
  id: string
  title: string
  slug: string
  category: string
  year: string
  summary: string
  coverImage: string
  featured: boolean
  published: boolean
}

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'f1',
    title: 'Studio Series',
    slug: 'studio-series',
    category: 'Portrait · Photography',
    year: '2024',
    summary: 'Clean studio work with a focus on natural light and effortless posing. Every frame breathes.',
    coverImage: 'https://picsum.photos/seed/proj1/600/700',
    featured: true,
    published: true,
  },
  {
    id: 'f2',
    title: 'Smoke & Silence',
    slug: 'smoke-and-silence',
    category: 'Portrait · B&W',
    year: '2024',
    summary: 'Black and white portraiture exploring masculine stillness. Minimal props, maximum presence.',
    coverImage: 'https://picsum.photos/seed/proj2/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'f3',
    title: 'Edric — 3 Months',
    slug: 'edric-3-months',
    category: 'Family · Lifestyle',
    year: '2024',
    summary: 'A milestone session filled with sunflowers, laughter, and that new-baby magic.',
    coverImage: 'https://picsum.photos/seed/proj3/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'f4',
    title: 'Soft Morning',
    slug: 'soft-morning',
    category: 'Fashion · Studio',
    year: '2024',
    summary: 'An all-white editorial about slowness. We let the light do all the talking.',
    coverImage: 'https://picsum.photos/seed/proj4/600/700',
    featured: true,
    published: true,
  },
  {
    id: 'f5',
    title: 'Golden Field',
    slug: 'golden-field',
    category: 'Outdoor · Lifestyle',
    year: '2023',
    summary: 'Chasing golden hour on the edge of Lagos. Grass, sky, and a single figure reading.',
    coverImage: 'https://picsum.photos/seed/proj5/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'f6',
    title: 'Urban Canopy',
    slug: 'urban-canopy',
    category: 'Street · Nature',
    year: '2023',
    summary: 'Looking up at Lagos — tree canopies framing architecture in unexpected ways.',
    coverImage: 'https://picsum.photos/seed/proj6/600/700',
    featured: false,
    published: true,
  },
]
