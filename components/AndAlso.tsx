'use client'

import { useEffect, useRef } from 'react'

export default function AndAlso() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.2 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="bg-[var(--black)] py-20 md:py-24 px-6 md:px-10"
    >
      <div className="max-w-screen-xl mx-auto">
        <h2
          className="reveal font-display text-[var(--orange)] mb-5"
          style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontStyle: 'italic', fontWeight: 900 }}
        >
          And Also
        </h2>

        <div className="reveal delay-2">
          <p
            className="font-body text-white/60 leading-relaxed"
            style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', fontWeight: 300, maxWidth: '680px' }}
          >
            Golden hour. Street noise. That one breath before the beat drops.
            <br />
            I&apos;m obsessed with chasing feeling through light and texture. My work is about capturing what
            can&apos;t be said — from loud city nights to soft, sleepy mornings. If it hits real, I shoot it.
          </p>
        </div>
      </div>
    </section>
  )
}
