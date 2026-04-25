'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

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

const TICKER_ITEMS = [
  'Portrait', '✦', 'Fashion', '✦', 'Street', '✦', 'Editorial',
  '✦', 'Lifestyle', '✦', 'Film', '✦', 'Creative Direction', '✦',
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.2 },
  },
};

const lineVariants = {
  hidden: { y: '115%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const fadeVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacityFade = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scaleDown = useTransform(scrollYProgress, [0, 0.5], [1, 0.97]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Scrolling image strip */}
      <motion.div
        style={{ y: yParallax, opacity: opacityFade }}
        className="absolute inset-0 flex items-center pointer-events-none select-none"
      >
        <div className="absolute left-0 top-0 h-full w-28 md:w-56 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
        <div className="absolute right-0 top-0 h-full w-28 md:w-56 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

        <div className="flex animate-marquee gap-3 whitespace-nowrap">
          {[...STRIP_IMAGES, ...STRIP_IMAGES].map((src, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                width: i % 4 === 0 ? '200px' : i % 4 === 1 ? '150px' : i % 4 === 2 ? '180px' : '130px',
                height: i % 4 === 0 ? '280px' : i % 4 === 1 ? '200px' : i % 4 === 2 ? '250px' : '175px',
                opacity: 0.22 + (i % 3) * 0.04,
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10" />

      {/* Hero text */}
      <motion.div
        style={{ scale: scaleDown, opacity: opacityFade }}
        className="relative z-20 flex flex-col justify-end flex-1 px-6 md:px-10 pb-20 md:pb-28 pt-32"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl"
        >
          {/* Tag */}
          <motion.div variants={fadeVariants} className="mb-5 flex items-center gap-3">
            <span className="inline-block w-4 h-px bg-[#c8b89a]" />
            <span className="font-mono-custom text-[10px] text-[#c8b89a] tracking-[0.35em] uppercase">
              Visual Artist · Lagos
            </span>
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden">
            <motion.h1
              variants={lineVariants}
              className="font-display text-[clamp(4.5rem,15vw,15rem)] leading-[0.85] tracking-tight text-[#f5f0eb]"
            >
              LIGHTS,
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              variants={lineVariants}
              className="font-display text-[clamp(4.5rem,15vw,15rem)] leading-[0.85] tracking-tight text-[#f5f0eb] pl-[8vw] md:pl-[12vw]"
            >
              LENS
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              variants={lineVariants}
              className="font-display text-[clamp(4.5rem,15vw,15rem)] leading-[0.85] tracking-tight text-[#c8b89a]"
            >
              & ADEGHEOSA.
            </motion.h1>
          </div>

          {/* Sub copy + CTA row */}
          <div className="mt-12 flex flex-col md:flex-row md:items-end gap-8 md:gap-20">
            <motion.p
              variants={fadeVariants}
              className="text-[#6b6763] text-sm leading-[1.8] max-w-[300px] font-light"
            >
              Exploring the space between lifestyle, product, and emotion —
              from soft textures to bold portraits, capturing how we live,
              feel, and connect.
            </motion.p>

            <motion.div variants={fadeVariants} className="flex items-center gap-4">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-3 bg-[#f5f0eb] text-[#0a0a0a] px-7 py-3.5 rounded-full text-xs font-mono-custom tracking-[0.15em] uppercase hover:bg-[#c8b89a] transition-colors duration-300"
              >
                View Work
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300 text-sm">→</span>
              </Link>
              <a
                href="mailto:adegheosa@email.com"
                className="inline-flex items-center gap-2 border border-[#2a2927] text-[#9a9590] hover:text-[#f5f0eb] hover:border-[#3a3835] px-7 py-3.5 rounded-full text-xs font-mono-custom tracking-[0.15em] uppercase transition-all duration-300"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.7 }}
        className="absolute bottom-10 right-8 z-20 flex flex-col items-center gap-3"
      >
        <span className="font-mono-custom text-[9px] text-[#2a2927] tracking-[0.35em] uppercase" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-[#3a3835] to-transparent origin-top"
        />
      </motion.div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-[#1a1a18] bg-[#0a0a0a]/60 backdrop-blur-sm overflow-hidden">
        <div className="flex animate-marquee-slow gap-0 whitespace-nowrap py-2.5">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className={`font-mono-custom text-[9px] tracking-[0.25em] uppercase px-5 ${
                item === '✦' ? 'text-[#c8b89a]' : 'text-[#2e2d2b]'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
