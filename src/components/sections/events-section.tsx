'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import BlurText from '../ui/blur-text';

export default function EventsSection() {
  const eventsImage = PlaceHolderImages.find(p => p.id === 'events-main');
  return (
    <AnimatedSection id="conferinte" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
            {eventsImage && (
              <Image
                src={eventsImage.imageUrl}
                alt={eventsImage.description}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                data-ai-hint={eventsImage.imageHint}
              />
            )}
          </div>
          <div className="relative z-10 lg:-ml-24">
            <div className="bg-background/80 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-2xl">
              <BlurText text="Conferințe & Evenimente" delay={70} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-start" />
              <BlurText text="Sălile noastre de conferințe modulabile, dotate cu tehnologie de ultimă generație, sunt locația ideală pentru evenimente de afaceri sau private de succes." delay={30} className="text-muted-foreground mb-6 max-w-xl justify-start" />
              <Button size="lg" className="rounded-full">
                Detalii & Ofertă <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
