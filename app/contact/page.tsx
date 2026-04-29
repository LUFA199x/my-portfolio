'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'

const locations = [
  'Lagos, Nigeria',
  'Abuja, Nigeria',
  'Port Harcourt, Nigeria',
  'Ibadan, Nigeria',
  'Other (Remote)',
]

export default function ContactPage() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    location: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = () => {
    if (!form.email || !form.name) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--black)] pt-16 flex flex-col items-center justify-center px-6 md:px-10 py-12">
        <div className="w-full max-w-xl">
          {/* Contact card with orange border */}
          <div
            className="rounded-2xl p-8 md:p-10 relative"
            style={{
              border: '1px solid var(--orange)',
              background: 'var(--black)',
            }}
          >
            {submitted ? (
              <div className="py-16 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(232, 76, 13, 0.15)' }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--orange)"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2
                  className="font-display text-white mb-3"
                  style={{ fontSize: '28px', fontStyle: 'italic' }}
                >
                  Message received!
                </h2>
                <p className="text-white/50 text-sm">
                  Adegheosa will be in touch within 24 hours. Get excited.
                </p>
              </div>
            ) : (
              <>
                <h1
                  className="font-display text-white mb-8 leading-tight"
                  style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 500 }}
                >
                  Say Hi! and tell me about your idea
                </h1>

                <div className="flex flex-col gap-6">
                  {/* Email + Name row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Your Email"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <select
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="form-select w-full pr-8"
                      >
                        <option value="">Select...</option>
                        {locations.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                      What&apos;s in your mind
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="I would like to..."
                      rows={5}
                      className="form-input resize-none"
                      style={{ borderBottom: '1px solid #333', paddingBottom: '12px' }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !form.email || !form.name}
                    className="w-full py-4 rounded-xl text-white text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      border: '1px solid #333',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        ;(e.target as HTMLButtonElement).style.background = 'var(--orange)'
                        ;(e.target as HTMLButtonElement).style.borderColor = 'var(--orange)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      ;(e.target as HTMLButtonElement).style.background = 'transparent'
                      ;(e.target as HTMLButtonElement).style.borderColor = '#333'
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity="0.3" />
                          <path d="M21 12a9 9 0 0 1-9 9" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
