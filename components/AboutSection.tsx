'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal, .reveal-scale')
    if (!els) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-[var(--black)] py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        {/* Section label */}
        <h2
          className="reveal font-display text-[var(--orange)] mb-10 md:mb-12"
          style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontStyle: 'italic', fontWeight: 900 }}
        >
          (About Me)
        </h2>

        {/* Three cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1 — Quote + dots */}
          <div
            className="about-card reveal-scale delay-1 relative rounded-2xl overflow-hidden flex flex-col justify-between p-7"
            style={{
              background: '#141414',
              border: '1px solid #1f1f1f',
              minHeight: '360px',
            }}
          >
            <p
              className="font-display text-white leading-snug"
              style={{ fontSize: '26px', fontWeight: 900, fontStyle: 'italic' }}
            >
              Photography is 20% light, 80% vibe
            </p>

            {/* Decorative dot grid */}
            <div className="mt-8 grid grid-cols-6 gap-3 opacity-20">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full bg-white/60"
                  style={{ width: 28, height: 28 }}
                />
              ))}
            </div>

            <p
              className="mt-8 font-body text-white/50 text-base"
              style={{ fontStyle: 'italic', fontWeight: 300 }}
            >
              #True
            </p>
          </div>

          {/* Card 2 — Portrait + shoot info */}
          <div
            className="about-card reveal-scale delay-2 relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: '#141414',
              border: '1px solid #1f1f1f',
              minHeight: '360px',
            }}
          >
            {/* Portrait image */}
            <div className="relative flex-1" style={{ minHeight: '240px' }}>
              <Image
                src="https://picsum.photos/seed/adegheosa/400/300"
                alt="Adegheosa — portrait photographer based in Lagos"
                fill
                style={{ objectFit: 'cover' }}
                sizes="400px"
              />
              {/* Overlay tint */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(20,20,20,0) 50%, #141414 100%)' }}
              />
            </div>

            {/* Stats */}
            <div className="p-6 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-body text-white/40 text-xs mb-1 tracking-wide" style={{ fontStyle: 'italic', fontWeight: 300 }}>Shoot Dates</p>
                  <p className="font-body text-white text-sm" style={{ fontWeight: 400 }}>Flexible / TBD</p>
                </div>
                <div className="text-right">
                  <p className="font-body text-white/40 text-xs mb-1 tracking-wide" style={{ fontStyle: 'italic', fontWeight: 300 }}>Turnaround</p>
                  <p className="font-body text-white text-sm" style={{ fontWeight: 400 }}>Within 24HRS</p>
                </div>
              </div>
              <div>
                <p className="font-body text-white/40 text-xs mb-1 tracking-wide" style={{ fontStyle: 'italic', fontWeight: 300 }}>Location:</p>
                <p className="font-body text-white text-sm" style={{ fontWeight: 400 }}>Anywhere with light</p>
              </div>
            </div>
          </div>

          {/* Card 3 — Red image + question */}
          <div
            className="about-card reveal-scale delay-3 relative rounded-2xl overflow-hidden flex flex-col justify-end"
            style={{
              background: '#8B1A1A',
              minHeight: '360px',
            }}
          >
            {/* Background image with red tint */}
            <div className="absolute inset-0">
              <Image
                src="https://picsum.photos/seed/redlight/400/400"
                alt="Dramatic red-lit photography session"
                fill
                style={{ objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.6 }}
                sizes="400px"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, #c0392b 0%, #8B1A1A 60%, #5a0d0d 100%)' }}
              />
            </div>

            {/* Camera frame decoration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="border-2 border-white/30 rounded-lg"
                style={{ width: '55%', height: '50%' }}
              >
                <div
                  className="w-3 h-3 rounded-full bg-[var(--orange)] absolute"
                  style={{ right: '-1px', top: '50%', transform: 'translateY(-50%) translateX(50%)' }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="relative z-10 p-7">
              <p
                className="font-display text-white leading-tight"
                style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic' }}
              >
                What&apos;s the point of the frame?
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
