export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string;
  images: string[];
  service_id: string | null;
  service?: Service;
  is_featured: boolean;
  is_published: boolean;
  shot_date: string | null;
  location: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  notes: string | null;
  created_at: string;
}

export interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  client?: Client;
  project_id: string | null;
  project?: Project;
  line_items: LineItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'draft' | 'unpaid' | 'paid' | 'cancelled';
  due_date: string | null;
  bumpa_invoice_id: string | null;
  bumpa_payment_url: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}