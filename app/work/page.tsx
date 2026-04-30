'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Footer from '@/components/Footer'

interface Project {
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

// Shown immediately — replaced by API data when the backend is reachable
const FALLBACK: Project[] = [
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

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }, index * 100)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  return (
    <div
      ref={cardRef}
      className="work-card"
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        height: 'clamp(300px, 40vw, 480px)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image */}
      <div className="absolute inset-0 bg-[#1a1a1a]">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          style={{
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Default bottom label — fades out on hover */}
      <div
        className="work-card-overlay"
        style={{ opacity: hovered ? 0 : 1, transition: 'opacity 0.3s ease' }}
      >
        <p className="text-white text-sm font-medium">See Work.</p>
      </div>

      {/* Hover overlay — full detail panel */}
      <div className="work-card-details">
        <div className="mb-auto">
          <p className="text-[var(--orange)] text-xs tracking-widest uppercase mb-3">See Work.</p>
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Category</p>
              <p className="text-white text-sm">{project.category}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-1">Year</p>
              <p className="text-white text-sm">{project.year}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h3
            className="font-display text-white text-2xl mb-3"
            style={{ fontStyle: 'italic', fontWeight: 600 }}
          >
            {project.title}
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">{project.summary}</p>
        </div>
      </div>
    </div>
  )
}

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) return
    fetch(`${base}/projects?published=true&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProjects(data.data)
        }
      })
      .catch(() => {}) // silently keep fallback on network error
  }, [])

  return (
    <>
      <div className="min-h-screen bg-[var(--black)] pt-24 md:pt-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="mb-12 md:mb-16">
            <h1
              className="font-display text-white mb-4"
              style={{ fontSize: 'clamp(40px, 8vw, 96px)', fontWeight: 400, letterSpacing: '-2px' }}
            >
              Projects
            </h1>
            <p className="text-white/50 max-w-2xl text-sm md:text-base leading-relaxed">
              Each project is a vibe, a story, a snapshot of something that felt real. From blurred
              motion to golden stillness, this is where concept meets emotion. Dive in — every frame
              has a pulse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 pb-24">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
