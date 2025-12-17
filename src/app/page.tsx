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

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
    </div>
  );
}
