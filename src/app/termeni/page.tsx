
'use client';
import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import BlurText from '@/components/ui/blur-text';

export default function TermsPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-grow pt-32 md:pt-40">
                <div className="container mx-auto px-4 py-16 text-center">
                    <BlurText
                        text="Termeni și Condiții"
                        delay={70}
                        className="text-4xl md:text-6xl font-headline font-bold mb-8 text-primary justify-center"
                    />
                    <div className="max-w-4xl mx-auto text-foreground text-lg leading-relaxed">
                        <p>Informațiile despre termeni și condiții vor fi adăugate aici în curând.</p>
                        <p className="mt-4">Vă mulțumim pentru înțelegere.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
