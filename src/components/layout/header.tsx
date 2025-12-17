'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Globe, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    isScrolled
      ? 'bg-background/95 backdrop-blur-lg shadow-md border-b'
      : 'bg-transparent'
  );

  const linkClasses = cn(
    'text-sm font-medium transition-colors',
    isScrolled ? 'text-foreground/80 hover:text-foreground' : 'text-white/80 hover:text-white'
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-20">
          {/* Left Side: Menu */}
          <div className="flex justify-start">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('transition-colors', isScrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10')}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background p-0 flex flex-col">
                 <SheetHeader className="p-4 border-b flex flex-row justify-between items-center">
                    <SheetTitle className="font-headline text-foreground text-lg">Meniu</SheetTitle>
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
                 <div className="p-4 border-t space-y-4 mt-auto">
                    <Button className="w-full rounded-full">
                      Rezervă Acum
                    </Button>
                     <Button variant="outline" className="w-full rounded-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Sună Acum
                    </Button>
                  </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link href="/" className={cn('text-3xl font-bold font-headline', isScrolled ? 'text-foreground' : 'text-white')}>
              Hotel Maxim
            </Link>
          </div>

          {/* Right Side: Actions */}
          <div className="flex justify-end items-center gap-4">
             <Button variant="ghost" size="sm" className={cn('text-sm transition-colors', isScrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10' )}>
              <Globe className="w-4 h-4 mr-2" />
              RO / EN
            </Button>
            <Button
              variant={isScrolled ? 'default' : 'outline'}
              className={cn(
                'rounded-full hidden sm:inline-flex',
                 isScrolled
                  ? 'bg-primary text-primary-foreground'
                  : 'border-white bg-white/90 text-black hover:bg-white hover:text-black'
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
