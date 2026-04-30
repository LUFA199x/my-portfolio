'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { FALLBACK_PROJECTS, type Project } from '@/lib/projects'

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
      id={project.id}
      ref={cardRef}
      className="work-card"
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        height: 'clamp(300px, 40vw, 480px)',
        scrollMarginTop: '120px',
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
        <p
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'white',
          }}
        >
          See Work.
        </p>
      </div>

      {/* Hover overlay — full detail panel */}
      <div className="work-card-details">
        <div className="mb-auto">
          <p
            style={{
              fontFamily: 'var(--font-josefin)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              marginBottom: '12px',
            }}
          >
            See Work.
          </p>
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-body text-white/40 text-xs mb-1" style={{ fontStyle: 'italic', fontWeight: 300 }}>Category</p>
              <p className="font-body text-white text-sm" style={{ fontWeight: 400 }}>{project.category}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-white/40 text-xs mb-1" style={{ fontStyle: 'italic', fontWeight: 300 }}>Year</p>
              <p className="font-body text-white text-sm" style={{ fontWeight: 400 }}>{project.year}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h3
            className="font-display text-white text-2xl mb-3"
            style={{ fontStyle: 'italic', fontWeight: 900 }}
          >
            {project.title}
          </h3>
          <p className="font-body text-white/50 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{project.summary}</p>
        </div>
      </div>
    </div>
  )
}

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS)

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
      .catch(() => {})
  }, [])

  // Hash-based deep-link: scroll to card + briefly highlight it
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const timer = setTimeout(() => {
      const target = document.getElementById(hash)
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      target.classList.add('card-highlighted')
      setTimeout(() => target.classList.remove('card-highlighted'), 1800)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="min-h-screen bg-[var(--black)] pt-24 md:pt-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="mb-12 md:mb-16">
            <h1
              className="font-display text-white mb-4"
              style={{ fontSize: 'clamp(40px, 8vw, 96px)', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-2px' }}
            >
              Projects
            </h1>
            <p className="font-body text-white/50 max-w-2xl text-sm md:text-base leading-relaxed" style={{ fontWeight: 300 }}>
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
