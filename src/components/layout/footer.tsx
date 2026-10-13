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
              <a href="tel:+40771014506" className="hover:text-accent transition-colors">+40 771 014 506</a>
            </p>
            <p className="text-base text-primary-foreground/70">
              rezervari@hotel-maxim.ro
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-4">{translations.usefulLinks}</h4>
            <ul className="space-y-2">
              <li><Link href="/camere" className="text-base hover:text-accent transition-colors">{translations.rooms}</Link></li>
              <li><Link href="/spa" className="text-base hover:text-accent transition-colors">{translations.navSpa}</Link></li>
              <li><Link href="/restaurant" className="text-base hover:text-accent transition-colors">{translations.restaurant}</Link></li>
              <li><Link href="/evenimente" className="text-base hover:text-accent transition-colors">{translations.navConferences}</Link></li>
              <li><Link href="/tarife" className="text-base hover:text-accent transition-colors">{translations.navTarife}</Link></li>
              <li><Link href="/unde-suntem" className="text-base hover:text-accent transition-colors">{translations.navContact}</Link></li>
              <li><Link href="/intrebari-frecvente" className="text-base hover:text-accent transition-colors">{translations.navFaq}</Link></li>
              <li><Link href="/termeni" className="text-base hover:text-accent transition-colors">{translations.terms}</Link></li>
              <li><Link href="/politica-cookie" className="text-base hover:text-accent transition-colors">{translations.cookiePolicyTitle}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-4">{translations.followUs}</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="https://www.facebook.com/HotelMaximoradea1" aria-label="Facebook" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="https://www.instagram.com/hotel.maxim/" aria-label="Instagram" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="https://wa.me/40771014506" aria-label="WhatsApp" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
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
          {/* ANPC links (SAL + complaints). The EU SOL/ODR platform was closed on
              20.07.2025 by Regulation (EU) 2024/3228, so it is not linked. */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.anpc.ro/sal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-start rounded-md border border-primary-foreground/30 px-4 py-2 text-left hover:border-accent hover:text-accent transition-colors"
            >
              <span className="text-xs font-bold tracking-wider">ANPC — SAL</span>
              <span className="text-[11px] text-primary-foreground/60">
                {locale === 'en' ? 'Alternative Dispute Resolution' : 'Soluționarea Alternativă a Litigiilor'}
              </span>
            </a>
            <a
              href="https://eservicii.anpc.ro/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-start rounded-md border border-primary-foreground/30 px-4 py-2 text-left hover:border-accent hover:text-accent transition-colors"
            >
              <span className="text-xs font-bold tracking-wider">ANPC</span>
              <span className="text-[11px] text-primary-foreground/60">
                {locale === 'en' ? 'Submit a complaint' : 'Depune o reclamație'}
              </span>
            </a>
          </div>
          <p className="mt-6 text-xs">
            {locale === 'en' ? 'Website created by ' : 'Site creat de '}
            <a
              href="https://epicdigitalhub.ro"
              target="_blank"
              rel="noopener"
              className="underline hover:text-accent transition-colors"
            >
              Epic Digital Hub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
