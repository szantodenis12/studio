'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LanguageContext } from '@/contexts/language-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const { translations } = useContext(LanguageContext);

  useEffect(() => {
    // Check for consent on client-side only
    const consent = localStorage.getItem('cookie_consent_status');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (consent: 'accepted' | 'rejected') => {
    localStorage.setItem('cookie_consent_status', consent);
    setShowBanner(false);
    // Here you would typically trigger GTM events or load scripts
    // based on the consent given. For now, we just hide the banner.
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 z-[150] shadow-2xl"
        >
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/80 text-center sm:text-left">
              {translations.cookieBannerText}
              <Link href="/politica-cookie" className="underline font-semibold hover:text-white ml-1">
                {translations.cookieBannerLink}
              </Link>
            </p>
            <div className="flex gap-3 shrink-0">
              <Button size="sm" variant="secondary" onClick={() => handleConsent('accepted')}>
                {translations.cookieAccept}
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent border-primary-foreground/50 hover:bg-primary-foreground/10" onClick={() => handleConsent('rejected')}>
                {translations.cookieDecline}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
