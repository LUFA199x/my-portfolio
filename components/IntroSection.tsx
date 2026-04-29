'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function IntroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal, .reveal-left')
    if (!els) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--black)] py-28 md:py-36 px-6 md:px-10 overflow-hidden"
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Main heading */}
        <h1
          className="reveal font-display text-white leading-tight mb-10 md:mb-12"
          style={{
            fontSize: 'clamp(42px, 8vw, 110px)',
            fontWeight: 700,
            letterSpacing: '-2px',
            maxWidth: '900px',
          }}
        >
          Lights, Lens and
          <br />
          <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>Adegheosa.</span>
        </h1>

        {/* Bio */}
        <div className="reveal delay-2 flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          <p
            className="text-white/60 leading-relaxed max-w-xl"
            style={{ fontSize: '15px', fontWeight: 300 }}
          >
            I&apos;m Adegheosa, a visual artist exploring the space between lifestyle, product,
            and portrait photography. Every frame I shoot carries intention — I don&apos;t just
            capture moments, I craft them. Based in Lagos, shooting everywhere light allows.
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/work"
              className="inline-flex items-center gap-3 group"
            >
              <span
                className="text-white text-sm tracking-widest uppercase font-medium group-hover:text-[var(--orange)] transition-colors duration-300"
              >
                View Work
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[var(--orange)] group-hover:translate-x-1 transition-transform duration-300"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 group"
            >
              <span
                className="text-white/50 text-sm tracking-widest uppercase font-medium group-hover:text-white transition-colors duration-300"
              >
                Book a Shoot
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all duration-300"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
