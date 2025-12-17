'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 20 } },
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          quality={100}
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

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
        <motion.p
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="text-sm font-semibold tracking-widest uppercase text-accent-foreground/80 mb-2"
        >
          Hotel de 4 stele, Oradea
        </motion.p>
        <motion.h1
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold !leading-tight text-shadow"
        >
          Hotel Maxim
        </motion.h1>
        <motion.p
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mt-4 max-w-xl text-base md:text-lg text-accent-foreground/90"
        >
          O experiență de neuitat în inima Oradei. Eleganță, confort și servicii impecabile vă așteaptă.
        </motion.p>
        <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="mt-8">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground transition-all duration-300 px-8 py-6 text-base"
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
