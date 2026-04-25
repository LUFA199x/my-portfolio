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
          <div className="flex items-end justify-between mb-14">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-5"
              >
                <span className="inline-block w-5 h-px bg-[#2e2d2b]" />
                <span className="font-mono-custom text-[10px] text-[#3a3835] tracking-[0.3em] uppercase">
                  Selected Work
                </span>
              </motion.div>
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: '100%' }}
                  animate={isInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] text-[#f5f0eb]"
                >
                  THE <span className="text-[#c8b89a]">WORK.</span>
                </motion.h2>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/projects"
                className="font-mono-custom text-[10px] text-[#6b6763] hover:text-[#f5f0eb] tracking-[0.2em] uppercase transition-colors flex items-center gap-2"
              >
                View Archive
                <span className="inline-block">→</span>
              </Link>
            </motion.div>
          </div>
        )}

        {/* Masonry grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
          {displayed.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} isInView={isInView} />
          ))}
        </div>

        {limit && projects.length > limit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="text-center mt-14"
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-3 border border-[#2a2927] hover:border-[#c8b89a] px-9 py-4 rounded-full text-[#9a9590] hover:text-[#c8b89a] text-xs font-mono-custom tracking-[0.18em] uppercase transition-all duration-300"
            >
              See Full Archive
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

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

  const aspectVariants = ['aspect-[3/4]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]'];
  const aspect = aspectVariants[index % 4];
  const isTall = index % 5 === 1 || index % 5 === 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        delay: 0.04 * index,
      }}
      className={isTall ? 'row-span-2' : ''}
    >
      <Link
        href={`/projects/${project.slug}`}
        className={`block relative overflow-hidden rounded-xl ${isTall ? 'aspect-[3/5]' : aspect}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-cursor="hover"
      >
        <Image
          src={project.cover_image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/75 via-transparent to-transparent transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* Info */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3.5 transition-all duration-300"
          style={{ transform: hovered ? 'translateY(0)' : 'translateY(8px)', opacity: hovered ? 1 : 0 }}
        >
          <p className="font-mono-custom text-[8px] text-[#c8b89a] tracking-widest uppercase mb-1">
            {project.service?.name ?? 'Photography'}
          </p>
          <h3 className="text-[#f5f0eb] text-xs font-medium leading-snug">
            {project.title}
          </h3>
        </div>

        {/* Featured badge */}
        {project.is_featured && (
          <div className="absolute top-2.5 right-2.5 bg-[#c8b89a] text-[#0a0a0a] text-[7px] font-mono-custom tracking-widest uppercase px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </Link>
    </motion.div>
  );
}
