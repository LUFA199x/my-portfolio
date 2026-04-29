'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const services = [
  { id: 1, name: 'Photography' },
  { id: 2, name: 'Portrait' },
  { id: 3, name: 'Fashion Shoots' },
  { id: 4, name: 'Street' },
  { id: 5, name: 'Creative Direction' },
  { id: 6, name: 'Couples' },
  { id: 7, name: 'iPhone Shots', accent: true },
  { id: 8, name: 'Film' },
]

export default function Services() {
  const [active, setActive] = useState<number | null>(7)
  const ref = useRef<HTMLElement>(null)

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
      className="relative overflow-hidden py-0"
      style={{ background: 'var(--orange)' }}
    >
      {/* Top border line */}
      <div className="w-full h-px bg-black/20" />

      <div className="py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="reveal text-center mb-16 md:mb-20">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-black/70 text-sm tracking-widest uppercase mb-4 hover:text-black transition-colors group"
            >
              See Work
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
            <h2
              className="font-display text-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(32px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-1px' }}
            >
              THAT&apos;S MY SERVICES
            </h2>
          </div>

          {/* 3D Cards row */}
          <div className="reveal delay-2 flex items-end gap-1.5 md:gap-2 justify-center overflow-x-auto pb-4">
            {services.map((service, i) => (
              <div
                key={service.id}
                onClick={() => setActive(service.id === active ? null : service.id)}
                className={`services-card flex-shrink-0 relative rounded-xl cursor-pointer select-none ${
                  active === service.id ? 'active' : ''
                }`}
                style={{
                  width: 'clamp(80px, 10vw, 130px)',
                  height: 'clamp(220px, 30vw, 380px)',
                  background: active === service.id ? '#1a1a1a' : '#141414',
                  border: active === service.id
                    ? '1px solid var(--orange-light, #ff5a1a)'
                    : '1px solid #2a2a2a',
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                {/* Globe icon top right */}
                <div className="absolute top-3 right-3">
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{
                      borderColor: active === service.id ? 'var(--orange)' : '#333',
                    }}
                  >
                    {/* Simplified globe lines */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ overflow: 'hidden', borderRadius: '50%' }}
                    >
                      <div
                        className="w-full border-t"
                        style={{ borderColor: active === service.id ? 'var(--orange)' : '#333' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Service name — rotated */}
                <div
                  className="absolute bottom-6 left-0 right-0 px-3"
                >
                  <p
                    className="font-display text-white"
                    style={{
                      fontSize: 'clamp(11px, 1.2vw, 15px)',
                      fontWeight: 500,
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                      color: active === service.id ? '#FF5A1A' : 'white',
                      transition: 'color 0.3s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {service.name}
                  </p>
                </div>

                {/* Accent line for iPhone Shots (orange) */}
                {service.accent && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                    style={{ background: 'var(--orange)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="w-full h-px bg-black/20" />
    </section>
  )
}
