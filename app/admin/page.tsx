'use client'

import { useEffect, useState } from 'react'
import { authStorage, api } from '@/lib/api'

interface Stats {
  total: number
  pending: number
  read: number
  replied: number
  archived: number
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
    >
      <p className="text-white/40 text-xs tracking-widest uppercase mb-2">{label}</p>
      <p
        className="text-3xl font-semibold"
        style={{ color: accent ? 'var(--orange)' : 'white' }}
      >
        {value}
      </p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [testimonialCount, setTestimonialCount] = useState<number | null>(null)

  useEffect(() => {
    const token = authStorage.getAccessToken() ?? undefined

    api.get<Stats>('/contact/stats', token).then((data) => {
      if (data.success && data.data) setStats(data.data)
    })

    api.get<unknown[]>('/projects', token).then((data) => {
      if (data.success && data.meta) setProjectCount(data.meta.total)
    })

    api.get<unknown[]>('/testimonials', token).then((data) => {
      if (data.success && Array.isArray(data.data)) setTestimonialCount(data.data.length)
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Overview of your portfolio content.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projects" value={projectCount ?? 0} />
        <StatCard label="Testimonials" value={testimonialCount ?? 0} />
        <StatCard label="Total Inquiries" value={stats?.total ?? 0} />
        <StatCard label="Pending" value={stats?.pending ?? 0} accent />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Read', value: stats?.read ?? 0 },
          { label: 'Replied', value: stats?.replied ?? 0 },
          { label: 'Archived', value: stats?.archived ?? 0 },
        ].map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <a
          href="/admin/projects"
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--orange)', color: 'white' }}
        >
          Manage Projects
        </a>
        <a
          href="/admin/inquiries"
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: '#1e1e1e', color: 'rgba(255,255,255,0.7)' }}
        >
          View Inquiries
        </a>
      </div>
    </div>
  )
}
