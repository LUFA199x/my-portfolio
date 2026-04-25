'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types';

interface Props {
  project: Project;
}

export default function ProjectGallery({ project }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allImages = [project.cover_image, ...project.images].filter(Boolean);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i! > 0 ? i! - 1 : allImages.length - 1)),
    [allImages.length],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i! < allImages.length - 1 ? i! + 1 : 0)),
    [allImages.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  return (
    <>
      <div className="min-h-screen pt-28 px-6 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-mono-custom text-[10px] text-[#3a3835] hover:text-[#9a9590] tracking-widest uppercase transition-colors"
            >
              ← Back to Archive
            </Link>
          </motion.div>

          {/* Project header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-10 border-b border-[#1e1d1b]">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="inline-block w-5 h-px bg-[#2e2d2b]" />
                <p className="font-mono-custom text-[10px] text-[#c8b89a] tracking-widest uppercase">
                  {project.service?.name ?? 'Photography'}
                </p>
              </motion.div>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.05 }}
                  className="font-display text-[clamp(2.5rem,7vw,7rem)] leading-[0.88] text-[#f5f0eb]"
                >
                  {project.title.toUpperCase()}
                </motion.h1>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex gap-8"
            >
              {project.shot_date && (
                <div>
                  <p className="font-mono-custom text-[8px] text-[#2a2927] tracking-widest uppercase mb-1.5">Date</p>
                  <p className="text-[#6b6763] text-xs">
                    {new Date(project.shot_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
              {project.location && (
                <div>
                  <p className="font-mono-custom text-[8px] text-[#2a2927] tracking-widest uppercase mb-1.5">Location</p>
                  <p className="text-[#6b6763] text-xs">{project.location}</p>
                </div>
              )}
              <div>
                <p className="font-mono-custom text-[8px] text-[#2a2927] tracking-widest uppercase mb-1.5">Frames</p>
                <p className="text-[#6b6763] text-xs">{allImages.length}</p>
              </div>
            </motion.div>
          </div>

          {/* Description */}
          {project.description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-[#6b6763] text-sm font-light leading-[1.9] max-w-md mb-14 border-l-2 border-[#c8b89a]/30 pl-5"
            >
              {project.description}
            </motion.p>
          )}

          {/* Masonry image grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
            {allImages.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.03 * i }}
                className="break-inside-avoid"
              >
                <button
                  onClick={() => setLightboxIndex(i)}
                  className="group relative block w-full overflow-hidden rounded-xl"
                  data-cursor="hover"
                >
                  <Image
                    src={src}
                    alt={`${project.title} — frame ${i + 1}`}
                    width={800}
                    height={1000}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-[#0a0a0a]/0 group-hover:bg-[#0a0a0a]/35 transition-all duration-300 flex items-center justify-center rounded-xl">
                    <span className="font-mono-custom text-[9px] text-[#f5f0eb] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-[#f5f0eb]/30 px-3 py-1.5 rounded-full">
                      Open ↗
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[#0a0a0a]/97 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Image container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIndex}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative max-h-[88vh] max-w-[88vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={allImages[lightboxIndex]}
                  alt={`Frame ${lightboxIndex + 1}`}
                  width={1200}
                  height={1600}
                  className="max-h-[88vh] max-w-[88vw] w-auto h-auto object-contain rounded-xl"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-[#2a2927] bg-[#0a0a0a]/60 text-[#9a9590] hover:text-[#f5f0eb] hover:border-[#3a3835] transition-all text-lg"
            >
              ←
            </button>
            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-[#2a2927] bg-[#0a0a0a]/60 text-[#9a9590] hover:text-[#f5f0eb] hover:border-[#3a3835] transition-all text-lg"
            >
              →
            </button>
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border border-[#2a2927] bg-[#0a0a0a]/60 text-[#9a9590] hover:text-[#f5f0eb] hover:border-[#3a3835] transition-all font-mono-custom text-xs"
            >
              ✕
            </button>
            {/* Counter */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono-custom text-[9px] text-[#2a2927] tracking-widest bg-[#0a0a0a]/70 px-3 py-1.5 rounded-full">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
