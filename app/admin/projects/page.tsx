'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { authStorage, api } from '@/lib/api'
import type { Project } from '@/lib/admin-types'
import {
  PageLoader, EmptyState, Badge, Toggle, ConfirmModal,
  btnStyles, tableStyles, Pagination, useToast,
} from '../_components'

export default function ProjectsPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const limit = 12

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (filter === 'published') params.set('published', 'true')
    if (filter === 'draft') params.set('published', 'false')
    const res = await api.get<Project[]>(`/projects?${params}`, token)
    if (res.success && res.data) {
      setProjects(res.data)
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page, filter])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const togglePublished = async (project: Project) => {
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/projects/${project.id}`, { published: !project.published }, token)
    if (res.success) {
      setProjects((p) => p.map((x) => x.id === project.id ? { ...x, published: !x.published } : x))
      toast(`${project.title} ${project.published ? 'unpublished' : 'published'}`)
    } else {
      toast('Failed to update project', 'error')
    }
  }

  const toggleFeatured = async (project: Project) => {
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/projects/${project.id}`, { featured: !project.featured }, token)
    if (res.success) {
      setProjects((p) => p.map((x) => x.id === project.id ? { ...x, featured: !x.featured } : x))
      toast(`${project.title} ${project.featured ? 'unfeatured' : 'featured'}`)
    } else {
      toast('Failed to update project', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.del(`/projects/${deleteId}`, token)
    setDeleting(false)
    if (res.success) {
      toast('Project deleted')
      setDeleteId(null)
      fetchProjects()
    } else {
      toast('Failed to delete project', 'error')
    }
  }

  const filtered = search
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : projects

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Projects</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{total} total</p>
        </div>
        <Link href="/admin/projects/new" style={btnStyles.primary}>
          + New project
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200,
            background: '#141414', border: '1px solid #2a2a2a',
            borderRadius: 8, padding: '8px 12px',
            fontSize: 13, color: 'white', outline: 'none',
          }}
        />
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            style={{
              ...btnStyles.ghost,
              padding: '8px 14px',
              fontSize: 12,
              color: filter === f ? 'white' : 'rgba(255,255,255,0.4)',
              borderColor: filter === f ? '#444' : '#2a2a2a',
              background: filter === f ? '#1e1e1e' : 'transparent',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={search ? 'Try a different search term.' : 'Add your first project to get started.'}
          action={!search && <Link href="/admin/projects/new" style={btnStyles.primary}>Add project</Link>}
        />
      ) : (
        <>
          <div style={tableStyles.wrapper}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>Project</th>
                  <th style={tableStyles.th}>Category</th>
                  <th style={tableStyles.th}>Year</th>
                  <th style={tableStyles.th}>Views</th>
                  <th style={tableStyles.th}>Published</th>
                  <th style={tableStyles.th}>Featured</th>
                  <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id}>
                    <td style={tableStyles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1e1e1e' }}>
                          {project.coverImage && (
                            <Image
                              src={project.coverImage}
                              alt={project.title}
                              width={44}
                              height={32}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              unoptimized
                            />
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: 0 }}>{project.title}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '1px 0 0' }}>{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td style={tableStyles.td}>{project.category}</td>
                    <td style={tableStyles.td}>{project.year}</td>
                    <td style={tableStyles.td}>{project.viewCount}</td>
                    <td style={tableStyles.td}>
                      <Toggle checked={project.published} onChange={() => togglePublished(project)} />
                    </td>
                    <td style={tableStyles.td}>
                      <Toggle checked={project.featured} onChange={() => toggleFeatured(project)} />
                    </td>
                    <td style={tableStyles.tdLast}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          href={`/admin/projects/${project.slug}/edit`}
                          style={{ ...btnStyles.ghost, padding: '5px 12px', fontSize: 12 }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteId(project.id)}
                          style={{ ...btnStyles.danger, padding: '5px 12px', fontSize: 12 }}
                        >
                          Delete
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
        title="Delete project"
        message="This will permanently delete the project and all its images. This action cannot be undone."
      />
    </div>
  )
}
