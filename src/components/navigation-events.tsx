'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';

/**
 * NavigationEventsContent handles the actual tracking logic.
 * We avoid useSearchParams() hook here to prevent static generation bailout
 * during 'next build' when output: 'export' is used.
 */
function NavigationEventsContent() {
  const pathname = usePathname();

  useEffect(() => {
    // This code only runs on the client
    if (typeof window === 'undefined') return;

    // Check for consent
    const consent = localStorage.getItem('cookie_consent_status');
    if (consent !== 'accepted') {
      return;
    }
    
    // Access search params directly from the window object
    const search = window.location.search;
    const url = pathname + (search || '');
    
    // --- Meta Pixel PageView ---
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // --- Google Analytics PageView ---
    if (window.gtag) {
      window.gtag('config', 'AW-17804644643', {
        page_path: url,
      });
    }

  }, [pathname]); // Re-run when the pathname changes

  return null;
}

/**
 * NavigationEvents is the entry point used in the layout.
 * It ensures the dynamic content is wrapped in Suspense.
 */
export default function NavigationEvents() {
  return (
    <Suspense fallback={null}>
      <NavigationEventsContent />
    </Suspense>
  );
}
