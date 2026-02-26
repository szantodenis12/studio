'use client';

import { useContext, useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { motion } from 'framer-motion';

export default function TermsPageContent() {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { title: translations.termsSection1Title, content: translations.termsSection1Content },
    { title: translations.termsSection2Title, content: translations.termsSection2Content },
    { title: translations.termsSection3Title, content: translations.termsSection3Content },
    { title: translations.termsSection4Title, content: translations.termsSection4Content },
    { title: translations.termsSection5Title, content: translations.termsSection5Content },
    { title: translations.termsSection6Title, content: translations.termsSection6Content },
    { title: translations.termsSection7Title, content: translations.termsSection7Content },
    { title: translations.termsSection8Title, content: translations.termsSection8Content },
    { title: translations.termsSection9Title, content: translations.termsSection9Content },
    { title: translations.termsSection10Title, content: translations.termsSection10Content },
    { title: translations.termsSection11Title, content: translations.termsSection11Content },
    { title: translations.termsSection12Title, content: translations.termsSection12Content },
    { title: translations.termsSection13Title, content: translations.termsSection13Content },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">
              {translations.termsTitle}
            </h1>
            <p className="text-muted-foreground mb-8">
              {translations.termsLastUpdated}
            </p>

            <div className="bg-accent/30 p-6 rounded-lg mb-12 prose prose-sm max-w-none text-foreground">
              <h2 className="text-xl font-bold mb-4">{translations.termsOperatorTitle}</h2>
              <div dangerouslySetInnerHTML={{ __html: translations.termsOperatorContent }} />
              <p className="mt-4 font-medium italic">{translations.termsAcceptance}</p>
            </div>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <section key={index} className="prose prose-neutral max-w-none">
                  <h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>
                  <div 
                    className="text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }} 
                  />
                </section>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}