
'use client';

import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Star } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { GlassButton } from '../ui/glass-button';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';

export default function HeroSection() {
  const { translations } = useContext(LanguageContext);

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
          poster="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBob3RlbHxlbnwwfHx8fDE3NjU5MDQ5NTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
      >
          <source src="https://videos.pexels.com/video-files/8241135/8241135-hd_1920_1080_30fps.mp4" type="video/mp4" />
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
           <BlurText
            text={translations.heroSubtitle}
            delay={30}
            className="mt-4 max-w-xl text-base md:text-xl text-white/90 text-shadow justify-center"
          />
        </motion.div>

        <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="mt-8">
            <Link href="/booking">
                <GlassButton
                    size="lg"
                    contentClassName="flex items-center text-base md:text-lg"
                >
                    {translations.discover}
                    <ArrowDown className="w-4 h-4 ml-2" />
                </GlassButton>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <ArrowDown className="w-6 h-6 text-white animate-bounce" />
      </motion.div>
    </section>
  );
}
