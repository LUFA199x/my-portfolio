'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Testimonial {
  id: number
  name: string
  role: string
  text: string
  avatar: string
  avatarBg: string
  likes: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Michael Johnson',
    role: 'Marketing Manager',
    text: "It felt like every photo had its own narrative. Her use of lighting and color is next-level, and the turnaround time was super fast without compromising quality. If you're looking for someone with both vision and vibe, she's the one.",
    avatar: 'https://picsum.photos/seed/mj1/80/80',
    avatarBg: '#3a2a1a',
    likes: 14,
  },
  {
    id: 2,
    name: 'Florent Ademaj',
    role: 'Creative Director',
    text: "I hired her for my engagement photos, and honestly, I'm still emotional looking at them. She didn't pose us in stiff, forced ways — she let us be ourselves and just captured magic.",
    avatar: 'https://picsum.photos/seed/fa1/80/80',
    avatarBg: '#d4a84b',
    likes: 9,
  },
  {
    id: 3,
    name: 'Aisha Bello',
    role: 'Fashion Stylist',
    text: "Cool, they felt like free. You can tell she's passionate about what she does. The shoot was fun, collaborative and the results were beyond what I expected.",
    avatar: 'https://picsum.photos/seed/ab1/80/80',
    avatarBg: '#2a1a2a',
    likes: 6,
  },
  {
    id: 4,
    name: 'Michael Okafor',
    role: 'Brand Consultant',
    text: 'I was blown away by her ability to connect and communicate. She really listened to what I wanted and delivered beyond expectation. Every frame told a story.',
    avatar: 'https://picsum.photos/seed/mo1/80/80',
    avatarBg: '#1a2a3a',
    likes: 21,
  },
  {
    id: 5,
    name: 'Lisa Martinez',
    role: 'Product Manager',
    text: 'Our brand was launching a new product, and Adegheosa was our top choice to shoot the campaign. Professional, creative, and she understood the brief immediately.',
    avatar: 'https://picsum.photos/seed/lm1/80/80',
    avatarBg: '#2a2a2a',
    likes: 17,
  },
  {
    id: 6,
    name: 'Emily Parker',
    role: 'Creative Lead',
    text: 'She played music, adjusted the mood, gave clear direction, and somehow made the awkward moments disappear. The photos were so much more than I hoped for — they were honest, bold, and emotionally charged. Highly recommend.',
    avatar: 'https://picsum.photos/seed/ep1/80/80',
    avatarBg: '#2a1a1a',
    likes: 33,
  },
  {
    id: 7,
    name: 'Sarah Thompson',
    role: 'Entrepreneur',
    text: 'From the initial call to the delivery of the final images, everything was seamless. The photos capture exactly the energy I wanted for my brand.',
    avatar: 'https://picsum.photos/seed/st1/80/80',
    avatarBg: '#1a1a2a',
    likes: 11,
  },
]

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(testimonial.likes)

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setCount((c) => c - 1)
    } else {
      setLiked(true)
      setCount((c) => c + 1)
    }
  }

  return (
    <div className="testimonial-card mb-4">
      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: testimonial.avatarBg }}
        >
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-white text-sm font-medium">{testimonial.name}</p>
          <p className="text-white/40 text-xs">{testimonial.role}</p>
        </div>
      </div>

      {/* Text */}
      <p className="text-white/70 text-sm leading-relaxed mb-5">
        {testimonial.text}
      </p>

      {/* Like button */}
      <button
        onClick={handleLike}
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

  // Split into 3 columns
  const col1 = testimonials.filter((_, i) => i % 3 === 0)
  const col2 = testimonials.filter((_, i) => i % 3 === 1)
  const col3 = testimonials.filter((_, i) => i % 3 === 2)

  return (
    <section
      ref={ref}
      className="bg-[var(--black)] py-24 md:py-32 px-6 md:px-10"
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
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

        {/* Masonry grid */}
        <div className="reveal delay-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            {col1.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          <div className="md:mt-12">
            {col2.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          <div>
            {col3.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
