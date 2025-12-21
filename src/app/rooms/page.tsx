
'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BedDouble, Building, User, Wifi, Tv, Coffee, Wind, ShowerHead, Users, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import BookingBar from '@/components/booking-bar';
import RoomScrollShowcase from '@/components/sections/room-scroll-showcase';

const RoomPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'room-2-a');

  const roomsData = [
    {
      id: 'room-1',
      title: translations.room1Title,
      description: translations.room1Desc,
      price: translations.room1Price,
      icon: BedDouble,
      mainImage: PlaceHolderImages.find(p => p.id === 'room-1-a'),
      secondaryImage: PlaceHolderImages.find(p => p.id === 'room-1-b'),
      details: [
        { icon: Square, text: '25 m²' },
        { icon: Users, text: 'Max 2 oaspeți' },
      ],
      amenities: [
        { icon: Wifi, text: 'Wi-Fi Gratuit' },
        { icon: Tv, text: 'TV cu ecran plat' },
        { icon: Wind, text: 'Aer condiționat' },
        { icon: ShowerHead, text: 'Duș walk-in' },
      ]
    },
    {
      id: 'room-2',
      title: translations.room2Title,
      description: translations.room2Desc,
      price: translations.room2Price,
      icon: Building,
      mainImage: PlaceHolderImages.find(p => p.id === 'room-2-a'),
      secondaryImage: PlaceHolderImages.find(p => p.id === 'room-2-c'),
      details: [
        { icon: Square, text: '50 m²' },
        { icon: Users, text: 'Max 4 oaspeți' },
      ],
      amenities: [
        { icon: Wifi, text: 'Wi-Fi Gratuit' },
        { icon: Tv, text: 'TV Smart 4K' },
        { icon: Coffee, text: 'Espressor cafea' },
        { icon: Wind, text: 'Climatizare dual-zone' },
      ]
    },
    {
      id: 'room-3',
      title: translations.room3Title,
      description: translations.room3Desc,
      price: translations.room3Price,
      icon: User,
      mainImage: PlaceHolderImages.find(p => p.id === 'room-3-a'),
      secondaryImage: PlaceHolderImages.find(p => p.id === 'room-3-b'),
      details: [
        { icon: Square, text: '20 m²' },
        { icon: Users, text: '1 oaspete' },
      ],
      amenities: [
        { icon: Wifi, text: 'Wi-Fi Gratuit' },
        { icon: Tv, text: 'TV cu ecran plat' },
        { icon: Wind, text: 'Aer condiționat' },
        { icon: ShowerHead, text: 'Cabină de duș' },
      ]
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
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center text-white">
                 <BlurText
                    text={translations.roomsAndSuites}
                    delay={70}
                    className="text-3xl md:text-5xl font-headline font-bold mb-4 text-white justify-center"
                  />
                  <BlurText
                    text={translations.roomsSubtitle}
                    delay={30}
                    className="text-white/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed justify-center"
                  />
               </div>
            </div>
          </div>
          <div className="relative container mx-auto -mt-20 z-10">
            <BookingBar />
          </div>
        </motion.div>
        
        <RoomScrollShowcase rooms={roomsData} />

      </main>
      <Footer />
    </div>
  );
};

export default RoomPage;
