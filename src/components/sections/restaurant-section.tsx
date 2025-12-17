'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

export default function RestaurantSection() {
    const restaurantImage = PlaceHolderImages.find(p => p.id === 'restaurant-main');
  return (
    <AnimatedSection id="restaurant" className="py-20 md:py-32">
       <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="text-center md:text-left md:order-2">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Restaurant Gourmand</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto md:mx-0">
              Bucurați-vă de o experiență culinară excepțională. Maestrul nostru bucătar prepară specialități locale și internaționale folosind cele mai proaspete ingrediente.
            </p>
            <Button size="lg" className="rounded-full">
              Vezi Meniul <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
           <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl md:order-1">
             {restaurantImage && (
                <Image
                    src={restaurantImage.imageUrl}
                    alt={restaurantImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={restaurantImage.imageHint}
                />
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
