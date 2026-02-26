'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from './ui/button';
import { LanguageContext } from '@/contexts/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { translations } = useContext(LanguageContext);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_status');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent_status', 'accepted');
    setIsVisible(false);
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent_status', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="container mx-auto">
            <div className="bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  {translations.cookieBannerText || "Acest site folosește cookie-uri pentru a vă îmbunătăți experiența."}{' '}
                  <Link href="/politica-cookie" className="underline hover:text-primary transition-colors">
                    {translations.cookieBannerLink || "Aflați mai multe."}
                  </Link>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  {translations.cookieDecline || "Refuză"}
                </Button>
                <Button size="sm" onClick={handleAccept}>
                  {translations.cookieAccept || "Acceptă tot"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}