'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

export default function SpaSection() {
    const spaImage = PlaceHolderImages.find(p => p.id === 'spa-main');
  return (
    <AnimatedSection id="spa" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
             {spaImage && (
                <Image
                    src={spaImage.imageUrl}
                    alt={spaImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={spaImage.imageHint}
                />
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Spa & Wellness</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto md:mx-0">
              Relaxați-vă și reîncărcați-vă în oaza noastră de liniște. Oferim o gamă completă de tratamente, saună, jacuzzi și o piscină interioară încălzită pentru o relaxare totală.
            </p>
            <Button size="lg" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Descoperă Spa <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
