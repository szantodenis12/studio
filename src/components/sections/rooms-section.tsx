'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight, BedDouble, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BlurText from '../ui/blur-text';
import { cn } from '@/lib/utils';

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
    <AnimatedSection id="camere" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <BlurText text="Camere & Apartamente" delay={50} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-center"/>
            <BlurText text="Fiecare cameră este un sanctuar al confortului, proiectată pentru a vă oferi o experiență de neuitat." delay={20} className="text-muted-foreground max-w-2xl mx-auto justify-center" />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeRoom.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
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
            <div className="flex flex-col">
                <div className="relative flex flex-col gap-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className={cn(
                                "relative p-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out",
                                activeRoom.id === room.id ? "bg-background shadow-lg" : "hover:bg-background/50"
                            )}
                            onClick={() => setActiveRoom(room)}
                        >
                            <div className="flex items-center gap-4">
                                <room.icon className={cn("w-6 h-6 shrink-0 transition-colors", activeRoom.id === room.id ? "text-accent" : "text-muted-foreground")} />
                                <h3 className="font-headline text-lg font-semibold text-primary">{room.title}</h3>
                            </div>
                            {activeRoom.id === room.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                >
                                    <p className="text-muted-foreground text-sm mb-2">{room.description}</p>
                                    <p className="font-bold text-primary">{room.price}</p>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
                 <div className="mt-8">
                    <Button size="lg" className="w-full md:w-auto rounded-full">
                        Rezervă Acum <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
