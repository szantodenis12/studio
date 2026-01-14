
'use client';
import Image from 'next/image';
import { useState, useContext } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight, BedDouble, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BlurText from '../ui/blur-text';
import RoomGalleryModal from '../ui/room-gallery-modal';
import CameraIcon from '../ui/camera-icon';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';

export default function RoomsSection() {
  const { translations } = useContext(LanguageContext);
  
  const rooms = [
    {
      id: 'room-1',
      title: translations.room1Title,
      description: translations.room1Desc,
      price: translations.room1Price,
      icon: BedDouble,
      images: PlaceHolderImages.filter(p => p.id.startsWith('room-1'))
    },
    {
      id: 'room-2',
      title: translations.room2Title,
      description: translations.room2Desc,
      price: translations.room2Price,
      icon: Building,
      images: PlaceHolderImages.filter(p => p.id.startsWith('room-2'))
    },
    {
      id: 'room-3',
      title: translations.room3Title,
      description: translations.room3Desc,
      price: translations.room3Price,
      icon: User,
      images: PlaceHolderImages.filter(p => p.id.startsWith('room-3'))
    },
  ];

  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const activeImage = activeRoom.images[0];
  
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
              className="relative aspect-[5/4] rounded-lg overflow-hidden shadow-2xl group z-10 cursor-pointer"
              onClick={() => setIsGalleryOpen(true)}
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
              <div 
                className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              >
                <div className="text-white transform scale-125">
                  <CameraIcon />
                  <span className="sr-only">{translations.viewGallery}</span>
                </div>
              </div>
            </motion.div>
            <div className="relative z-10 lg:-ml-16">
                  <div className="bg-background/80 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-2xl">
                      <div className="flex flex-col gap-4">
                          {rooms.map((room) => (
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
                                          <room.icon className={cn("w-6 h-6 shrink-0 transition-colors", activeRoom.id === room.id ? "text-primary" : "text-foreground")} />
                                      </div>
                                      <div>
                                          <h3 className="font-headline text-base md:text-lg font-semibold text-primary">{room.title}</h3>
                                          <AnimatePresence initial={false}>
                                          {activeRoom.id === room.id && (
                                              <motion.div
                                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                  animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                              >
                                                  <p className="text-foreground text-xs md:text-sm mb-2">{room.description}</p>
                                                  <p className="font-bold text-primary text-xs md:text-sm">{room.price}</p>
                                              </motion.div>
                                          )}
                                          </AnimatePresence>
                                      </div>
                                  </div>
                              </motion.div>
                          ))}
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
      <RoomGalleryModal 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialRooms={rooms}
        initialRoomId={activeRoom.id}
      />
    </>
  );
}
