'use client';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const rooms = [
  {
    id: 'room-1',
    title: 'Cameră Dublă Standard',
    description: 'Perfectă pentru cupluri, oferă confort și o priveliște superbă.',
    price: 'de la 450 RON / noapte',
  },
  {
    id: 'room-2',
    title: 'Apartament Deluxe',
    description: 'Spațiu generos, design modern și facilități premium pentru un sejur de lux.',
    price: 'de la 750 RON / noapte',
  },
  {
    id: 'room-3',
    title: 'Cameră Single',
    description: 'Ideală pentru călătorii de afaceri, combinând funcționalitatea cu stilul.',
    price: 'de la 380 RON / noapte',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RoomsSection() {
  return (
    <AnimatedSection id="camere" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Camere & Apartamente</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fiecare cameră este un sanctuar al confortului, proiectată pentru a vă oferi o experiență de neuitat.
          </p>
        </div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {rooms.map((room) => {
            const image = PlaceHolderImages.find((p) => p.id === room.id);
            return (
              <motion.div key={room.id} variants={cardVariants}>
                <Card className="overflow-hidden h-full flex flex-col group">
                  <div className="relative h-60 w-full overflow-hidden">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline">{room.title}</CardTitle>
                    <CardDescription>{room.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="mt-4">
                       <p className="font-bold text-primary">{room.price}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
         <div className="text-center mt-12">
            <Button size="lg" className="rounded-full">
              Vezi toate camerele <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
      </div>
    </AnimatedSection>
  );
}
