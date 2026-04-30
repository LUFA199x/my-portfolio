'use client'

import { useState, useEffect, useRef } from 'react'

export default function CTASection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLElement>(null)

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

  const handleSubmit = async () => {
    if (!email.trim() || loading) return
    setLoading(true)
    const base = process.env.NEXT_PUBLIC_API_URL
    try {
      if (base) {
        await fetch(`${base}/subscribers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })
      }
    } catch {
      // silent — still show success to user
    } finally {
      setLoading(false)
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 4000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <section
      ref={ref}
      className="bg-[var(--black)] py-16 md:py-20 px-6 md:px-10"
    >
      <div className="max-w-screen-xl mx-auto">
        <div
          className="reveal rounded-2xl md:rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{ background: 'var(--orange)' }}
        >
          {/* Decorative texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(0,0,0,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
            }}
          />

          {/* Smiley icon */}
          <div className="relative mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="1.5"
              className="opacity-70"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative max-w-2xl">
            <h2
              className="font-display text-black leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700 }}
            >
              Ready to shoot something real?
            </h2>
            <p className="text-black/70 text-sm md:text-base mb-10 leading-relaxed">
              Let&apos;s create something unforgettable whether it&apos;s a product, a moment, or a whole mood.
              Adegheosa&apos;s calendar fills up fast, so don&apos;t wait.
            </p>

            {/* Email input row */}
            {submitted ? (
              <div className="py-4 flex items-center gap-2 text-black font-medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Got it! Adegheosa will be in touch soon.
              </div>
            ) : (
              <div className="flex items-center gap-4 border-b border-black/30 pb-3">
                <label htmlFor="cta-email" className="sr-only">Email address</label>
                <input
                  id="cta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your Email"
                  className="cta-input flex-1"
                  autoComplete="email"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-shrink-0 text-black/70 hover:text-black transition-colors disabled:opacity-50"
                  aria-label="Submit email"
                >
                  {loading ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
