'use client'

import { useEffect, useState, useCallback } from 'react'
import { authStorage, api } from '@/lib/api'
import type { AdminUser } from '@/lib/admin-types'
import {
  PageLoader, EmptyState, Badge, ConfirmModal, Modal,
  Field, inputStyle, selectStyle, btnStyles, tableStyles, Spinner, useToast, useAdminUser,
} from '../_components'

interface UserForm {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'SUPER_ADMIN'
}

const blank: UserForm = { name: '', email: '', password: '', role: 'ADMIN' }

export default function UsersPage() {
  const { toast } = useToast()
  const currentUser = useAdminUser()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserForm>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState<Partial<UserForm>>({})

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.get<AdminUser[]>('/users', token)
    if (res.success && Array.isArray(res.data)) setUsers(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (u: AdminUser) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setErrors({})
    setModalOpen(true)
  }

  const set = (k: keyof UserForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<UserForm> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!editing && !form.password) e.password = 'Password is required'
    if (!editing && form.password && form.password.length < 8) e.password = 'Minimum 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined

    const payload: Record<string, string> = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    }
    if (form.password) payload.password = form.password

    const res = editing
      ? await api.patch(`/users/${editing.id}`, payload, token)
      : await api.post('/users', payload, token)

    setSaving(false)
    if (res.success) {
      toast(editing ? 'User updated' : 'User created')
      setModalOpen(false)
      fetchUsers()
    } else {
      toast(res.error?.message ?? 'Failed to save', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.del(`/users/${deleteId}`, token)
    setDeleting(false)
    if (res.success) {
      toast('User deleted')
      setDeleteId(null)
      fetchUsers()
    } else {
      toast(res.error?.message ?? 'Failed to delete', 'error')
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Admin users</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{users.length} total</p>
        </div>
        {currentUser?.role === 'SUPER_ADMIN' && (
          <button onClick={openCreate} style={btnStyles.primary}>+ Add user</button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <EmptyState title="No admin users" description="Create admin accounts to manage the portfolio." />
      ) : (
        <div style={tableStyles.wrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableStyles.th}>User</th>
                <th style={tableStyles.th}>Email</th>
                <th style={tableStyles.th}>Role</th>
                <th style={tableStyles.th}>Joined</th>
                <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(232,76,13,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color: '#E84C0D', flexShrink: 0,
                      }}>
                        {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: 0 }}>{u.name}</p>
                        {currentUser?.id === u.id && (
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '1px 0 0' }}>You</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={tableStyles.td}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{u.email}</span>
                  </td>
                  <td style={tableStyles.td}>
                    <Badge label={u.role} />
                  </td>
                  <td style={tableStyles.td}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(u.createdAt)}</span>
                  </td>
                  <td style={tableStyles.tdLast}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(u)} style={{ ...btnStyles.ghost, padding: '5px 12px', fontSize: 12 }}>Edit</button>
                      {currentUser?.id !== u.id && currentUser?.role === 'SUPER_ADMIN' && (
                        <button onClick={() => setDeleteId(u.id)} style={{ ...btnStyles.danger, padding: '5px 12px', fontSize: 12 }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit user' : 'Add admin user'} maxWidth={460}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Full name" required error={errors.name}>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} placeholder="Jane Smith" />
          </Field>

          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              style={inputStyle}
              placeholder="jane@example.com"
              disabled={!!editing}
            />
          </Field>

          <Field label={editing ? 'New password (leave blank to keep)' : 'Password'} required={!editing} error={errors.password}>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              style={inputStyle}
              placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'}
              autoComplete="new-password"
            />
          </Field>

          {currentUser?.role === 'SUPER_ADMIN' && (
            <Field label="Role" required>
              <select value={form.role} onChange={(e) => set('role', e.target.value as UserForm['role'])} style={selectStyle}>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </Field>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={() => setModalOpen(false)} style={btnStyles.ghost}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnStyles.primary, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : editing ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete admin user"
        message="This will permanently delete this user and all their sessions. This cannot be undone."
      />
    </div>
  )
}
