'use client';

import Header from '@/components/layout/header';
import HeroSection from '@/components/sections/hero-section';
import Footer from '@/components/layout/footer';
import AboutSection from '@/components/sections/about-section';
import RoomsSection from '@/components/sections/rooms-section';
import type { SiteRoom } from '@/lib/rooms/types';
import SpaSection from '@/components/sections/spa-section';
import RestaurantSection from '@/components/sections/restaurant-section';
import EventsSection from '@/components/sections/events-section';
import { useState } from 'react';
import MobileMenu from '@/components/layout/mobile-menu';

export default function HomeContent({ rooms }: { rooms: SiteRoom[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <RoomsSection rooms={rooms} />
        <SpaSection />
        <RestaurantSection />
        <EventsSection />
      </main>
      <Footer />
    </div>
  );
}
