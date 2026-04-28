'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Invoice, LineItem } from '@/types';
import { createBumpaInvoice } from '@/lib/bumpa';

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), project:projects(id, title, slug)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createInvoice(payload: {
  client_id: string;
  project_id?: string;
  line_items: LineItem[];
  due_date?: string;
  notes?: string;
  discount?: number;
}): Promise<{ error?: string; invoice?: Invoice }> {
  const supabase = createSupabaseAdminClient();

  const subtotal = payload.line_items.reduce(
    (acc, item) => acc + item.qty * item.unit_price,
    0
  );
  const discount = payload.discount ?? 0;
  const total = subtotal - discount;

  // Generate invoice number: INV-YYYYMMDD-XXXX
  const invoice_number = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Fetch client info for Bumpa
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', payload.client_id)
    .single();

  // Create invoice in Bumpa
  let bumpa_invoice_id: string | null = null;
  let bumpa_payment_url: string | null = null;

  if (client) {
    const bumpaResult = await createBumpaInvoice({
      customer_name: client.name,
      customer_email: client.email ?? '',
      invoice_number,
      line_items: payload.line_items,
      total,
      due_date: payload.due_date,
    });

    if (!bumpaResult.error) {
      bumpa_invoice_id = bumpaResult.invoice_id ?? null;
      bumpa_payment_url = bumpaResult.payment_url ?? null;
    }
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number,
      client_id: payload.client_id,
      project_id: payload.project_id ?? null,
      line_items: payload.line_items,
      subtotal,
      discount,
      total,
      due_date: payload.due_date ?? null,
      notes: payload.notes ?? null,
      status: 'unpaid',
      bumpa_invoice_id,
      bumpa_payment_url,
    })
    .select('*, client:clients(*)')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/invoices');
  return { invoice: data };
}

export async function markInvoicePaid(id: string): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/invoices');
  return {};
}

export async function cancelInvoice(id: string): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/invoices');
  return {};
}