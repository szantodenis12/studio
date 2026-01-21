
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

const SpaPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'spa-main');

  const facilities = [
    {
      icon: Waves,
      title: 'Piscina Interioară Încălzită',
      description: 'Plonjați în apa noastră cristalină, menținută la o temperatură perfectă pentru relaxare, indiferent de sezon.',
    },
    {
      icon: Wind,
      title: 'Jacuzzi Revigorant',
      description: 'Lăsați jeturile puternice să vă maseze corpul, eliberând tensiunea musculară și inducând o stare de bine profundă.',
    },
    {
      icon: Thermometer,
      title: 'Saună Uscată Finlandeză',
      description: 'Detoxifiați-vă corpul și purificați-vă pielea în sauna noastră tradițională, un ritual esențial pentru sănătate și vitalitate.',
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
                   className="text-4xl md:text-6xl font-headline font-bold mb-4 text-white justify-center"
                 />
                 <BlurText
                   text="Oaza ta de liniște și reîncărcare energetică."
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
                    <h2 className="text-3xl font-headline font-bold text-primary mb-4">Un Sanctuar al Relaxării</h2>
                    <p className="text-muted-foreground text-lg">
                       Centrul nostru wellness este conceput pentru a vă oferi o evadare completă din agitația cotidiană. Aici, fiecare detaliu este gândit pentru a contribui la armonia dintre corp, minte și suflet.
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
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6 text-center">Tarife Acces Spa</h2>
                    <div className="grid sm:grid-cols-2 gap-8 text-center">
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-2xl">Adulți</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-primary">60 RON</p>
                                <p className="text-muted-foreground">/ persoană / zi</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-2xl">Copii</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-primary">45 RON</p>
                                <p className="text-muted-foreground">/ persoană / zi</p>
                            </CardContent>
                        </Card>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-6">Accesul la facilitățile SPA este gratuit pentru oaspeții hotelului.</p>
                    <p className="text-center text-sm text-muted-foreground mt-4">Pentru piscină vă oferim abonamente cu intrări multiple sau cursuri de înot pentru copii.</p>
                </div>

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpaPage;
