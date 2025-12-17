'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import BlurText from '../ui/blur-text';

const navLinks = [
  { href: '#camere', label: 'Camere' },
  { href: '#spa', label: 'Spa & Wellness' },
  { href: '#restaurant', label: 'Restaurant' },
  { href: '#conferinte', label: 'Conferințe' },
  { href: '/contact', label: 'Contact' },
];

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 h-full w-[300px] sm:w-[400px] bg-background z-50 flex flex-col"
          >
            <div className="p-4 border-b flex flex-row justify-between items-center">
              <h2 className="font-headline text-foreground text-lg">Meniu</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <nav className="flex-grow p-4">
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary"
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const headerClasses = cn(
    'fixed top-0 left-0 right-0 z-30 transition-all duration-500',
    isScrolled
      ? 'bg-primary/90 backdrop-blur-lg shadow-md'
      : 'bg-transparent'
  );

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 items-center h-20">
            {/* Left Side: Menu */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'transition-colors',
                  isScrolled
                    ? 'text-primary-foreground hover:bg-white/10'
                    : 'text-white hover:bg-white/10'
                )}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link
                href="/"
                className={cn(
                  'font-bold font-headline transition-all duration-500',
                  isScrolled
                    ? 'text-primary-foreground text-4xl'
                    : 'text-white text-5xl'
                )}
              >
                {hasMounted ? (
                   <BlurText
                    key={isScrolled ? 'scrolled' : 'top'}
                    text="Hotel Maxim"
                    delay={30}
                    animateBy="letters"
                    className="!flex-row"
                  />
                ) : (
                  <span>Hotel Maxim</span>
                )}
              </Link>
            </div>

            {/* Right Side: Actions */}
            <div className="flex justify-end items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'text-sm transition-colors',
                  isScrolled
                    ? 'text-primary-foreground hover:bg-white/10'
                    : 'text-white hover:bg-white/10'
                )}
              >
                <Globe className="w-4 h-4 mr-2" />
                RO / EN
              </Button>
              <Button
                variant={isScrolled ? 'ghost' : 'default'}
                className={cn(
                  'rounded-full hidden sm:inline-flex',
                  isScrolled
                    ? 'bg-transparent text-primary-foreground hover:bg-transparent hover:text-primary-foreground'
                    : 'bg-white text-black hover:bg-white/90'
                )}
              >
                Rezervă Acum
              </Button>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
