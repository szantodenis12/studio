'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import roTranslations from '@/lib/locales/ro.json';
import enTranslations from '@/lib/locales/en.json';

type Locale = 'ro' | 'en';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: any;
  navLinks: { href: string; label: string }[];
};

export const LanguageContext = createContext<LanguageContextType>({
  locale: 'ro',
  setLocale: () => {},
  translations: roTranslations,
  navLinks: [],
});

const translationsMap = {
  ro: roTranslations,
  en: enTranslations,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('ro');
  const [translations, setTranslations] = useState(roTranslations);

  useEffect(() => {
    // Set html lang attribute
    document.documentElement.lang = locale;
    setTranslations(translationsMap[locale]);
  }, [locale]);
  
  const navLinks = [
    { href: '/rooms', label: translations.navRooms },
    { href: '/spa', label: translations.navSpa },
    { href: '/restaurant', label: translations.navRestaurant },
    { href: '/events', label: translations.navConferences },
    { href: '/contact', label: translations.navContact },
  ];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, translations, navLinks }}>
      {children}
    </LanguageContext.Provider>
  );
};
