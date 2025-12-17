'use client';
import Image from 'next/image';
import { useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight, BedDouble, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BlurText from '../ui/blur-text';

const rooms = [
  {
    id: 'room-1',
    title: 'Cameră Dublă Standard',
    description: 'Perfectă pentru cupluri, oferă confort și o priveliște superbă asupra orașului. Un spațiu elegant și primitor.',
    price: 'de la 450 RON / noapte',
    icon: BedDouble,
  },
  {
    id: 'room-2',
    title: 'Apartament Deluxe',
    description: 'Spațiu generos, design modern și facilități premium pentru un sejur de lux. Ideal pentru familii sau oaspeți pretențioși.',
    price: 'de la 750 RON / noapte',
    icon: Building,
  },
  {
    id: 'room-3',
    title: 'Cameră Single',
    description: 'Ideală pentru călătorii de afaceri, combinând funcționalitatea cu stilul și confortul necesar după o zi plină.',
    price: 'de la 380 RON / noapte',
    icon: User,
  },
];

export default function RoomsSection() {
  const [activeRoom, setActiveRoom] = useState(rooms[0]);

  const activeImage = PlaceHolderImages.find((p) => p.id === activeRoom.id);

  return (
    <AnimatedSection id="camere" className="py-20 md:py-32 bg-secondary overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <BlurText text="Camere & Apartamente" delay={70} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-center"/>
            <BlurText text="Fiecare cameră este un sanctuar al confortului, proiectată pentru a vă oferi o experiență de neuitat." delay={30} className="text-muted-foreground max-w-2xl mx-auto justify-center" />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="lg:col-span-1 relative aspect-[5/4] rounded-lg overflow-hidden shadow-2xl">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeRoom.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        {activeImage && (
                        <Image
                            src={activeImage.imageUrl}
                            alt={activeImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={activeImage.imageHint}
                        />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="relative lg:-ml-24 z-10">
                <div className="bg-background/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl">
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
                                        <room.icon className={cn("w-6 h-6 shrink-0 transition-colors", activeRoom.id === room.id ? "text-accent" : "text-muted-foreground")} />
                                    </div>
                                    <div>
                                        <h3 className="font-headline text-lg font-semibold text-primary">{room.title}</h3>
                                        <AnimatePresence initial={false}>
                                        {activeRoom.id === room.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <p className="text-muted-foreground text-sm mb-2">{room.description}</p>
                                                <p className="font-bold text-primary text-sm">{room.price}</p>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <Button size="lg" className="w-full rounded-full">
                            Rezervă Acum <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
