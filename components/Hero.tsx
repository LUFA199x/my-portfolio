'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const SLOTS = [
  { alt: 'Portrait in red light',    bg: '#8B3A5E', fallback: 'https://picsum.photos/seed/portrait1/400/550' },
  { alt: 'Black and white portrait', bg: '#1a1a1a', fallback: 'https://picsum.photos/seed/bw1/320/420'       },
  { alt: 'Fashion portrait',         bg: '#f5e6d0', fallback: 'https://picsum.photos/seed/fashion1/280/360'  },
  { alt: 'Outdoor portrait',         bg: '#c5dba0', fallback: 'https://picsum.photos/seed/outdoor1/260/330'  },
  { alt: 'Studio shot',              bg: '#e8e8e8', fallback: 'https://picsum.photos/seed/studio1/320/420'   },
  { alt: 'Business portrait',        bg: '#f0f0f0', fallback: 'https://picsum.photos/seed/business1/280/360' },
  { alt: 'Nature shot',              bg: '#5a8a4a', fallback: 'https://picsum.photos/seed/nature1/240/180'   },
  { alt: 'Baby portrait',            bg: '#f8f4ee', fallback: 'https://picsum.photos/seed/baby1/260/300'     },
  { alt: 'Top photo',                bg: '#2a2a2a', fallback: 'https://picsum.photos/seed/top1/120/160'      },
]

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [coverImages, setCoverImages] = useState<string[]>([])

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) return
    fetch(`${base}/projects?published=true&limit=9`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCoverImages(data.data.map((p: { coverImage: string }) => p.coverImage))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const items = containerRef.current?.querySelectorAll('.photo-card')
    if (!items) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = Number(el.dataset.delay || 0)
            setTimeout(() => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, delay)
          }
        })
      },
      { threshold: 0.05 }
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative bg-[var(--black)] overflow-hidden pt-20 md:pt-24 pb-0">
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(10,10,10,0.8) 100%)',
        }}
      />

      {/* Photo grid */}
      <div
        ref={containerRef}
        className="collage-container relative z-0 max-w-5xl mx-auto px-6 md:px-10"
      >
        {SLOTS.map((slot, i) => {
          const src = coverImages[i] || slot.fallback
          return (
            <div
              key={i}
              className="photo-card collage-item"
              data-delay={i * 80}
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%', background: slot.bg }}>
                <Image
                  src={src}
                  alt={slot.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  priority={i < 3}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* SCROLL indicator — in normal flow, separated from grid */}
      <div
        className="relative z-20 flex flex-col items-center gap-2 opacity-40"
        style={{ marginTop: 'clamp(48px, 8vw, 96px)', paddingBottom: '52px' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
        <div className="w-px h-8 bg-white/60 animate-[bounce_2s_ease-in-out_infinite]" />
      </div>
    </section>
  )
}
