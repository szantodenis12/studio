import './globals.css';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { BASE_URL } from '@/lib/seo/metadata';

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

// Dynamic import with ssr: false ensures this component only runs on the client.
const NavigationEvents = dynamic(() => import('@/components/navigation-events'), { 
  ssr: false 
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Hotel Maxim Oradea | Hotel 4 stele cu spa',
  description: 'Hotel de 4 stele în Oradea, la 1,1 km de centru. Camere, restaurant, piscină interioară, saună uscată și săli de conferințe.',
  keywords: 'hotel oradea, cazare oradea, hotel maxim, spa oradea, restaurant oradea, evenimente oradea',
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

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17804644643"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17804644643');
          `}
        </Script>

        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '710253472041033');
          `}
        </Script>

      </head>
      <body className="font-body antialiased bg-background">
        <noscript>
          {/* Meta Pixel noscript fallback: must be a plain <img>, since next/image
              requires JS to render and this exists specifically for when JS is off. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=710253472041033&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <LanguageProvider>
          <Suspense fallback={null}>
            <NavigationEvents />
          </Suspense>
          {children}
          <Toaster />
          <CookieConsentBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
