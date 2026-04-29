'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  active: boolean
  order: number
}

const FALLBACK: Service[] = [
  { id: '1', name: 'Photography', slug: 'photography', active: true, order: 0 },
  { id: '2', name: 'Portrait', slug: 'portrait', active: true, order: 1 },
  { id: '3', name: 'Fashion Shoots', slug: 'fashion-shoots', active: true, order: 2 },
  { id: '4', name: 'Street', slug: 'street', active: true, order: 3 },
  { id: '5', name: 'Creative Direction', slug: 'creative-direction', active: true, order: 4 },
  { id: '6', name: 'Couples', slug: 'couples', active: true, order: 5 },
  { id: '7', name: 'iPhone Shots', slug: 'iphone-shots', active: true, order: 6 },
  { id: '8', name: 'Film', slug: 'film', active: true, order: 7 },
]

export default function Services() {
  const [services, setServices] = useState<Service[]>(FALLBACK)
  const [active, setActive] = useState<string | null>('7')
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) return
    fetch(`${base}/services`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setServices(data.data)
          setActive(data.data[0]?.id ?? null)
        }
      })
      .catch(() => {})
  }, [])

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
      <div className="w-full h-px bg-black/20" />

      <div className="py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto">
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
                  border:
                    active === service.id
                      ? '1px solid var(--orange-light, #ff5a1a)'
                      : '1px solid #2a2a2a',
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                <div className="absolute top-3 right-3">
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{ borderColor: active === service.id ? 'var(--orange)' : '#333' }}
                  >
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

                <div className="absolute bottom-6 left-0 right-0 px-3">
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-black/20" />
    </section>
  )
}
