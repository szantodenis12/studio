'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { LanguageContext } from '@/contexts/language-context';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.05 4.94A10 10 0 0 0 12 2a10 10 0 0 0-7.07 16.97l-1.63 5.95 6.08-1.61A10 10 0 0 0 12 22a10 10 0 0 0 7.07-2.93A10 10 0 0 0 12 2a10 10 0 0 0 7.05 2.94zM12 20.13a8.39 8.39 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.39 8.39 0 0 1-1.2-4.38A8.44 8.44 0 0 1 12 3.87a8.44 8.44 0 0 1 8.44 8.44 8.44 8.44 0 0 1-8.44 7.82zM16.56 13.99c-.18-.09-1.07-.53-1.24-.59-.17-.06-.29-.09-.42.09-.13.18-.47.59-.57.7-.1.12-.2.14-.37.04-.17-.1-.71-.26-1.35-.83-.5-.45-.84-.8-1.12-1.31-.1-.12-.01-.18.08-.28.08-.08.18-.21.27-.31.09-.1.12-.18.18-.3.06-.12.03-.24 0-.33-.03-.09-.42-1.01-.57-1.38-.15-.36-.3-.31-.42-.31-.11 0-.23 0-.36 0s-.34.04-.51.23c-.17.18-.65.64-.65 1.56 0 .92.67 1.81.76 1.93s1.31 2 3.16 2.79.88.27 1.39.22c.24-.03.76-.31.87-.61s.11-.56.08-.61c-.03-.06-.15-.09-.33-.18z"/>
  </svg>
);


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
              <Link href="#" aria-label="Facebook" className="hover:text-accent transition-colors">
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
