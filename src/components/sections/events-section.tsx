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
    <AnimatedSection id="conferinte" className="py-20 md:py-32 bg-secondary overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl group">
                {eventsImage && (
                  <Image
                    src={eventsImage.imageUrl}
                    alt={eventsImage.description}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={eventsImage.imageHint}
                  />
                )}
              </div>
            </div>
            <div className="md:col-span-2">
                <div className="relative md:-ml-24 bg-background p-8 rounded-lg shadow-2xl">
                    <BlurText text="Conferințe & Evenimente" delay={50} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-start" />
                    <BlurText text="Sălile noastre de conferințe modulabile, dotate cu tehnologie de ultimă generație, sunt locația ideală pentru evenimente de afaceri sau private de succes." delay={20} className="text-muted-foreground mb-6 max-w-xl justify-start" />
                    <Button size="lg" variant="outline" className="rounded-full">
                    Detalii & Ofertă <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
