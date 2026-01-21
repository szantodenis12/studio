
'use client';
import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, CheckCircle } from 'lucide-react';

const EventsPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'events-main');

  const meetingFacilities = [
    { icon: CheckCircle, text: 'Conexiune internet wireless' },
    { icon: CheckCircle, text: 'Video proiector' },
    { icon: CheckCircle, text: 'Ecran de proiecție' },
    { icon: CheckCircle, text: 'Flipchart' },
  ];
  
  const cateringOptions = [
      {
          title: 'Coffee break I',
          items: ['Apă minerală plată și carbogazoasă', 'Cafea', 'Selecție de ceaiuri']
      },
      {
          title: 'Coffee break II',
          items: ['Apă minerală plată și carbogazoasă', 'Cafea', 'Selecție de ceaiuri', 'Sucuri']
      },
      {
          title: 'Coffee break III',
          items: ['Apă minerală plată și carbogazoasă', 'Cafea', 'Selecție de ceaiuri', 'Sucuri', 'Patiserie dulce și sărată']
      },
      {
          title: 'Coffee break IV',
          items: ['Apă minerală plată și carbogazoasă', 'Cafea', 'Selecție de ceaiuri', 'Sucuri', 'Sandwich-uri']
      }
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

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
                   text="Conferințe & Evenimente"
                   delay={70}
                   className="text-4xl md:text-6xl font-bold mb-4 text-white justify-center"
                 />
                 <BlurText
                   text="Spațiul ideal pentru evenimentul dumneavoastră."
                   delay={30}
                   className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed justify-center"
                 />
               </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-background text-foreground py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="mb-16"
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <BlurText text="Eleganță și Profesionalism" delay={50} className="text-3xl font-bold text-primary mb-4 text-center justify-center" />
                        <BlurText
                            text="Hotel Maxim oferă o gamă largă de servicii şi spaţii elegante pentru organizarea de întalniri de afaceri, organizarea de conferinţe sau sesiuni de training cât şi alte tipuri de evenimente, cum ar fi: aniversări, nunţi, petreceri private. Hotel Maxim dispune de 3 săli de meeting şi de o sala de conferinta complet dotata, capacitatea acestora variind de la 16 la 100 locuri."
                            delay={20}
                            animateBy='words'
                            className="text-muted-foreground text-lg text-center leading-relaxed justify-center"
                        />
                    </motion.div>

                    <motion.div
                        className="mb-16"
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                         <h3 className="text-2xl font-bold text-primary mb-6">Întruniri</h3>
                         <p className="text-muted-foreground mb-6">
                            Toate sălile de conferinţe dispun de echipamentele necesare unei întâlniri de afaceri. Diverse evenimente pot fi organizate şi pe terasa hotelului în timpul zilelor călduroase.
                         </p>
                         <div className="grid sm:grid-cols-2 gap-4">
                            {meetingFacilities.map((facility, index) => {
                                const Icon = facility.icon;
                                return (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-3 bg-accent/50 p-3 rounded-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Icon className="w-5 h-5 text-primary shrink-0" />
                                    <span className="text-foreground">{facility.text}</span>
                                </motion.div>
                                )
                            })}
                         </div>
                    </motion.div>

                    <motion.div
                        className="mb-16"
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <h3 className="text-2xl font-bold text-primary mb-6">Catering</h3>
                         <p className="text-muted-foreground mb-8">
                            Daca in timpul meetingului sau conferintei doriti sa luati o pauza de cafea, sa serviti un sandwich, produse de patiserie sau sucuri puteti apela la serviciul nostru de catering. Mai jos aveti cateva optiuni:
                         </p>
                         <div className="grid md:grid-cols-2 gap-6">
                            {cateringOptions.map((option, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="bg-accent/50 h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-primary">{option.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {option.items.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex items-center gap-2 text-muted-foreground">
                                                        <Coffee className="w-4 h-4 text-primary/70" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                         </div>
                    </motion.div>
                    
                    <motion.div
                        className="bg-primary text-primary-foreground p-8 rounded-lg text-center"
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <h3 className="text-2xl font-bold mb-4">Ofertă Personalizată</h3>
                        <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                            Dacă doriţi să stabilim tarife preferenţiale pentru compania dumneavoastră, vă rugăm să ne contactaţi.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                           <a href="mailto:rezervari@hotel-maxim.ro" className="font-semibold hover:underline">rezervari@hotel-maxim.ro</a>
                           <span className="hidden sm:inline">|</span>
                           <a href="tel:+40359432400" className="font-semibold hover:underline">+40 359 432 400</a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
