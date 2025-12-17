'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import BlurText from '../ui/blur-text';

export default function HeroSection() {
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
            text="Hotel de 4 stele, Oradea"
            delay={50}
            className="text-sm font-semibold tracking-widest uppercase text-accent-foreground/80 mb-2 text-shadow justify-center"
          />
        </motion.div>
        
        <BlurText
            text="Hotel Maxim"
            delay={50}
            className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold !leading-tight text-shadow-md justify-center"
          />
      
        <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
           <BlurText
            text="O experiență de neuitat în inima Oradei. Eleganță, confort și servicii impecabile vă așteaptă."
            delay={20}
            className="mt-4 max-w-xl text-base md:text-lg text-white/90 text-shadow justify-center"
          />
        </motion.div>

        <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="mt-8">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 py-6 text-base text-black bg-white/80 border-white hover:bg-white hover:text-black"
            onClick={() => document.getElementById('camere')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Descoperă
            <ArrowDown className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <ArrowDown className="w-6 h-6 text-white animate-bounce" />
      </motion.div>
    </section>
  );
}
