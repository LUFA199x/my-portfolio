'use server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Project } from '@/types';
import slugify from 'slugify';

// PUBLIC: Fetch all published projects
export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, service:services(id, name, slug)')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// PUBLIC: Fetch featured projects for home page
export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, service:services(id, name, slug)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('order_index', { ascending: true })
    .limit(8);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// PUBLIC: Fetch single project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, service:services(id, name, slug)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) return null;
  return data;
}

// BUILD-TIME: Fetch slugs without cookies (for generateStaticParams)
export async function getPublishedProjectSlugs(): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('is_published', true);
  return (data ?? []).map((p: { slug: string }) => p.slug);
}

// ADMIN: Fetch all projects (including drafts)
export async function getAllProjects(): Promise<Project[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, service:services(id, name, slug)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ADMIN: Create new project
export async function createProject(formData: FormData): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const service_id = formData.get('service_id') as string;
  const location = formData.get('location') as string;
  const shot_date = formData.get('shot_date') as string;
  const is_featured = formData.get('is_featured') === 'true';
  const coverImageUrl = formData.get('cover_image_url') as string;
  const imageUrls = (formData.get('image_urls') as string)
    .split(',')
    .filter(Boolean);

  const slug = slugify(title, { lower: true, strict: true });

  const { error } = await supabase.from('projects').insert({
    title,
    slug,
    description,
    service_id: service_id || null,
    location: location || null,
    shot_date: shot_date || null,
    is_featured,
    cover_image: coverImageUrl,
    images: imageUrls,
    is_published: true,
  });

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  return {};
}

// ADMIN: Update project fields
export async function updateProject(
  id: string,
  updates: { is_published?: boolean; is_featured?: boolean }
): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  return {};
}

// ADMIN: Delete project
export async function deleteProject(id: string): Promise<{ error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  return {};
}
