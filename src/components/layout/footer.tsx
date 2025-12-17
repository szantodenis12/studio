import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-headline text-2xl font-bold mb-4">Hotel Maxim</h3>
            <p className="text-base text-primary-foreground/70">
              Str. Exemplului Nr. 123, Oradea, România
            </p>
            <p className="text-base text-primary-foreground/70">
              contact@hotelmaxim.ro
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-4">Linkuri Utile</h4>
            <ul className="space-y-2">
              <li><Link href="#camere" className="text-base hover:text-accent transition-colors">Camere</Link></li>
              <li><Link href="#spa" className="text-base hover:text-accent transition-colors">Spa</Link></li>
              <li><Link href="#restaurant" className="text-base hover:text-accent transition-colors">Restaurant</Link></li>
              <li><Link href="/termeni" className="text-base hover:text-accent transition-colors">Termeni și Condiții</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-4">Urmărește-ne</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="#" aria-label="Facebook" className="hover:text-accent transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="hover:text-accent transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Twitter" className="hover:text-accent transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-base text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} Hotel Maxim. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
