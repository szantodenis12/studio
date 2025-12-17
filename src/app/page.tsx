'use client';

import Header from '@/components/layout/header';
import HeroSection from '@/components/sections/hero-section';
import Footer from '@/components/layout/footer';
import RoomsSection from '@/components/sections/rooms-section';
import SpaSection from '@/components/sections/spa-section';
import RestaurantSection from '@/components/sections/restaurant-section';
import EventsSection from '@/components/sections/events-section';
import GradualBlur from '@/components/ui/gradual-blur';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [showTopBlur, setShowTopBlur] = useState(false);
  const [showBottomBlur, setShowBottomBlur] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Show top blur when not at the top
      setShowTopBlur(scrollY > 50);

      // Hide bottom blur when scrolled to the bottom
      setShowBottomBlur(scrollY + clientHeight < scrollHeight - 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <RoomsSection />
        <SpaSection />
        <RestaurantSection />
        <EventsSection />
      </main>
      <Footer />

      <AnimatePresence>
        {showTopBlur && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
           >
            <GradualBlur
              target="page"
              position="top"
              height="8rem"
              strength={2}
              divCount={5}
              curve="bezier"
              exponential={false}
              opacity={1}
              zIndex={20}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
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
              height="8rem"
              strength={2}
              divCount={5}
              curve="bezier"
              exponential={false}
              opacity={1}
              zIndex={20}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
