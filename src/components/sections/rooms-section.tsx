
'use client';
import Image from 'next/image';
import { useState, useContext } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight, BedDouble, Building, User, LucideProps } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BlurText from '../ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';
import { roomData } from '@/lib/room-data';
import type { Room } from '@/lib/room-data';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  BedDouble,
  Building,
  User,
};


export default function RoomsSection() {
  const { translations, locale } = useContext(LanguageContext);
  
  const rooms: Room[] = roomData;

  const [activeRoom, setActiveRoom] = useState(rooms[0]);

  const activeImage = PlaceHolderImages.find(p => p.id === activeRoom.images[0]);
  
  return (
    <>
      <AnimatedSection 
        id="camere" 
        className="py-16 md:py-32 overflow-hidden relative bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
              <BlurText text={translations.roomsAndSuites} delay={120} className="text-3xl md:text-5xl font-headline font-bold mb-4 text-primary justify-center"/>
              <BlurText text={translations.roomsSubtitle} delay={60} className="text-foreground text-sm md:text-base max-w-2xl mx-auto justify-center" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div 
              layout
              className="relative aspect-[5/4] rounded-lg overflow-hidden shadow-2xl group z-10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeRoom.id}
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0, scale: 1.15 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                >
                    {activeImage && (
                    <Image
                        src={activeImage.imageUrl}
                        alt={activeImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={activeImage.imageHint}
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <div className="relative z-10 lg:-ml-16">
                  <div className="bg-background/80 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-2xl">
                      <div className="flex flex-col gap-4">
                          {rooms.map((room) => {
                              const roomDetails = room.details[locale] || room.details.en;
                              const Icon = iconMap[room.amenities[0].icon] || BedDouble;
                              return (
                              <motion.div
                                  key={room.id}
                                  className={cn(
                                      "relative p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out",
                                      activeRoom.id === room.id ? "bg-white/50 shadow-md" : "hover:bg-white/30"
                                  )}
                                  onClick={() => setActiveRoom(room)}
                                  layout
                              >
                                  <div className="flex items-start gap-4">
                                      <div className="mt-1">
                                          <Icon className={cn("w-6 h-6 shrink-0 transition-colors", activeRoom.id === room.id ? "text-primary" : "text-foreground")} />
                                      </div>
                                      <div>
                                          <h3 className="font-headline text-base md:text-lg font-semibold text-primary">{roomDetails.title}</h3>
                                          <AnimatePresence initial={false}>
                                          {activeRoom.id === room.id && (
                                              <motion.div
                                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                  animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                              >
                                                  <p className="text-foreground text-xs md:text-sm mb-2">{roomDetails.description}</p>
                                                  <p className="font-bold text-primary text-xs md:text-sm">{roomDetails.price}</p>
                                              </motion.div>
                                          )}
                                          </AnimatePresence>
                                      </div>
                                  </div>
                              </motion.div>
                          )})}
                      </div>
                      <div className="mt-6">
                        <Button asChild size="lg" className="w-full rounded-full text-base">
                          <Link href="/booking">
                              {translations.bookNow} <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
