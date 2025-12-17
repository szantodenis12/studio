

'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';
import { FirebaseClientProvider } from '@/firebase';

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
    <LanguageProvider>
      <html lang="ro" className="!scroll-smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased bg-background">
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </body>
      </html>
    </LanguageProvider>
  );
}
