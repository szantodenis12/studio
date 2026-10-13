'use client';
import Image from 'next/image';
import { useState, useContext } from 'react';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight, BedDouble, Building, User, LucideProps } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BlurText from '../ui/blur-text';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';
import type { SiteRoom } from '@/lib/rooms/types';
import { roomDescription, roomImagePlaceholders, roomPriceLabel, roomTitle } from '@/lib/rooms/normalize';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  BedDouble,
  Building,
  User,
};


export default function RoomsSection({ rooms }: { rooms: SiteRoom[] }) {
  const { translations, locale } = useContext(LanguageContext);

  const [activeRoomType, setActiveRoomType] = useState(rooms[0]?.type);
  const activeRoom = rooms.find(r => r.type === activeRoomType) ?? rooms[0];

  const activeImage = activeRoom ? roomImagePlaceholders(activeRoom)[0] : undefined;

  if (!activeRoom) return null;

  return (
    <>
      <AnimatedSection 
        id="camere" 
        className="py-16 md:py-32 overflow-hidden relative bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
              <BlurText as="h2" text={translations.roomsAndSuites} delay={120} className="text-3xl md:text-5xl font-bold mb-4 text-primary justify-center"/>
              <BlurText text={translations.roomsSubtitle} delay={60} className="text-foreground text-sm md:text-base max-w-3xl mx-auto justify-center" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="relative aspect-[5/4] rounded-lg overflow-hidden shadow-2xl group z-10"
              layout
            >
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeRoom.type}
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
                              const Icon = iconMap[room.amenities[0]?.icon] || BedDouble;
                              return (
                              <motion.div
                                  key={room.type}
                                  className={cn(
                                      "relative p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out",
                                      activeRoom.type === room.type ? "bg-white/50 shadow-md" : "hover:bg-white/30"
                                  )}
                                  onClick={() => setActiveRoomType(room.type)}
                                  layout
                              >
                                  <div className="flex items-start gap-4">
                                      <div className="mt-1">
                                          <Icon className={cn("w-6 h-6 shrink-0 transition-colors", activeRoom.type === room.type ? "text-primary" : "text-foreground")} />
                                      </div>
                                      <div>
                                          <h3 className="text-base md:text-lg font-semibold text-primary">{roomTitle(room, locale)}</h3>
                                          <AnimatePresence initial={false}>
                                          {activeRoom.type === room.type && (
                                              <motion.div
                                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                  animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                              >
                                                  <p className="text-foreground text-xs md:text-sm mb-2">{roomDescription(room, locale)}</p>
                                                  <p className="font-bold text-primary text-xs md:text-sm">{roomPriceLabel(room, locale)}*</p>
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
                          <Link href="/rezervare">
                              {translations.bookNow} <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                  </div>
              </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">{translations.localTaxDisclaimer}</p>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
