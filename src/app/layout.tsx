import './globals.css';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';
import { FirebaseClientProvider } from '@/firebase';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamic import with ssr: false ensures this component only runs on the client.
const NavigationEvents = dynamic(() => import('@/components/navigation-events'), { 
  ssr: false 
});

export const metadata: Metadata = {
  title: 'Hotel Maxim Oradea | Official Website',
  description: 'Descoperă eleganța și confortul în inima Oradei. Hotel Maxim oferă camere elegante, piscină, spa și servicii de 4 stele pentru afaceri și relaxare.',
  keywords: 'hotel oradea, cazare oradea, hotel maxim, spa oradea, restaurant oradea, evenimente oradea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="!scroll-smooth" suppressHydrationWarning>
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

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=710253472041033&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <LanguageProvider>
          <FirebaseClientProvider>
            <Suspense fallback={null}>
              <NavigationEvents />
            </Suspense>
            {children}
            <Toaster />
            <CookieConsentBanner />
          </FirebaseClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
