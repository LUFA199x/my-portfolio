'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Project, Service } from '@/types';

interface Props {
  projects: Project[];
  services: Service[];
}

export default function ProjectsClient({ projects, services }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter
    ? projects.filter((p) => p.service?.slug === activeFilter)
    : projects;

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <div className="mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono-custom text-xs text-[#3a3835] tracking-[0.3em] uppercase block mb-4"
          >
            All Work
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="font-display text-[clamp(4rem,10vw,9rem)] leading-none text-[#f5f0eb]"
          >
            THE <span className="text-[#c8b89a]">ARCHIVE.</span>
          </motion.h1>
        </div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          <button
            onClick={() => setActiveFilter(null)}
            className={`font-mono-custom text-[10px] tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 ${
              !activeFilter
                ? 'border-[#c8b89a] text-[#c8b89a] bg-[#c8b89a]/10'
                : 'border-[#1e1d1b] text-[#9a9590] hover:border-[#3a3835] hover:text-[#f5f0eb]'
            }`}
          >
            All ({projects.length})
          </button>
          {services.map((s) => {
            const count = projects.filter((p) => p.service?.slug === s.slug).length;
            if (count === 0) return null;
            return (
              <button
                key={s.id}
                onClick={() => setActiveFilter(s.slug)}
                className={`font-mono-custom text-[10px] tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 ${
                  activeFilter === s.slug
                    ? 'border-[#c8b89a] text-[#c8b89a] bg-[#c8b89a]/10'
                    : 'border-[#1e1d1b] text-[#9a9590] hover:border-[#3a3835] hover:text-[#f5f0eb]'
                }`}
              >
                {s.name} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
          >
            {filtered.map((project, i) => (
              <FilteredCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[#3a3835] font-mono-custom text-sm tracking-widest uppercase">
              No projects in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilteredCard({ project, index }: { project: Project; index: number }) {
  const isTall = index % 7 === 0 || index % 7 === 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.03 * index }}
      className={isTall ? 'row-span-2' : ''}
    >
      <Link
        href={`/projects/${project.slug}`}
        className={`group relative block overflow-hidden rounded-xl ${isTall ? 'aspect-[3/5]' : 'aspect-[3/4]'}`}
      >
        <Image
          src={project.cover_image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-mono-custom text-[9px] text-[#c8b89a] tracking-widest uppercase mb-1">
            {project.service?.name ?? 'Photography'}
          </p>
          <h3 className="text-[#f5f0eb] text-sm font-medium">{project.title}</h3>
        </div>
      </Link>
    </motion.div>
  );
}
