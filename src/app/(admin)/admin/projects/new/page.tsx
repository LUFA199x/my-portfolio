'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createProject } from '@/actions/projects';

interface ServiceOption { id: string; name: string; }

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.url as string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Lazy-load services on first focus of the select
  async function loadServices() {
    if (servicesLoaded) return;
    try {
      const res = await fetch('/api/services');
      if (res.ok) setServices(await res.json());
    } catch { /* skip — form still works without services */ }
    setServicesLoaded(true);
  }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      setCoverUrl(await uploadFile(file));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cover upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!coverUrl) { setError('Please upload a cover image first.'); return; }
    setSubmitting(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    fd.set('cover_image_url', coverUrl);
    fd.set('image_urls', imageUrls.join(','));

    const result = await createProject(fd);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push('/admin/projects');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="text-[10px] font-mono text-[#3a3835] hover:text-[#9a9590] tracking-widest uppercase transition-colors"
        >
          ← Back to Projects
        </Link>
        <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide mt-4">UPLOAD PROJECT</h1>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

        {/* Cover image */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">
            Cover Image *
          </label>
          {coverUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a18] mb-2">
              <Image src={coverUrl} alt="Cover" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => setCoverUrl('')}
                className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-500/80 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#1a1a18] hover:border-[#3a3835] rounded-xl p-10 cursor-pointer transition-colors">
              <span className="text-[#3a3835] text-xs font-mono tracking-widest uppercase">
                {uploading ? 'Uploading…' : 'Click to select cover image'}
              </span>
              <input type="file" accept="image/*" onChange={handleCover} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        {/* Gallery images */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">
            Gallery Images
          </label>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {imageUrls.map((url) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-[#1a1a18]">
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 text-white text-xs transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center justify-center gap-2 border border-dashed border-[#1a1a18] hover:border-[#3a3835] rounded-xl p-4 cursor-pointer transition-colors">
            <span className="text-[#3a3835] text-xs font-mono tracking-widest uppercase">
              {uploading ? 'Uploading…' : '+ Add gallery images'}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Title */}
        <Field label="Title *" name="title" required placeholder="e.g. Gold & Silk Editorial" />

        {/* Description */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Brief description of the shoot…"
            className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none placeholder:text-[#3a3835]"
          />
        </div>

        {/* Service */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">
            Service / Category
          </label>
          <select
            name="service_id"
            onFocus={loadServices}
            className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          >
            <option value="">No category</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location" name="location" placeholder="e.g. Lagos, NG" />
          <Field label="Shot Date" name="shot_date" type="date" />
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3">
          <input type="hidden" name="is_featured" value="false" />
          <input
            type="checkbox"
            id="is_featured"
            name="is_featured"
            value="true"
            className="w-4 h-4 accent-[#c8b89a]"
          />
          <label htmlFor="is_featured" className="text-[#9a9590] text-xs font-mono tracking-widest uppercase cursor-pointer">
            Feature on homepage
          </label>
        </div>

        {error && (
          <p className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex-1 bg-[#c8b89a] text-[#0a0a0a] font-semibold py-3 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors disabled:opacity-40"
          >
            {submitting ? 'Creating…' : 'Create Project'}
          </button>
          <Link
            href="/admin/projects"
            className="px-6 py-3 border border-[#1a1a18] text-[#9a9590] rounded-xl text-xs font-mono tracking-widest uppercase hover:border-[#3a3835] hover:text-[#f5f0eb] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#3a3835]"
      />
    </div>
  );
}
