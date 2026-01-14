
'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { roomData } from '@/lib/room-data';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import BookingBar from '@/components/booking-bar';
import RoomScrollShowcase from '@/components/sections/room-scroll-showcase';

const RoomPage = () => {
  const { translations, locale } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'room-2-a');

  const roomsData = roomData.map(room => {
    const details = room.details[locale] || room.details.en;
    const mainImage = PlaceHolderImages.find(p => p.id === room.images[0]);
    const secondaryImage = PlaceHolderImages.find(p => p.id === room.images[1]);
    
    const amenities = room.amenities.map(amenity => ({
      icon: LucideIcons[amenity.icon as keyof typeof LucideIcons],
      text: amenity[locale]?.text || amenity.en.text,
    }));

    const specs = room.specs.map(spec => ({
      icon: LucideIcons[spec.icon as keyof typeof LucideIcons],
      text: spec.text
    }));

    return {
      id: room.id,
      title: details.title,
      description: details.description,
      price: details.price,
      mainImage,
      secondaryImage,
      details: specs,
      amenities,
    };
  });


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
        
        <div className="mt-20">
          <RoomScrollShowcase rooms={roomsData} />
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default RoomPage;
