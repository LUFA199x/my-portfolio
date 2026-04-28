'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Service } from '@/types';
import slugify from 'slugify';

export async function getServices(): Promise<Service[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createService(payload: {
  name: string;
  description?: string;
  order_index?: number;
}): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();
  const slug = slugify(payload.name, { lower: true, strict: true });

  const { error } = await supabase.from('services').insert({
    name: payload.name,
    slug,
    description: payload.description ?? null,
    order_index: payload.order_index ?? 0,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/services');
  revalidatePath('/');
  return {};
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/services');
  revalidatePath('/');
  return {};
}
