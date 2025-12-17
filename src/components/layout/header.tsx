
'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { Menu, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import GradualSpacing from '../ui/gradual-spacing';
import { LanguageContext } from '@/contexts/language-context';

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const { translations, navLinks } = useContext(LanguageContext);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' }
    },
    exit: { 
      x: '-100%', 
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' }
    },
  };

  const navListVariants = {
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

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
            className="fixed inset-0 z-60 bg-black/50"
            onClick={onClose}
            style={{ isolation: 'isolate' }}
          />
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 h-full w-[300px] sm:w-[400px] bg-background z-70 flex flex-col"
            style={{ isolation: 'isolate' }}
          >
            <div className="p-4 border-b flex flex-row justify-between items-center">
              <h2 className="font-headline text-foreground text-lg">Hotel Maxim</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <motion.nav 
              initial="hidden"
              animate="visible"
              variants={navListVariants}
              className="flex-grow p-4"
            >
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <motion.li key={link.href} variants={navItemVariants}>
                    <Link
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-300"
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { locale, setLocale, translations } = useContext(LanguageContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLanguageChange = () => {
    const newLocale = locale === 'ro' ? 'en' : 'ro';
    setLocale(newLocale);
  };
  
  const headerClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
    isScrolled
      ? 'bg-primary/90 backdrop-blur-lg shadow-md'
      : 'bg-transparent'
  );

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="grid h-20 grid-cols-3 items-center">
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

            <div className="flex justify-center">
              <AnimatePresence>
                {isScrolled && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        href="/"
                        className="font-bold font-headline text-primary-foreground"
                      >
                        <GradualSpacing
                          text="Hotel Maxim"
                          duration={1}
                          delayMultiple={0.08}
                          className="tracking-[-0.1em] text-3xl"
                        />
                      </Link>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageChange}
                className={cn(
                  'text-sm transition-colors',
                  isScrolled
                    ? 'text-primary-foreground hover:bg-white/10'
                    : 'text-white hover:bg-white/10'
                )}
              >
                <Globe className="w-4 h-4 mr-2" />
                {locale.toUpperCase()} / {locale === 'ro' ? 'EN' : 'RO'}
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'rounded-full hidden sm:inline-flex border-none hover:border-none',
                  isScrolled
                    ? 'text-primary-foreground hover:bg-white/10'
                    : 'text-white hover:bg-white/10'
                )}
              >
                {translations.bookNow}
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
