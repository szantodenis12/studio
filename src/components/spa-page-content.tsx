'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Wind, Thermometer } from 'lucide-react';

const SpaPageContent = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'spa-main');

  const facilities = [
    {
      icon: Waves,
      title: translations.facilityPoolTitle,
      description: translations.facilityPoolDescription,
    },
    {
      icon: Wind,
      title: translations.facilityJacuzziTitle,
      description: translations.facilityJacuzziDescription,
    },
    {
      icon: Thermometer,
      title: translations.facilitySaunaTitle,
      description: translations.facilitySaunaDescription,
    },
  ];

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
                   text={translations.spaTitle}
                   delay={70}
                   className="text-4xl md:text-6xl font-bold mb-4 text-white justify-center"
                 />
                 <BlurText
                   text={translations.spaSubtitle}
                   delay={30}
                   className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed justify-center"
                 />
               </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-background text-foreground py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-primary mb-4">{translations.spaSectionTitle}</h2>
                    <p className="text-muted-foreground text-lg">
                       {translations.spaSectionDescription}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {facilities.map((facility, index) => {
                        const Icon = facility.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="bg-accent p-4 rounded-full">
                                        <Icon className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{facility.title}</h3>
                                <p className="text-muted-foreground">{facility.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="bg-accent/50 p-8 rounded-lg max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-primary mb-6 text-center">{translations.spaPricingTitle}</h2>

                    <p className="text-center text-lg text-muted-foreground mb-4">{translations.spaGeneralAccessTitle}</p>
                    <div className="grid sm:grid-cols-2 gap-8 text-center">
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-2xl">{translations.spaAdults}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-primary">70 RON</p>
                                <p className="text-muted-foreground">{translations.spaPerPerson}</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-2xl">{translations.spaChildren}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-primary">45 RON</p>
                                <p className="text-muted-foreground">{translations.spaPerPerson}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="text-center text-lg text-muted-foreground mt-12 mb-6">{translations.spaIndividualServicesTitle}</p>
                    <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl">{translations.spaFitnessTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">{translations.spaFitnessPrice.split('/')[0].trim()}</p>
                                <p className="text-muted-foreground">/ {translations.spaFitnessPrice.split('/')[1].trim()}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl">{translations.spaSaunaTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">{translations.spaSaunaPrice.split('/')[0].trim()}</p>
                                <p className="text-muted-foreground">/ {translations.spaSaunaPrice.split('/')[1].trim()}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl">{translations.spaPoolTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">{translations.spaPoolPrice.split('/')[0].trim()}</p>
                                <p className="text-muted-foreground">/ {translations.spaPoolPrice.split('/')[1].trim()}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-8">{translations.spaGuestsFree}</p>
                    <p className="text-center text-sm text-muted-foreground mt-4">{translations.spaPoolOffer}</p>
                </div>

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpaPageContent;
