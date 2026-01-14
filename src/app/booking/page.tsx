
'use client';
import { useState, Suspense } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BookingForm from '@/components/booking-form';
import { motion } from 'framer-motion';
import MobileMenu from '@/components/layout/mobile-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function BookingPageContent() {
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

      <main className="flex items-center justify-center py-24 sm:py-32">
        <div className="container mx-auto px-4">
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

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
