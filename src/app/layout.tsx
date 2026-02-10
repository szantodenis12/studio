'use client';

import './globals.css';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';
import { FirebaseClientProvider } from '@/firebase';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { Suspense } from 'react';
import { NavigationEvents } from '@/components/navigation-events';


// This is a client component, so we can't export metadata from here.
// We'll handle it in the page components or a higher-level server component if needed.
/*
export const metadata: Metadata = {
  title: 'Hotel Maxim Experience',
  description: 'O experiență de neuitat în inima Oradei',
};
*/

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
               /* uncomment the following line to override default position*/
               s.setAttribute("data-position", 3);
               /* uncomment the following line to override default size (values: small, large)*/
               /* s.setAttribute("data-size", "large");*/
               /* uncomment the following line to override default language (e.g., fr, de, es, he, nl, etc.)*/
               /* s.setAttribute("data-language", "null");*/
               /* uncomment the following line to override color set via widget (e.g., #053f67)*/
               /* s.setAttribute("data-color", "#0048FF");*/
               /* uncomment the following line to override type set via widget (1=person, 2=chair, 3=eye, 4=text)*/
               /* s.setAttribute("data-type", "1");*/
               /* s.setAttribute("data-statement_text:", "Our Accessibility Statement");*/
               /* s.setAttribute("data-statement_url", "http://www.example.com/accessibility";*/
               /* uncomment the following line to override support on mobile devices*/
               /* s.setAttribute("data-mobile", true);*/
               /* uncomment the following line to set custom trigger action for accessibility menu*/
               /* s.setAttribute("data-trigger", "triggerId")*/
               s.setAttribute("data-account", "IUWy8wxIFs");
               s.setAttribute("src", "https://cdn.userway.org/widget.js");
               (d.body || d.head).appendChild(s);
            })(document)
          `}
        </Script>

        {/* Google tag (gtag.js) */}
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

        {/* Meta Pixel Code */}
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
