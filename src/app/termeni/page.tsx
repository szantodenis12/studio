'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import BlurText from '@/components/ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const TermSection = ({ title, content }) => (
    <AccordionItem value={title}>
        <AccordionTrigger className="text-xl text-left hover:no-underline">{title}</AccordionTrigger>
        <AccordionContent>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
        </AccordionContent>
    </AccordionItem>
);

export default function TermsPage() {
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
            <main className="flex-grow pt-32 md:pt-40">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <BlurText
                            text={translations.termsTitle}
                            delay={70}
                            className="text-4xl md:text-6xl font-headline font-bold mb-4 text-primary justify-center"
                        />
                        <p className="text-muted-foreground text-sm">{translations.termsLastUpdated}</p>
                    </div>

                    <div className="max-w-4xl mx-auto text-foreground">
                        <div className="prose prose-sm max-w-none bg-accent/50 p-6 rounded-lg mb-12">
                            <h3 className="text-primary">{translations.termsOperatorTitle}</h3>
                            <div dangerouslySetInnerHTML={{ __html: translations.termsOperatorContent }}/>
                            <p className="mt-4" dangerouslySetInnerHTML={{ __html: translations.termsAcceptance }} />
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {sections.map((section, index) => (
                                <TermSection key={index} title={section.title} content={section.content} />
                            ))}
                        </Accordion>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
