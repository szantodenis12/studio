'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ContactForm from '@/components/contact-form';
import { Phone, Mail, MapPin } from 'lucide-react';
import BlurText from '@/components/ui/blur-text';

const ContactPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-grow">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative h-[60vh] w-full">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center text-white px-4">
                 <BlurText
                   text={translations.contactTitle}
                   delay={70}
                   className="text-4xl md:text-6xl font-bold mb-4 text-white justify-center"
                 />
                 <BlurText
                   text={translations.contactSubtitle}
                   delay={30}
                   className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed justify-center"
                 />
               </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-background text-foreground py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-primary mb-4">{translations.contactFormTitle}</h2>
                        <p className="text-muted-foreground mb-8">
                            {translations.contactFormDescription}
                        </p>
                        <ContactForm />
                    </div>
                    <div className="bg-accent/50 p-8 rounded-lg">
                        <h2 className="text-3xl font-bold text-primary mb-6">{translations.contactDetailsTitle}</h2>
                        <ul className="space-y-6 text-foreground">
                            <li className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h3 className="font-semibold">{translations.contactAddress}</h3>
                                    <p className="text-muted-foreground">Strada Victor Babeș 5, Oradea 410027, Romania</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Phone className="w-6 h-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h3 className="font-semibold">{translations.contactPhone}</h3>
                                    <a href="tel:+40359432400" className="text-muted-foreground hover:text-primary transition-colors">+40 359 432 400</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Mail className="w-6 h-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h3 className="font-semibold">{translations.contactEmail}</h3>
                                    <a href="mailto:rezervari@hotel-maxim.ro" className="text-muted-foreground hover:text-primary transition-colors">rezervari@hotel-maxim.ro</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
