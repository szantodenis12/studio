'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import BlurText from '@/components/ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PolicySection = ({ title, content }) => (
    <AccordionItem value={title}>
        <AccordionTrigger className="text-xl text-left hover:no-underline">{title}</AccordionTrigger>
        <AccordionContent>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
        </AccordionContent>
    </AccordionItem>
);

export default function CookiePolicyPage() {
    const { translations } = useContext(LanguageContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = [
        { title: translations.cookiePolicySection1Title, content: translations.cookiePolicySection1Content },
        { title: translations.cookiePolicySection2Title, content: translations.cookiePolicySection2Content },
        { title: translations.cookiePolicySection3Title, content: translations.cookiePolicySection3Content },
        { title: translations.cookiePolicySection4Title, content: translations.cookiePolicySection4Content },
        { title: translations.cookiePolicySection5Title, content: translations.cookiePolicySection5Content },
        { title: translations.cookiePolicySection6Title, content: translations.cookiePolicySection6Content },
        { title: translations.cookiePolicySection7Title, content: translations.cookiePolicySection7Content },
        { title: translations.cookiePolicySection8Title, content: translations.cookiePolicySection8Content },
        { title: translations.cookiePolicyMarketingTitle, content: translations.cookiePolicyMarketingContent },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-grow pt-32 md:pt-40">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <BlurText
                            text={translations.cookiePolicyTitle}
                            delay={70}
                            className="text-4xl md:text-6xl font-headline font-bold mb-4 text-primary justify-center"
                        />
                        <p className="text-muted-foreground text-sm">{translations.cookiePolicyLastUpdated}</p>
                    </div>

                    <div className="max-w-4xl mx-auto text-foreground">
                        <div className="prose prose-sm max-w-none bg-accent/50 p-6 rounded-lg mb-12">
                            <div dangerouslySetInnerHTML={{ __html: translations.cookiePolicyOperatorPreamble }}/>
                            <div className="mt-4" dangerouslySetInnerHTML={{ __html: translations.cookiePolicyAcceptancePreamble }} />
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {sections.map((section, index) => (
                                section.title && section.content ? <PolicySection key={index} title={section.title} content={section.content} /> : null
                            ))}
                        </Accordion>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
