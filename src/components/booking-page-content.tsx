'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';
import MobileMenu from '@/components/layout/mobile-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import dynamic from 'next/dynamic';
import type { SiteRoom } from '@/lib/rooms/types';

const BookingForm = dynamic(() => import('@/components/booking-form'), { 
  loading: () => <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-lg border border-white/20 text-white p-6 md:p-10 rounded-lg shadow-2xl text-center">Loading Form...</div>,
  ssr: false 
});

function BookingFormWrapper({ rooms }: { rooms: SiteRoom[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <BookingForm rooms={rooms} />
    </motion.div>
  );
}

export default function BookingPageContent({ rooms }: { rooms: SiteRoom[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'room-2-a');

  return (
    <div
      className="flex flex-col min-h-screen leading-none bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: heroImage ? `url(${heroImage.imageUrl})` : 'none' }}
    >
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex flex-col items-center justify-center py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <h1 className="sr-only">Rezervare Hotel Maxim Oradea</h1>
          <BookingFormWrapper rooms={rooms} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
