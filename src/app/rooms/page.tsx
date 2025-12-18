
'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BedDouble, Building, User, Wifi, Tv, Coffee, Wind, ShowerHead } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import BlurText from '@/components/ui/blur-text';

const RoomPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roomsData = [
    {
      id: 'room-1',
      title: translations.room1Title,
      description: translations.room1Desc,
      price: translations.room1Price,
      icon: BedDouble,
      images: PlaceHolderImages.filter(p => p.id.startsWith('room-1')),
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
      images: PlaceHolderImages.filter(p => p.id.startsWith('room-2')),
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
      images: PlaceHolderImages.filter(p => p.id.startsWith('room-3')),
      amenities: [
        { icon: Wifi, text: 'Wi-Fi Gratuit' },
        { icon: Tv, text: 'TV cu ecran plat' },
        { icon: Wind, text: 'Aer condiționat' },
        { icon: ShowerHead, text: 'Cabină de duș' },
      ]
    },
  ];

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
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
      <main className="flex-grow pt-20">
        <motion.div 
          className="container mx-auto px-4 py-12 md:py-24"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-20">
            <BlurText
              text={translations.roomsAndSuites}
              delay={70}
              className="text-3xl md:text-5xl font-headline font-bold mb-4 text-primary justify-center"
            />
            <BlurText
              text={translations.roomsSubtitle}
              delay={30}
              className="text-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed justify-center"
            />
          </motion.div>

          <div className="space-y-16 md:space-y-24">
            {roomsData.map((room, index) => (
              <motion.div key={room.id} variants={itemVariants}>
                <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${index % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={index % 2 !== 0 ? 'md:col-start-2' : ''}>
                    <Carousel
                      opts={{ loop: true }}
                      plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
                      className="w-full shadow-2xl rounded-lg overflow-hidden"
                    >
                      <CarouselContent>
                        {room.images.map((image, i) => (
                          <CarouselItem key={i}>
                            <div className="aspect-w-16 aspect-h-10">
                              <Image
                                src={image.imageUrl}
                                alt={`${room.title} - imagine ${i + 1}`}
                                fill
                                className="object-cover"
                                data-ai-hint={image.imageHint}
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </Carousel>
                  </div>
                  <div className={`flex flex-col justify-center ${index % 2 !== 0 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-3">{room.title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base mb-4">{room.description}</p>
                    <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3">Facilități principale:</h4>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {room.amenities.map(amenity => (
                                <li key={amenity.text} className="flex items-center gap-2">
                                    <amenity.icon className="w-4 h-4 text-primary" />
                                    <span>{amenity.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex items-center justify-between bg-accent/50 p-4 rounded-lg">
                      <p className="font-bold text-primary text-sm md:text-base">{room.price}</p>
                      <Button asChild>
                        <Link href="/booking">{translations.bookNow}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default RoomPage;
