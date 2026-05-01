'use client'

import { useEffect, useState, useCallback } from 'react'
import { authStorage, api } from '@/lib/api'
import type { Subscriber, SubscriberStats } from '@/lib/admin-types'
import {
  PageLoader, EmptyState, Badge, StatCard, ConfirmModal,
  btnStyles, tableStyles, Pagination, useToast,
} from '../_components'

export default function SubscribersPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<SubscriberStats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'UNSUBSCRIBED'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const limit = 25

  const fetchData = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (filter !== 'all') params.set('status', filter)

    const [listRes, statsRes] = await Promise.all([
      api.get<Subscriber[]>(`/subscribers?${params}`, token),
      api.get<SubscriberStats>('/subscribers/stats', token),
    ])

    if (listRes.success && listRes.data) {
      setItems(Array.isArray(listRes.data) ? listRes.data : [])
      setTotal(listRes.meta?.total ?? 0)
    }
    if (statsRes.success && statsRes.data) setStats(statsRes.data)
    setLoading(false)
  }, [page, filter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.del(`/subscribers/${deleteId}`, token)
    setDeleting(false)
    if (res.success) {
      toast('Subscriber removed')
      setDeleteId(null)
      fetchData()
    } else {
      toast('Failed to remove', 'error')
    }
  }

  const totalPages = Math.ceil(total / limit)
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Subscribers</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Newsletter list</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} accent sub="Receiving emails" />
          <StatCard label="Unsubscribed" value={stats.unsubscribed} />
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #1e1e1e' }}>
        {(['all', 'ACTIVE', 'UNSUBSCRIBED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', fontSize: 13,
              color: filter === f ? 'white' : 'rgba(255,255,255,0.4)',
              borderBottom: filter === f ? '2px solid #E84C0D' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No subscribers found" description="Subscribers will appear here when users sign up." />
      ) : (
        <>
          <div style={tableStyles.wrapper}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>Email</th>
                  <th style={tableStyles.th}>Status</th>
                  <th style={tableStyles.th}>Source</th>
                  <th style={tableStyles.th}>Subscribed</th>
                  <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sub) => (
                  <tr key={sub.id}>
                    <td style={tableStyles.td}>
                      <span style={{ fontSize: 13, color: 'white' }}>{sub.email}</span>
                    </td>
                    <td style={tableStyles.td}>
                      <Badge label={sub.status} />
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{sub.source ?? '—'}</span>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(sub.createdAt)}</span>
                    </td>
                    <td style={tableStyles.tdLast}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setDeleteId(sub.id)}
                          style={{ ...btnStyles.danger, padding: '5px 12px', fontSize: 12 }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove subscriber"
        message="This will permanently remove this subscriber from your list."
        confirmLabel="Remove"
      />
    </div>
  )
}
