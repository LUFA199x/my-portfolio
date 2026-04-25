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
  const topRef = useRef<HTMLDivElement>(null);

  const filtered = activeFilter
    ? projects.filter((p) => p.service?.slug === activeFilter)
    : projects;

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="inline-block w-5 h-px bg-[#2e2d2b]" />
            <span className="font-mono-custom text-[10px] text-[#3a3835] tracking-[0.3em] uppercase">
              All Work · {projects.length} projects
            </span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.05 }}
              className="font-display text-[clamp(4rem,10vw,9.5rem)] leading-[0.88] text-[#f5f0eb]"
            >
              THE <span className="text-[#c8b89a]">ARCHIVE.</span>
            </motion.h1>
          </div>
        </div>

        {/* Filter bar */}
        <motion.div
          ref={topRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-2 mb-14 pb-8 border-b border-[#1a1a18]"
        >
          <FilterPill
            label={`All (${projects.length})`}
            active={!activeFilter}
            onClick={() => setActiveFilter(null)}
          />
          {services.map((s) => {
            const count = projects.filter((p) => p.service?.slug === s.slug).length;
            if (count === 0) return null;
            return (
              <FilterPill
                key={s.id}
                label={`${s.name} (${count})`}
                active={activeFilter === s.slug}
                onClick={() => setActiveFilter(s.slug)}
              />
            );
          })}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter ?? 'all'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3"
          >
            {filtered.map((project, i) => (
              <FilteredCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-28">
            <p className="font-display text-[clamp(1.5rem,4vw,3rem)] text-[#1e1d1b] mb-3">
              NOTHING HERE YET
            </p>
            <p className="font-mono-custom text-[10px] text-[#2a2927] tracking-widest uppercase">
              No projects in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono-custom text-[10px] tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 ${
        active
          ? 'border-[#c8b89a]/50 text-[#c8b89a] bg-[#c8b89a]/10'
          : 'border-[#1e1d1b] text-[#6b6763] hover:border-[#2e2d2b] hover:text-[#9a9590]'
      }`}
    >
      {label}
    </button>
  );
}

function FilteredCard({ project, index }: { project: Project; index: number }) {
  const isTall = index % 7 === 0 || index % 7 === 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.025 * index }}
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
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-mono-custom text-[8px] text-[#c8b89a] tracking-widest uppercase mb-1">
            {project.service?.name ?? 'Photography'}
          </p>
          <h3 className="text-[#f5f0eb] text-xs font-medium leading-snug">{project.title}</h3>
        </div>
        {project.is_featured && (
          <div className="absolute top-2.5 right-2.5 bg-[#c8b89a] text-[#0a0a0a] text-[7px] font-mono-custom tracking-widest uppercase px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </Link>
    </motion.div>
  );
}
