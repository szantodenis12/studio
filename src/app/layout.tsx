import './globals.css';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import { BASE_URL } from '@/lib/seo/metadata';
import { ConsentDefault } from '@/components/analytics/ConsentDefault';

// next/font self-hosts and inlines these at build time (no render-blocking
// request to fonts.googleapis.com, no extra preconnects needed) and avoids
// layout shift via automatic font-face `size-adjust`/metrics matching.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Hotel Maxim Oradea | Hotel 4 stele cu spa',
  description: 'Hotel de 4 stele în Oradea, la 1,1 km de centru. Camere, restaurant, piscină interioară, saună uscată și săli de conferințe.',
  keywords: 'hotel oradea, cazare oradea, hotel maxim, spa oradea, restaurant oradea, evenimente oradea',
  other: {
    // Meta Business domain verification (was hand-added to the old cPanel HTML).
    'facebook-domain-verification': '65xny0au6t5chd8igti1nqflq882tv',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`!scroll-smooth ${inter.variable} ${cormorantGaramond.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Consent Mode v2 defaults; must run before GTM loads. */}
        <ConsentDefault />
        <Script id="userway-widget" strategy="beforeInteractive">
          {`
            (function(d){
               var s = d.createElement("script");
               s.setAttribute("data-position", 3);
               s.setAttribute("data-account", "IUWy8wxIFs");
               s.setAttribute("src", "https://cdn.userway.org/widget.js");
               (d.body || d.head).appendChild(s);
            })(document)
          `}
        </Script>
      </head>
      {/* Google Ads, Meta Pixel and GA4 live in this container, not in code. */}
      <GoogleTagManager gtmId="GTM-P65B7JSR" />
      <body className="font-body antialiased bg-background">
        <LanguageProvider>
          {children}
          <Toaster />
          <CookieConsentBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
