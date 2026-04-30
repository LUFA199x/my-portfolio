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
    id: 'project-photography',
    title: 'Studio Series',
    slug: 'studio-series',
    category: 'Photography',
    year: '2024',
    summary: 'Clean studio work with a focus on natural light and effortless posing. Every frame breathes.',
    coverImage: 'https://picsum.photos/seed/proj1/600/700',
    featured: true,
    published: true,
  },
  {
    id: 'project-portrait',
    title: 'Smoke & Silence',
    slug: 'smoke-and-silence',
    category: 'Portrait',
    year: '2024',
    summary: 'Black and white portraiture exploring masculine stillness. Minimal props, maximum presence.',
    coverImage: 'https://picsum.photos/seed/proj2/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'project-fashion-shoots',
    title: 'Soft Morning',
    slug: 'soft-morning',
    category: 'Fashion Shoots',
    year: '2024',
    summary: 'An all-white editorial about slowness. We let the light do all the talking.',
    coverImage: 'https://picsum.photos/seed/proj4/600/700',
    featured: true,
    published: true,
  },
  {
    id: 'project-street',
    title: 'Urban Canopy',
    slug: 'urban-canopy',
    category: 'Street',
    year: '2023',
    summary: 'Looking up at Lagos — tree canopies framing architecture in unexpected ways.',
    coverImage: 'https://picsum.photos/seed/proj6/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'project-creative-direction',
    title: 'Golden Hour Edit',
    slug: 'golden-hour-edit',
    category: 'Creative Direction',
    year: '2024',
    summary: 'A fully directed shoot — concept, wardrobe, location scouting, and final edit all in one vision.',
    coverImage: 'https://picsum.photos/seed/proj7/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'project-couples',
    title: 'Golden Field',
    slug: 'golden-field',
    category: 'Couples',
    year: '2023',
    summary: 'Chasing golden hour on the edge of Lagos. Grass, sky, and two people lost in each other.',
    coverImage: 'https://picsum.photos/seed/proj5/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'project-iphone-shots',
    title: 'Everyday Lagos',
    slug: 'everyday-lagos',
    category: 'iPhone Shots',
    year: '2024',
    summary: 'Unfiltered city life shot entirely on iPhone. The streets talk when you stop and listen.',
    coverImage: 'https://picsum.photos/seed/proj8/600/700',
    featured: false,
    published: true,
  },
  {
    id: 'project-film',
    title: 'Edric — 3 Months',
    slug: 'edric-3-months',
    category: 'Film',
    year: '2024',
    summary: 'A milestone session filled with sunflowers, laughter, and that new-baby magic.',
    coverImage: 'https://picsum.photos/seed/proj3/600/700',
    featured: false,
    published: true,
  },
]
