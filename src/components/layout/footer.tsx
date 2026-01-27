'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { LanguageContext } from '@/contexts/language-context';
import WhatsAppIcon from '../ui/whatsapp-icon';


export default function Footer() {
  const { translations, locale } = useContext(LanguageContext);
  const currentYear = new Date().getFullYear();

  const resetCookieConsent = () => {
    localStorage.removeItem('cookie_consent_status');
    window.location.reload();
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold mb-4">Hotel Maxim</h3>
            <p className="text-base text-primary-foreground/70">
              {translations.address}
            </p>
            <p className="text-base text-primary-foreground/70">
              rezervari@hotel-maxim.ro
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-4">{translations.usefulLinks}</h4>
            <ul className="space-y-2">
              <li><Link href="/rooms" className="text-base hover:text-accent transition-colors">{translations.rooms}</Link></li>
              <li><Link href="/spa" className="text-base hover:text-accent transition-colors">{translations.navSpa}</Link></li>
              <li><Link href="/restaurant" className="text-base hover:text-accent transition-colors">{translations.restaurant}</Link></li>
              <li><Link href="/termeni" className="text-base hover:text-accent transition-colors">{translations.terms}</Link></li>
              <li><Link href="/politica-cookie" className="text-base hover:text-accent transition-colors">{translations.cookiePolicyTitle}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-4">{translations.followUs}</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="https://www.facebook.com/HotelMaximoradea1" aria-label="Facebook" className="hover:text-accent transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="hover:text-accent transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="WhatsApp" className="hover:text-accent transition-colors">
                <WhatsAppIcon className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/70">
          <p>&copy; {currentYear} {translations.copyright}</p>
          <button onClick={resetCookieConsent} className="mt-2 text-xs underline hover:text-accent transition-colors">
            {translations.cookieSettings}
          </button>
        </div>
      </div>
    </footer>
  );
}
