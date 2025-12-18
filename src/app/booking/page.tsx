
'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BookingForm from '@/components/booking-form';
import { AnimatePresence, motion } from 'framer-motion';
import GradualBlur from '@/components/ui/gradual-blur';
import MobileMenu from '@/components/layout/mobile-menu';

export default function BookingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-grow pt-20">
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
