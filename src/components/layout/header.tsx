'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#camere', label: 'Camere' },
  { href: '#spa', label: 'Spa & Wellness' },
  { href: '#restaurant', label: 'Restaurant' },
  { href: '#conferinte', label: 'Conferințe' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const headerClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
    isScrolled
      ? 'bg-primary/90 backdrop-blur-lg shadow-md'
      : 'bg-transparent'
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-20">
          {/* Left Side: Menu */}
          <div className="flex justify-start">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'transition-colors',
                    isScrolled
                      ? 'text-primary-foreground hover:bg-white/10'
                      : 'text-white hover:bg-white/10'
                  )}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] bg-background p-0 flex flex-col"
              >
                <SheetHeader className="p-4 border-b flex flex-row justify-between items-center">
                  <SheetTitle className="font-headline text-foreground text-lg">
                    Meniu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-grow p-4">
                  <ul className="space-y-4">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-lg font-medium text-foreground hover:text-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
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
              Hotel Maxim
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
  );
}
