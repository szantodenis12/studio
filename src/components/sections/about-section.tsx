
'use client';
import { useContext } from 'react';
import { AnimatedSection } from './animated-section';
import BlurText from '../ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';

export default function AboutSection() {
  const { translations } = useContext(LanguageContext);
  return (
    <AnimatedSection id="despre" className="py-16 md:py-32 bg-accent">
      <div className="container mx-auto px-4 text-center">
        <BlurText
          text={translations.aboutUs}
          delay={70}
          className="text-3xl md:text-5xl font-headline font-bold mb-6 text-primary justify-center"
        />
        <BlurText
          text={translations.aboutText}
          delay={30}
          className="text-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed justify-center"
        />
      </div>
    </AnimatedSection>
  );
}
