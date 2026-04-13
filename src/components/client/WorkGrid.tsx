'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Project } from '@/types';

interface Props {
  projects: Project[];
  showHeading?: boolean;
  limit?: number;
}

export default function WorkGrid({ projects, showHeading = true, limit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });

  const displayed = limit ? projects.slice(0, limit) : projects;

  return (
    <section ref={ref} className="py-16 md:py-24 px-6 md:px-10 border-t border-[#1e1d1b]">
      <div className="max-w-7xl mx-auto">
        {showHeading && (
          <div className="flex items-end justify-between mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] text-[#f5f0eb] leading-none"
            >
              #MY <span className="text-[#c8b89a]">WORK</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/projects"
                className="font-mono-custom text-xs text-[#9a9590] hover:text-[#f5f0eb] tracking-[0.2em] uppercase transition-colors"
              >
                View All →
              </Link>
            </motion.div>
          </div>
        )}

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {displayed.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} isInView={isInView} />
          ))}
        </div>

        {limit && projects.length > limit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 border border-[#3a3835] px-8 py-3.5 rounded-full text-[#f5f0eb] text-sm font-mono-custom tracking-wider uppercase hover:border-[#c8b89a] hover:text-[#c8b89a] transition-all duration-300"
            >
              See All Work
              <span>→</span>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Individual Project Card ───────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  isInView,
}: {
  project: Project;
  index: number;
  isInView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  // Vary aspect ratio for masonry feel
  const aspectVariants = ['aspect-[3/4]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]'];
  const aspect = aspectVariants[index % 4];

  // Some cards span 2 rows on larger screens for visual rhythm
  const isTall = index % 5 === 1 || index % 5 === 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        delay: 0.04 * index,
      }}
      className={isTall ? 'row-span-2' : ''}
    >
      <Link
        href={`/projects/${project.slug}`}
        className={`block relative overflow-hidden rounded-xl ${isTall ? 'aspect-[3/5]' : aspect} group`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-cursor="hover"
      >
        {/* Image */}
        <Image
          src={project.cover_image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
        />

        {/* Dark overlay on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-[#0a0a0a]/60"
        />

        {/* Info reveal */}
        <motion.div
          animate={{ y: hovered ? 0 : 12, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="absolute bottom-0 left-0 right-0 p-4"
        >
          <p className="font-mono-custom text-[9px] text-[#c8b89a] tracking-widest uppercase mb-1">
            {project.service?.name ?? 'Photography'}
          </p>
          <h3 className="text-[#f5f0eb] text-sm font-medium leading-tight">
            {project.title}
          </h3>
        </motion.div>

        {/* Featured badge */}
        {project.is_featured && (
          <div className="absolute top-3 right-3 bg-[#c8b89a] text-[#0a0a0a] text-[8px] font-mono-custom tracking-widest uppercase px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </Link>
    </motion.div>
  );
}
