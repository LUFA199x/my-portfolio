'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const SLOTS = [
  {
    alt: 'Portrait in red light',
    style: { width: 260, height: 360, top: '8%', left: '50%', transform: 'translateX(-50%)', zIndex: 5 },
    bg: '#8B3A5E',
    fallback: 'https://picsum.photos/seed/portrait1/400/550',
  },
  {
    alt: 'Black and white portrait',
    style: { width: 200, height: 270, top: '18%', left: '24%', transform: 'rotate(-3deg)', zIndex: 3 },
    bg: '#1a1a1a',
    fallback: 'https://picsum.photos/seed/bw1/320/420',
  },
  {
    alt: 'Fashion portrait',
    style: { width: 170, height: 230, top: '15%', right: '18%', transform: 'rotate(2deg)', zIndex: 4 },
    bg: '#f5e6d0',
    fallback: 'https://picsum.photos/seed/fashion1/280/360',
  },
  {
    alt: 'Outdoor portrait',
    style: { width: 170, height: 220, top: '35%', left: '27%', transform: 'rotate(1deg)', zIndex: 2 },
    bg: '#c5dba0',
    fallback: 'https://picsum.photos/seed/outdoor1/260/330',
  },
  {
    alt: 'Studio shot',
    style: { width: 220, height: 290, bottom: '5%', left: '28%', transform: 'rotate(-1deg)', zIndex: 3 },
    bg: '#e8e8e8',
    fallback: 'https://picsum.photos/seed/studio1/320/420',
  },
  {
    alt: 'Business portrait',
    style: { width: 195, height: 265, top: '32%', right: '17%', transform: 'rotate(-2deg)', zIndex: 4 },
    bg: '#f0f0f0',
    fallback: 'https://picsum.photos/seed/business1/280/360',
  },
  {
    alt: 'Nature shot',
    style: { width: 190, height: 145, bottom: '15%', left: '47%', transform: 'rotate(2deg)', zIndex: 2 },
    bg: '#5a8a4a',
    fallback: 'https://picsum.photos/seed/nature1/240/180',
  },
  {
    alt: 'Baby portrait',
    style: { width: 185, height: 215, bottom: '5%', right: '17%', transform: 'rotate(1deg)', zIndex: 3 },
    bg: '#f8f4ee',
    fallback: 'https://picsum.photos/seed/baby1/260/300',
  },
  {
    alt: 'Top photo',
    style: { width: 120, height: 140, top: '0%', left: '51%', transform: 'rotate(-1deg)', zIndex: 1 },
    bg: '#2a2a2a',
    fallback: 'https://picsum.photos/seed/top1/120/160',
  },
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
              el.style.transform = el.dataset.transform || 'none'
            }, delay)
          }
        })
      },
      { threshold: 0.1 }
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative min-h-screen bg-[var(--black)] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(10,10,10,0.85) 100%)',
        }}
      />

      <div ref={containerRef} className="collage-container max-w-5xl mx-auto px-4">
        {SLOTS.map((slot, i) => {
          const src = coverImages[i] || slot.fallback
          return (
            <div
              key={i}
              className="photo-card collage-item"
              data-delay={i * 80}
              data-transform={slot.style.transform}
              style={{
                ...slot.style,
                opacity: 0,
                transition: 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease',
              }}
            >
              <div
                style={{
                  width: slot.style.width,
                  height: slot.style.height,
                  position: 'relative',
                  background: slot.bg,
                }}
              >
                <Image
                  src={src}
                  alt={slot.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes={`${slot.style.width}px`}
                  priority={i < 3}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
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
