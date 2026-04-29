'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  role: string
  company?: string
  text: string
  avatar?: string
  likes: number
  featured: boolean
  published: boolean
}

function Initials({ name, bg }: { name: string; bg: string }) {
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
      style={{ background: bg }}
    >
      {letters}
    </div>
  )
}

const BG_COLORS = ['#3a2a1a', '#d4a84b', '#2a1a2a', '#1a2a3a', '#2a2a2a', '#2a1a1a', '#1a1a2a']

function TestimonialCard({ testimonial, bgColor }: { testimonial: Testimonial; bgColor: string }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(testimonial.likes)
  const [pending, setPending] = useState(false)

  const handleLike = async () => {
    if (pending) return
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) {
      setLiked((v) => !v)
      setCount((c) => (liked ? c - 1 : c + 1))
      return
    }
    setPending(true)
    try {
      const res = await fetch(`${base}/testimonials/${testimonial.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (data.success && data.data) {
        setLiked(data.data.liked)
        setCount(data.data.likes)
      }
    } catch {
      setLiked((v) => !v)
      setCount((c) => (liked ? c - 1 : c + 1))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="testimonial-card mb-4">
      <div className="flex items-center gap-3 mb-4">
        {testimonial.avatar ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ background: bgColor }}>
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <Initials name={testimonial.name} bg={bgColor} />
        )}
        <div>
          <p className="text-white text-sm font-medium">{testimonial.name}</p>
          <p className="text-white/40 text-xs">
            {testimonial.role}
            {testimonial.company ? ` · ${testimonial.company}` : ''}
          </p>
        </div>
      </div>

      <p className="text-white/70 text-sm leading-relaxed mb-5">{testimonial.text}</p>

      <button
        onClick={handleLike}
        disabled={pending}
        className={`like-btn ${liked ? 'liked' : ''}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Like {count > 0 && <span className="text-xs opacity-60">{count}</span>}
      </button>
    </div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) { setLoading(false); return }
    fetch(`${base}/testimonials`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTestimonials(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
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
  }, [testimonials])

  const col1 = testimonials.filter((_, i) => i % 3 === 0)
  const col2 = testimonials.filter((_, i) => i % 3 === 1)
  const col3 = testimonials.filter((_, i) => i % 3 === 2)

  return (
    <section ref={ref} className="bg-[var(--black)] py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="reveal text-center mb-16">
          <h2
            className="font-display mb-4"
            style={{
              fontSize: 'clamp(32px, 6vw, 72px)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'var(--orange)',
              letterSpacing: '-1px',
            }}
          >
            Don&apos;t believe me?
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            These aren&apos;t just clients, they&apos;re collaborators, storytellers, and part of the vibe.
            Scroll through what others felt after stepping in front of Adegheosa&apos;s lens.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[var(--orange)] animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-white/30 py-16">No testimonials yet.</p>
        ) : (
          <div className="reveal delay-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              {col1.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} bgColor={BG_COLORS[i % BG_COLORS.length]} />
              ))}
            </div>
            <div className="md:mt-12">
              {col2.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} bgColor={BG_COLORS[(i + 2) % BG_COLORS.length]} />
              ))}
            </div>
            <div>
              {col3.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} bgColor={BG_COLORS[(i + 4) % BG_COLORS.length]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
