'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';

const RoomPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Rooms & Suites</h1>
          <p className="text-gray-400">Loading our luxury accommodations...</p>
          {mounted && (
             <p className="mt-4 text-sm text-gold">Connecting to secure server...</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomPage;