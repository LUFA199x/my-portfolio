'use client'

import { useEffect, useState, useCallback } from 'react'
import { authStorage, api } from '@/lib/api'
import type { Service } from '@/lib/admin-types'
import {
  PageLoader, EmptyState, Toggle, ConfirmModal, Modal,
  Field, inputStyle, btnStyles, tableStyles, Spinner, useToast,
} from '../_components'

interface ServiceForm {
  name: string
  description: string
  icon: string
  active: boolean
  order: string
}

const blank: ServiceForm = { name: '', description: '', icon: '', active: true, order: '0' }

export default function ServicesPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.get<Service[]>('/services', token)
    if (res.success && Array.isArray(res.data)) {
      setItems(res.data.sort((a, b) => a.order - b.order))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({
      name: s.name, description: s.description ?? '',
      icon: s.icon ?? '', active: s.active,
      order: String(s.order),
    })
    setModalOpen(true)
  }

  const set = (k: keyof ServiceForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return }
    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon.trim() || null,
      active: form.active,
      order: parseInt(form.order, 10) || 0,
    }

    const res = editing
      ? await api.patch(`/services/${editing.id}`, payload, token)
      : await api.post('/services', payload, token)

    setSaving(false)
    if (res.success) {
      toast(editing ? 'Service updated' : 'Service added')
      setModalOpen(false)
      fetchServices()
    } else {
      toast(res.error?.message ?? 'Failed to save', 'error')
    }
  }

  const toggleActive = async (s: Service) => {
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/services/${s.id}`, { active: !s.active }, token)
    if (res.success) {
      setItems((arr) => arr.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))
    } else {
      toast('Failed to update', 'error')
    }
  }

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const idx = items.findIndex((s) => s.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === items.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const current = items[idx]
    const swap = items[swapIdx]
    const token = authStorage.getAccessToken() ?? undefined

    await Promise.all([
      api.patch(`/services/${current.id}`, { order: swap.order }, token),
      api.patch(`/services/${swap.id}`, { order: current.order }, token),
    ])

    const updated = [...items]
    updated[idx] = { ...current, order: swap.order }
    updated[swapIdx] = { ...swap, order: current.order }
    setItems(updated.sort((a, b) => a.order - b.order))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.del(`/services/${deleteId}`, token)
    setDeleting(false)
    if (res.success) {
      toast('Service deleted')
      setDeleteId(null)
      fetchServices()
    } else {
      toast('Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Services</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{items.length} total</p>
        </div>
        <button onClick={openCreate} style={btnStyles.primary}>+ Add service</button>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add the photography services you offer."
          action={<button onClick={openCreate} style={btnStyles.primary}>Add service</button>}
        />
      ) : (
        <div style={tableStyles.wrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Order</th>
                <th style={tableStyles.th}>Service</th>
                <th style={tableStyles.th}>Slug</th>
                <th style={tableStyles.th}>Active</th>
                <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, idx) => (
                <tr key={s.id}>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        onClick={() => moveOrder(s.id, 'up')}
                        disabled={idx === 0}
                        style={{ ...btnStyles.icon, opacity: idx === 0 ? 0.2 : 0.7, padding: 3 }}
                        title="Move up"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <button
                        onClick={() => moveOrder(s.id, 'down')}
                        disabled={idx === items.length - 1}
                        style={{ ...btnStyles.icon, opacity: idx === items.length - 1 ? 0.2 : 0.7, padding: 3 }}
                        title="Move down"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    </div>
                  </td>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {s.icon && <span style={{ fontSize: 20 }}>{s.icon}</span>}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: 0 }}>{s.name}</p>
                        {s.description && (
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '1px 0 0', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.td}>
                    <code style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 }}>
                      {s.slug}
                    </code>
                  </td>
                  <td style={tableStyles.td}>
                    <Toggle checked={s.active} onChange={() => toggleActive(s)} />
                  </td>
                  <td style={tableStyles.tdLast}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(s)} style={{ ...btnStyles.ghost, padding: '5px 12px', fontSize: 12 }}>Edit</button>
                      <button onClick={() => setDeleteId(s.id)} style={{ ...btnStyles.danger, padding: '5px 12px', fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit service' : 'Add service'} maxWidth={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <Field label="Name" required>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} placeholder="e.g. Wedding Photography" />
            </Field>
            <Field label="Icon (emoji)">
              <input value={form.icon} onChange={(e) => set('icon', e.target.value)} style={{ ...inputStyle, width: 64, textAlign: 'center', fontSize: 20 }} placeholder="📷" maxLength={2} />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Brief description of this service…"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Display order">
              <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} min={0} style={inputStyle} />
            </Field>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} style={{ accentColor: '#E84C0D' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Active (visible on site)</span>
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={() => setModalOpen(false)} style={btnStyles.ghost}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnStyles.primary, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : editing ? 'Save changes' : 'Add service'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete service"
        message="This will permanently remove this service. This cannot be undone."
      />
    </div>
  )
}
