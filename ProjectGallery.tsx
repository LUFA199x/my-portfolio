'use client';

import { useState } from 'react';
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
  const prev = () => setLightboxIndex((i) => (i! > 0 ? i! - 1 : allImages.length - 1));
  const next = () => setLightboxIndex((i) => (i! < allImages.length - 1 ? i! + 1 : 0));

  return (
    <>
      <div className="min-h-screen pt-28 px-6 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link
              href="/projects"
              className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
            >
              ← Back to Work
            </Link>
          </motion.div>

          {/* Project header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-[#1e1d1b] pb-10">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono-custom text-xs text-[#c8b89a] tracking-widest uppercase mb-3"
              >
                {project.service?.name ?? 'Photography'}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[clamp(3rem,8vw,7rem)] leading-none text-[#f5f0eb]"
              >
                {project.title.toUpperCase()}
              </motion.h1>
            </div>

            <div className="flex gap-8 text-right">
              {project.shot_date && (
                <div>
                  <p className="font-mono-custom text-[9px] text-[#3a3835] tracking-widest uppercase mb-1">Date</p>
                  <p className="text-[#9a9590] text-xs">{new Date(project.shot_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              )}
              {project.location && (
                <div>
                  <p className="font-mono-custom text-[9px] text-[#3a3835] tracking-widest uppercase mb-1">Location</p>
                  <p className="text-[#9a9590] text-xs">{project.location}</p>
                </div>
              )}
              <div>
                <p className="font-mono-custom text-[9px] text-[#3a3835] tracking-widest uppercase mb-1">Frames</p>
                <p className="text-[#9a9590] text-xs">{allImages.length}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#9a9590] text-sm font-light leading-relaxed max-w-lg mb-16"
            >
              {project.description}
            </motion.p>
          )}

          {/* Image grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {allImages.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.04 * i }}
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
                  <div className="absolute inset-0 bg-[#0a0a0a]/0 group-hover:bg-[#0a0a0a]/30 transition-all duration-300 flex items-center justify-center">
                    <motion.span
                      initial={false}
                      className="text-[#f5f0eb] text-xs font-mono-custom tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      Open ↗
                    </motion.span>
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[85vh] max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[lightboxIndex]}
                alt={`Frame ${lightboxIndex + 1}`}
                width={1200}
                height={1600}
                className="max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg"
                unoptimized
              />
            </motion.div>

            {/* Controls */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9a9590] hover:text-[#f5f0eb] text-2xl transition-colors"
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9a9590] hover:text-[#f5f0eb] text-2xl transition-colors"
            >
              →
            </button>
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-[#9a9590] hover:text-[#f5f0eb] font-mono-custom text-xs tracking-widest uppercase transition-colors"
            >
              Close ✕
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono-custom text-[10px] text-[#3a3835] tracking-widest">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
