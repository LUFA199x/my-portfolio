'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

// Placeholder image strip — replace with real Supabase URLs once you have them
const STRIP_IMAGES = [
  'https://framerusercontent.com/images/5IK0a0hPL9okVvrFlxsUqCO9o.jpg',
  'https://framerusercontent.com/images/P3LAKdL6gVWsMIycbBKaKZJt6N4.jpg',
  'https://framerusercontent.com/images/mcrPtuwfAsQSSppwLJbtRkWuQcI.jpg',
  'https://framerusercontent.com/images/3hpCFCquTgxbdvrDUxfpekSb5C8.jpg',
  'https://framerusercontent.com/images/guCdEvxuFZnWENJqNRcd7cJxM.jpg',
  'https://framerusercontent.com/images/GsCMyBh8YutsIgqOMek1nY1MqwE.jpg',
  'https://framerusercontent.com/images/53pKPjnMa7sYRtEZBDhCatKRM.jpg',
  'https://framerusercontent.com/images/CMEIHUtOjcRhW27zotWQ7O3NoKc.jpg',
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const lineVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Scrolling image strip — absolutely positioned */}
      <motion.div
        style={{ y: yParallax, opacity: opacityFade }}
        className="absolute inset-0 flex items-center pointer-events-none select-none"
      >
        {/* Left fade vignette */}
        <div className="absolute left-0 top-0 h-full w-32 md:w-64 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
        {/* Right fade vignette */}
        <div className="absolute right-0 top-0 h-full w-32 md:w-64 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

        <div className="flex animate-marquee gap-4 whitespace-nowrap">
          {[...STRIP_IMAGES, ...STRIP_IMAGES].map((src, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 rounded-lg overflow-hidden opacity-30"
              style={{
                width: i % 3 === 0 ? '220px' : i % 3 === 1 ? '160px' : '200px',
                height: i % 3 === 0 ? '300px' : i % 3 === 1 ? '220px' : '270px',
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="220px"
                unoptimized
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />

      {/* Hero Text Content */}
      <div className="relative z-20 flex flex-col justify-end flex-1 px-6 md:px-10 pb-16 md:pb-24 pt-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl"
        >
          {/* Tag line */}
          <motion.div variants={lineVariants} className="overflow-hidden mb-4">
            <span className="font-mono-custom text-xs text-[#c8b89a] tracking-[0.3em] uppercase">
              Visual Artist · Lagos
            </span>
          </motion.div>

          {/* Main headline */}
          <div className="overflow-hidden">
            <motion.h1
              variants={lineVariants}
              className="font-display text-[clamp(4rem,14vw,14rem)] leading-[0.88] tracking-tight text-[#f5f0eb]"
            >
              LIGHTS,
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              variants={lineVariants}
              className="font-display text-[clamp(4rem,14vw,14rem)] leading-[0.88] tracking-tight text-[#f5f0eb] pl-[6vw] md:pl-[10vw]"
            >
              LENS
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              variants={lineVariants}
              className="font-display text-[clamp(4rem,14vw,14rem)] leading-[0.88] tracking-tight text-[#c8b89a]"
            >
              & ADEGHEOSA.
            </motion.h1>
          </div>

          {/* Sub copy + CTA */}
          <div className="mt-10 flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <motion.p
              variants={lineVariants}
              className="overflow-hidden text-[#9a9590] text-sm leading-relaxed max-w-sm font-light"
            >
              I'm Adegheosa — a visual artist exploring the space between
              lifestyle, product, and emotion. From soft textures to bold
              portraits, my work captures how we live, feel, and connect.
            </motion.p>

            <motion.div variants={lineVariants} className="overflow-hidden">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-3 border border-[#3a3835] px-6 py-3 rounded-full text-[#f5f0eb] text-sm font-mono-custom tracking-wider uppercase hover:border-[#c8b89a] hover:text-[#c8b89a] transition-all duration-300"
              >
                See Work
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-mono-custom text-[10px] text-[#3a3835] tracking-[0.3em] uppercase rotate-90 origin-center">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-[#3a3835] to-transparent"
        />
      </motion.div>
    </section>
  );
}
