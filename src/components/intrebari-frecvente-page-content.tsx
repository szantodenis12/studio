'use client';
import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { FAQ } from '@/content/faq';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const IntrebariFrecventePageContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-grow pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 text-center">
            Întrebări frecvente Hotel Maxim Oradea
          </h1>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Răspunsuri despre cazare, spa, restaurant, tarife, localizare și evenimente.
          </p>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((f, index) => (
              <AccordionItem key={f.intrebare} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {f.intrebare}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {f.raspuns}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IntrebariFrecventePageContent;
