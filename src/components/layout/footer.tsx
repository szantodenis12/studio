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
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.466 0-9.887 4.434-9.889 9.886-.001 2.268.655 4.398 1.905 6.316l-1.295 4.721 4.763-1.244zm-1.146-5.553c-.114-.576-1.041-1.041-1.464-1.146-1.112-.275-2.224.516-2.599 1.041s-1.018 2.522-1.018 2.522c0 .576.459.932 1.018 1.488s1.654 2.454 3.754 4.553c2.1 2.1 3.563 2.94 4.12 3.5s1.244.932 1.8.932c.557 0 1.018-.458 1.293-1.017s1.018-2.689 1.018-2.689c0-.576-.459-.932-1.018-1.488s-1.654-2.454-3.754-4.553c-2.1-2.1-3.563-2.94-4.12-3.5s-1.244-.932-1.8-.932z" />
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
