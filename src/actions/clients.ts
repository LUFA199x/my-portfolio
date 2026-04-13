'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { Client } from '@/types';

export async function getClients(): Promise<Client[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createClient(payload: {
  name: string;
  email?: string;
  phone?: string;
  instagram?: string;
  notes?: string;
}): Promise<{ error?: string; client?: Client }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { client: data };
}
