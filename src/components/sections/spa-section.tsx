'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { GradientButton } from '../ui/gradient-button';

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
            <BlurText text="Spa & Wellness" delay={50} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-center md:justify-start" />
            <BlurText text="Relaxați-vă și reîncărcați-vă în oaza noastră de liniște. Oferim o gamă completă de tratamente, saună, jacuzzi și o piscină interioară încălzită pentru o relaxare totală." delay={20} className="text-muted-foreground mb-6 max-w-xl mx-auto md:mx-0 justify-center md:justify-start" />
            <GradientButton size="lg" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Descoperă Spa <ArrowRight className="w-4 h-4 ml-2" />
            </GradientButton>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
