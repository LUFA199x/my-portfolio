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

// Shown immediately — replaced by API data when the backend is reachable
const FALLBACK: Testimonial[] = [
  {
    id: 'f1',
    name: 'Michael Johnson',
    role: 'Marketing Manager',
    text: "It felt like every photo had its own narrative. Her use of lighting and color is next-level, and the turnaround time was super fast without compromising quality. If you're looking for someone with both vision and vibe, she's the one.",
    likes: 14,
    featured: false,
    published: true,
  },
  {
    id: 'f2',
    name: 'Florent Ademaj',
    role: 'Creative Director',
    text: "I hired her for my engagement photos, and honestly, I'm still emotional looking at them. She didn't pose us in stiff, forced ways — she let us be ourselves and just captured magic.",
    likes: 9,
    featured: false,
    published: true,
  },
  {
    id: 'f3',
    name: 'Aisha Bello',
    role: 'Fashion Stylist',
    text: "Cool, they felt like free. You can tell she's passionate about what she does. The shoot was fun, collaborative and the results were beyond what I expected.",
    likes: 6,
    featured: false,
    published: true,
  },
  {
    id: 'f4',
    name: 'Michael Okafor',
    role: 'Brand Consultant',
    text: 'I was blown away by her ability to connect and communicate. She really listened to what I wanted and delivered beyond expectation. Every frame told a story.',
    likes: 21,
    featured: true,
    published: true,
  },
  {
    id: 'f5',
    name: 'Lisa Martinez',
    role: 'Product Manager',
    text: 'Our brand was launching a new product, and Adegheosa was our top choice to shoot the campaign. Professional, creative, and she understood the brief immediately.',
    likes: 17,
    featured: false,
    published: true,
  },
  {
    id: 'f6',
    name: 'Emily Parker',
    role: 'Creative Lead',
    text: 'She played music, adjusted the mood, gave clear direction, and somehow made the awkward moments disappear. The photos were so much more than I hoped for — they were honest, bold, and emotionally charged. Highly recommend.',
    likes: 33,
    featured: true,
    published: true,
  },
  {
    id: 'f7',
    name: 'Sarah Thompson',
    role: 'Entrepreneur',
    text: 'From the initial call to the delivery of the final images, everything was seamless. The photos capture exactly the energy I wanted for my brand.',
    likes: 11,
    featured: false,
    published: true,
  },
]

const BG_COLORS = ['#3a2a1a', '#d4a84b', '#2a1a2a', '#1a2a3a', '#2a2a2a', '#2a1a1a', '#1a1a2a']

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

function TestimonialCard({ testimonial, bgColor }: { testimonial: Testimonial; bgColor: string }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(testimonial.likes)
  const [pending, setPending] = useState(false)

  const handleLike = async () => {
    if (pending) return
    const base = process.env.NEXT_PUBLIC_API_URL
    // Fallback items (id starts with "f") or missing API — optimistic local toggle
    if (!base || testimonial.id.startsWith('f')) {
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
      } else {
        setLiked((v) => !v)
        setCount((c) => (liked ? c - 1 : c + 1))
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
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: bgColor }}
          >
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) return
    fetch(`${base}/testimonials`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTestimonials(data.data)
        }
      })
      .catch(() => {}) // silently keep fallback on network error
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
            These aren&apos;t just clients, they&apos;re collaborators, storytellers, and part of the
            vibe. Scroll through what others felt after stepping in front of Adegheosa&apos;s lens.
          </p>
        </div>

        <div className="reveal delay-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            {col1.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} bgColor={BG_COLORS[i % BG_COLORS.length]} />
            ))}
          </div>
          <div className="md:mt-12">
            {col2.map((t, i) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                bgColor={BG_COLORS[(i + 2) % BG_COLORS.length]}
              />
            ))}
          </div>
          <div>
            {col3.map((t, i) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                bgColor={BG_COLORS[(i + 4) % BG_COLORS.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
