
'use client';

import Header from '@/components/layout/header';
import HeroSection from '@/components/sections/hero-section';
import Footer from '@/components/layout/footer';
import AboutSection from '@/components/sections/about-section';
import RoomsSection from '@/components/sections/rooms-section';
import SpaSection from '@/components/sections/spa-section';
import RestaurantSection from '@/components/sections/restaurant-section';
import EventsSection from '@/components/sections/events-section';
import GradualBlur from '@/components/ui/gradual-blur';
import { useEffect, useState, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MobileMenu from '@/components/layout/mobile-menu';


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [showBottomBlur, setShowBottomBlur] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowBottomBlur(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <RoomsSection />
        <SpaSection />
        <RestaurantSection />
        <EventsSection />
      </main>
      <Footer />
      
      <AnimatePresence>
        {showBottomBlur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GradualBlur
              target="page"
              position="bottom"
              height="4rem"
              strength={1}
              divCount={4}
              curve="bezier"
              exponential={false}
              opacity={1}
              zIndex={30}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
