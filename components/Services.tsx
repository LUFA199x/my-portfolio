'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const services = [
  'Photography',
  'Portrait',
  'Fashion Shoots',
  'Street',
  'Creative Direction',
  'Couples',
  'iPhone Shots',
  'Film',
]

const SERVICE_IDS: Record<string, string> = {
  'Photography':        'project-photography',
  'Portrait':           'project-portrait',
  'Fashion Shoots':     'project-fashion-shoots',
  'Street':             'project-street',
  'Creative Direction': 'project-creative-direction',
  'Couples':            'project-couples',
  'iPhone Shots':       'project-iphone-shots',
  'Film':               'project-film',
}

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const ref = useRef<HTMLElement>(null)
  const router = useRouter()

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: '#D84B00', padding: '52px 0 130px' }}
    >
      {/* Header */}
      <div className="reveal text-center" style={{ marginBottom: '56px' }}>
        <Link
          href="/work"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontWeight: 600,
            color: '#111',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          See Work
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </Link>

        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: 'clamp(26px, 5.5vw, 76px)',
            fontWeight: 900,
            color: '#111',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            marginTop: '8px',
          }}
        >
          That&apos;s My Services
        </h2>
      </div>

      {/* Fan cards */}
      <div className="reveal delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ perspective: '950px', perspectiveOrigin: '50% -10%' }}>
          <div style={{ display: 'flex', width: 'fit-content' }}>
            {services.map((service, i) => (
              <div
                key={service}
                className={`fan-card${hoveredIndex === i ? ' fan-card--hovered' : ''}`}
                style={{
                  zIndex: hoveredIndex === i ? 100 : i + 1,
                  marginLeft: i === 0 ? 0 : 'clamp(-64px, -9vw, -98px)',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => router.push(`/work#${SERVICE_IDS[service]}`)}
                role="button"
                tabIndex={0}
                aria-label={`View ${service} projects`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push(`/work#${SERVICE_IDS[service]}`)
                  }
                }}
              >
                {/* Globe icon */}
                <div
                  className="globe-icon"
                  style={{ position: 'absolute', top: '10px', right: '9px' }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.2"
                  >
                    <circle cx="8" cy="8" r="6.5" />
                    <ellipse cx="8" cy="8" rx="3" ry="6.5" />
                    <line x1="1.5" y1="8" x2="14.5" y2="8" />
                  </svg>
                </div>

                {/* Service label */}
                <div
                  style={{ position: 'absolute', bottom: '18px', left: '12px' }}
                >
                  <p className="fan-card-label">{service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
