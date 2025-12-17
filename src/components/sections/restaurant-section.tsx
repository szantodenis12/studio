'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import BlurText from '../ui/blur-text';

export default function RestaurantSection() {
    const restaurantImage = PlaceHolderImages.find(p => p.id === 'restaurant-main');
  return (
    <AnimatedSection id="restaurant" className="relative py-20 md:py-32 overflow-hidden h-[70vh] md:h-screen flex items-center justify-center">
       {restaurantImage && (
            <Image
                src={restaurantImage.imageUrl}
                alt={restaurantImage.description}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                data-ai-hint={restaurantImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/20" />
         <div className="relative container mx-auto px-4">
            <div className="grid md:grid-cols-2">
                <div>
                     <div className="bg-background/80 backdrop-blur-md p-8 md:p-12 rounded-lg shadow-2xl">
                        <BlurText text="Restaurant Gourmand" delay={50} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-start" />
                        <BlurText text="Bucurați-vă de o experiență culinară excepțională. Maestrul nostru bucătar prepară specialități locale și internaționale folosind cele mai proaspete ingrediente." delay={20} className="text-muted-foreground mb-6 max-w-xl justify-start" />
                        <Button size="lg" className="rounded-full">
                        Vezi Meniul <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </AnimatedSection>
  );
}
