export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  avatar?: string | null
  createdAt: string
}

export interface Project {
  id: string
  title: string
  slug: string
  category: string
  year: string
  summary: string
  description?: string | null
  coverImage: string
  tags: string[]
  featured: boolean
  published: boolean
  order: number
  viewCount: number
  createdAt: string
  updatedAt: string
  images?: ProjectImage[]
}

export interface ProjectImage {
  id: string
  url: string
  publicId: string
  alt?: string | null
  width?: number | null
  height?: number | null
  order: number
  projectId: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company?: string | null
  text: string
  avatar?: string | null
  likes: number
  featured: boolean
  published: boolean
  order: number
  createdAt: string
}

export interface Service {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  active: boolean
  order: number
}

export type InquiryStatus = 'PENDING' | 'READ' | 'REPLIED' | 'ARCHIVED'

export interface Inquiry {
  id: string
  email: string
  name: string
  location?: string | null
  message: string
  status: InquiryStatus
  notes?: string | null
  repliedAt?: string | null
  createdAt: string
}

export type SubscriberStatus = 'ACTIVE' | 'UNSUBSCRIBED'

export interface Subscriber {
  id: string
  email: string
  status: SubscriberStatus
  source?: string | null
  unsubToken: string
  createdAt: string
  updatedAt: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string
  type?: string
  label: string
}

export interface InquiryStats {
  total: number
  pending: number
  read: number
  replied: number
  archived: number
}

export interface SubscriberStats {
  total: number
  active: number
  unsubscribed: number
}
