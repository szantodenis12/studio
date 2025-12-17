'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

export default function EventsSection() {
  const eventsImage = PlaceHolderImages.find(p => p.id === 'events-main');
  return (
    <AnimatedSection id="conferinte" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
            {eventsImage && (
              <Image
                src={eventsImage.imageUrl}
                alt={eventsImage.description}
                fill
                className="object-cover"
                data-ai-hint={eventsImage.imageHint}
              />
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Conferințe & Evenimente</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto md:mx-0">
              Sălile noastre de conferințe modulabile, dotate cu tehnologie de ultimă generație, sunt locația ideală pentru evenimente de afaceri sau private de succes.
            </p>
            <Button size="lg" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Detalii & Ofertă <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
