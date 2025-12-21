
'use client';
import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BookingForm from '@/components/booking-form';
import { motion } from 'framer-motion';
import MobileMenu from '@/components/layout/mobile-menu';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BookingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'room-2-a');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover -z-10 filter blur-sm"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <main className="flex-grow flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 py-12 md:py-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <BookingForm />
            </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
