'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Service } from '@/types';

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
