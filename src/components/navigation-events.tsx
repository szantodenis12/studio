'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Define gtag and fbq on the window object to avoid TypeScript errors
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

const GTAG_ID = 'AW-17804644643';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for consent. If not given, do nothing.
    const consent = typeof window !== 'undefined' ? localStorage.getItem('cookie_consent_status') : null;
    if (consent !== 'accepted') {
      return;
    }
    
    // --- Meta Pixel PageView ---
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // --- Google Analytics PageView ---
    if (window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', GTAG_ID, {
        page_path: url,
      });
    }

  }, [pathname, searchParams]);

  return null;
}
