'use client'

import { useEffect, useState, useCallback } from 'react'
import { authStorage, api } from '@/lib/api'
import type { Testimonial } from '@/lib/admin-types'
import {
  PageLoader, EmptyState, Badge, Toggle, ConfirmModal, Modal,
  Field, inputStyle, btnStyles, tableStyles, Spinner, useToast,
} from '../_components'

interface TestimonialForm {
  name: string
  role: string
  company: string
  text: string
  avatar: string
  featured: boolean
  published: boolean
  order: string
}

const blank: TestimonialForm = {
  name: '', role: '', company: '', text: '', avatar: '',
  featured: false, published: true, order: '0',
}

export default function TestimonialsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<TestimonialForm>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.get<Testimonial[]>('/testimonials', token)
    if (res.success && Array.isArray(res.data)) setItems(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setModalOpen(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({
      name: t.name, role: t.role, company: t.company ?? '',
      text: t.text, avatar: t.avatar ?? '',
      featured: t.featured, published: t.published,
      order: String(t.order),
    })
    setModalOpen(true)
  }

  const set = (k: keyof TestimonialForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.text.trim()) {
      toast('Name, role and text are required', 'error')
      return
    }
    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined
    const payload = {
      name: form.name.trim(), role: form.role.trim(),
      company: form.company.trim() || null,
      text: form.text.trim(),
      avatar: form.avatar.trim() || null,
      featured: form.featured, published: form.published,
      order: parseInt(form.order, 10) || 0,
    }

    const res = editing
      ? await api.patch(`/testimonials/${editing.id}`, payload, token)
      : await api.post('/testimonials', payload, token)

    setSaving(false)
    if (res.success) {
      toast(editing ? 'Testimonial updated' : 'Testimonial added')
      setModalOpen(false)
      fetch()
    } else {
      toast(res.error?.message ?? 'Failed to save', 'error')
    }
  }

  const toggleField = async (t: Testimonial, field: 'published' | 'featured') => {
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/testimonials/${t.id}`, { [field]: !t[field] }, token)
    if (res.success) {
      setItems((arr) => arr.map((x) => x.id === t.id ? { ...x, [field]: !x[field] } : x))
      toast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`)
    } else {
      toast('Failed to update', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.del(`/testimonials/${deleteId}`, token)
    setDeleting(false)
    if (res.success) {
      toast('Testimonial deleted')
      setDeleteId(null)
      fetch()
    } else {
      toast('Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Testimonials</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{items.length} total</p>
        </div>
        <button onClick={openCreate} style={btnStyles.primary}>+ Add testimonial</button>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Add your first client review."
          action={<button onClick={openCreate} style={btnStyles.primary}>Add testimonial</button>}
        />
      ) : (
        <div style={tableStyles.wrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Client</th>
                <th style={tableStyles.th}>Role / Company</th>
                <th style={tableStyles.th}>Likes</th>
                <th style={tableStyles.th}>Published</th>
                <th style={tableStyles.th}>Featured</th>
                <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td style={tableStyles.td}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '0 0 2px' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.text}
                    </p>
                  </td>
                  <td style={tableStyles.td}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 1px' }}>{t.role}</p>
                    {t.company && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t.company}</p>}
                  </td>
                  <td style={tableStyles.td}>{t.likes}</td>
                  <td style={tableStyles.td}>
                    <Toggle checked={t.published} onChange={() => toggleField(t, 'published')} />
                  </td>
                  <td style={tableStyles.td}>
                    <Toggle checked={t.featured} onChange={() => toggleField(t, 'featured')} />
                  </td>
                  <td style={tableStyles.tdLast}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(t)} style={{ ...btnStyles.ghost, padding: '5px 12px', fontSize: 12 }}>Edit</button>
                      <button onClick={() => setDeleteId(t.id)} style={{ ...btnStyles.danger, padding: '5px 12px', fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit testimonial' : 'Add testimonial'} maxWidth={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Name" required>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} placeholder="Client name" />
            </Field>
            <Field label="Role" required>
              <input value={form.role} onChange={(e) => set('role', e.target.value)} style={inputStyle} placeholder="e.g. Bride" />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Company">
              <input value={form.company} onChange={(e) => set('company', e.target.value)} style={inputStyle} placeholder="Optional" />
            </Field>
            <Field label="Avatar URL">
              <input value={form.avatar} onChange={(e) => set('avatar', e.target.value)} style={inputStyle} placeholder="https://..." />
            </Field>
          </div>

          <Field label="Review text" required>
            <textarea
              value={form.text}
              onChange={(e) => set('text', e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
              placeholder="What the client said…"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Display order">
              <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} min={0} style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} style={{ accentColor: '#E84C0D' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Published</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} style={{ accentColor: '#E84C0D' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Featured</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={() => setModalOpen(false)} style={btnStyles.ghost}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnStyles.primary, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : editing ? 'Save changes' : 'Add testimonial'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete testimonial"
        message="This will permanently remove the testimonial. This cannot be undone."
      />
    </div>
  )
}
