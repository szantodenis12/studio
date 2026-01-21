
'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import BlurText from '@/components/ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';

export default function TermsPage() {
    const { translations } = useContext(LanguageContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-grow pt-32 md:pt-40">
                <div className="container mx-auto px-4 py-16 text-center">
                    <BlurText
                        text={translations.termsTitle}
                        delay={70}
                        className="text-4xl md:text-6xl font-headline font-bold mb-8 text-primary justify-center"
                    />
                    <div className="max-w-4xl mx-auto text-foreground text-lg leading-relaxed">
                        <p>{translations.termsComingSoon}</p>
                        <p className="mt-4">{translations.termsThankYou}</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
