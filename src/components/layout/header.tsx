
'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import GradualSpacing from '../ui/gradual-spacing';
import { LanguageContext } from '@/contexts/language-context';

export default function Header({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { locale, setLocale, translations } = useContext(LanguageContext);
  const pathname = usePathname();

  const isBookingPage = pathname === '/booking';
  const isRoomsPage = pathname === '/rooms';
  const isTermsPage = pathname === '/termeni';

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
  
  const headerIsSolid = isScrolled || isTermsPage;

  const headerClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-20',
    headerIsSolid
      ? 'bg-primary/90 backdrop-blur-lg shadow-md'
      : 'bg-transparent'
  );

  const buttonTextColor = headerIsSolid ? 'text-primary-foreground' : 'text-white';

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
                  buttonTextColor,
                  'hover:bg-white/10'
                )}
                onClick={onMenuOpen}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>

            <div className="flex justify-center">
              <Link
                  href="/"
                  className="font-bold font-headline text-primary-foreground"
                >
              <AnimatePresence>
                {headerIsSolid && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                        <GradualSpacing
                          text="Hotel Maxim"
                          duration={1}
                          delayMultiple={0.08}
                          className="tracking-[-0.1em] text-2xl md:text-3xl"
                        />
                    </motion.div>
                )}
              </AnimatePresence>
              </Link>
            </div>

            <div className="flex justify-end items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageChange}
                className={cn(
                  'text-sm transition-colors px-2 md:px-4',
                  buttonTextColor,
                  'hover:bg-white/10'
                )}
              >
                <Globe className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{locale.toUpperCase()} / {locale === 'ro' ? 'EN' : 'RO'}</span>
              </Button>
              {!(isBookingPage || isRoomsPage) && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full hidden sm:inline-flex border-none hover:border-none',
                     buttonTextColor,
                    'hover:bg-white/10'
                  )}
                >
                  <Link href="/booking">{translations.bookNow}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
