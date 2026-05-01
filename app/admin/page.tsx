'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authStorage, api } from '@/lib/api'
import { StatCard, PageLoader } from './_components'
import type { InquiryStats } from '@/lib/admin-types'

interface DashboardData {
  stats: InquiryStats | null
  projectCount: number
  testimonialCount: number
  subscriberCount: number
  serviceCount: number
}

const QuickLink = ({ href, label, sub }: { href: string; label: string; sub: string }) => (
  <Link
    href={href}
    style={{
      display: 'block',
      padding: '16px 18px',
      background: '#141414',
      border: '1px solid #1e1e1e',
      borderRadius: 10,
      textDecoration: 'none',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
  >
    <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '0 0 2px' }}>{label}</p>
    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{sub}</p>
  </Link>
)

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    projectCount: 0,
    testimonialCount: 0,
    subscriberCount: 0,
    serviceCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authStorage.getAccessToken() ?? undefined

    Promise.all([
      api.get<InquiryStats>('/contact/stats', token),
      api.get<unknown[]>('/projects?limit=1', token),
      api.get<unknown[]>('/testimonials', token),
      api.get<{ total: number; active: number }>('/subscribers/stats', token),
      api.get<unknown[]>('/services', token),
    ]).then(([inquiries, projects, testimonials, subscribers, services]) => {
      setData({
        stats: inquiries.success && inquiries.data ? inquiries.data : null,
        projectCount: projects.meta?.total ?? 0,
        testimonialCount: Array.isArray(testimonials.data) ? testimonials.data.length : 0,
        subscriberCount: subscribers.data?.active ?? 0,
        serviceCount: Array.isArray(services.data) ? services.data.length : 0,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Portfolio overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Primary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
        <StatCard label="Projects" value={data.projectCount} sub="Total portfolio items" />
        <StatCard label="Testimonials" value={data.testimonialCount} sub="Client reviews" />
        <StatCard label="Active subscribers" value={data.subscriberCount} sub="Newsletter list" />
        <StatCard label="Services" value={data.serviceCount} sub="Offered services" />
      </div>

      {/* Inquiry stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 40 }}>
        <StatCard label="Total inquiries" value={data.stats?.total ?? 0} />
        <StatCard label="Pending" value={data.stats?.pending ?? 0} accent sub="Need attention" />
        <StatCard label="Read" value={data.stats?.read ?? 0} />
        <StatCard label="Replied" value={data.stats?.replied ?? 0} />
        <StatCard label="Archived" value={data.stats?.archived ?? 0} />
      </div>

      {/* Quick links */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
          Quick actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          <QuickLink href="/admin/projects/new" label="Add project" sub="Upload new portfolio work" />
          <QuickLink href="/admin/inquiries" label="View inquiries" sub={data.stats?.pending ? `${data.stats.pending} pending` : 'All caught up'} />
          <QuickLink href="/admin/testimonials" label="Testimonials" sub="Manage client reviews" />
          <QuickLink href="/admin/settings" label="Site settings" sub="Update profile & info" />
        </div>
      </div>
    </div>
  )
}
