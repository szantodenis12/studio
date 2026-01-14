'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import Image from 'next/image';
import FlipbookMenu from '@/components/flipbook-menu';

const MenuPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'restaurant-hero');

  // We will define the pages for our flipbook here
  const menuPages = [
    {
      title: 'Aperitive',
      items: [
        { name: 'Bruschete cu roșii și busuioc', price: '35 RON', description: 'Pâine prăjită, roșii proaspete, usturoi, busuioc, ulei de măsline extra virgin.' },
        { name: 'Tartar de somon fume', price: '55 RON', description: 'Somon proaspăt, capere, ceapă roșie, mărar, servit cu pâine prăjită.' },
        { name: 'Platou de brânzeturi românești', price: '65 RON', description: 'Selecție de brânzeturi artizanale, dulceață de ardei iute, nuci.' },
      ]
    },
    {
      title: 'Fel Principal',
      items: [
        { name: 'Mușchi de vită cu sos de piper verde', price: '95 RON', description: 'Servit cu piure de cartofi trufat.' },
        { name: 'Piept de rață cu sos de fructe de pădure', price: '85 RON', description: 'Acompaniat de varză roșie caramelizată.' },
        { name: 'Lup de mare la grătar', price: '75 RON', description: 'Servit cu sparanghel și lămâie.' },
      ]
    },
     {
      title: 'Desert',
      items: [
        { name: 'Lava cake cu înghețată de vanilie', price: '30 RON', description: 'Servit cald, cu un nucleu de ciocolată topită.' },
        { name: 'Papanași cu smântână și dulceață', price: '28 RON', description: 'Un desert românesc tradițional, reinventat.' },
        { name: 'Cheesecake cu fructe de pădure', price: '32 RON', description: 'Cremos și răcoritor, pe un blat de biscuiți crocanți.' },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-primary">
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
               <div className="text-center text-white">
                 <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-white">{translations.restaurantTitle}</h1>
                 <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">O experiență culinară desăvârșită</p>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-primary text-white py-16 md:py-24">
            <div className="container mx-auto px-4">
              <FlipbookMenu pages={menuPages} />
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default MenuPage;
