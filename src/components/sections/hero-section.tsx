'use client';

import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Star } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';

export default function HeroSection() {
  const { translations } = useContext(LanguageContext);
  const videoUrl = "https://res.cloudinary.com/duey10uzk/video/upload/v1769513677/VIDEO_FINAL_pyvxjj.mp4";


  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 20 } },
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        className="relative z-10 flex flex-col items-center text-center text-white px-4"
      >
        <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
          <BlurText
            text="Hotel Maxim"
            delay={70}
            className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold !leading-tight text-shadow-md justify-center"
          />
        </motion.div>

        <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="flex space-x-1 my-4">
          {[...Array(4)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-accent fill-accent" />
          ))}
        </motion.div>

        <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
          <p className="text-base tracking-[0.2em] uppercase text-white/80">ORADEA</p>
        </motion.div>
      
        <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
           <BlurText
            text={translations.heroSubtitle}
            delay={30}
            className="mt-2 max-w-xl text-sm md:text-base text-white/90 text-shadow justify-center"
          />
        </motion.div>

      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <Link href="/#despre" aria-label="Scroll down">
          <ArrowDown className="w-6 h-6 text-white animate-bounce" />
        </Link>
      </motion.div>
    </section>
  );
}
