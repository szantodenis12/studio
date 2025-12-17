
'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';

export default function RestaurantSection() {
    const { translations } = useContext(LanguageContext);
    const restaurantImage = PlaceHolderImages.find(p => p.id === 'restaurant-main');
  return (
    <AnimatedSection id="restaurant" className="py-20 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative z-10 lg:-mr-16">
                <div className="bg-background/80 backdrop-blur-md p-8 md:p-12 rounded-lg shadow-2xl">
                    <BlurText text={translations.restaurantTitle} delay={70} className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary justify-start" />
                    <BlurText text={translations.restaurantText} delay={30} className="text-foreground text-lg mb-6 max-w-xl justify-start" />
                    <Button size="lg" className="rounded-full">
                    {translations.viewMenu} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
            <div className="relative aspect-video">
                 {restaurantImage && (
                    <Image
                        src={restaurantImage.imageUrl}
                        alt={restaurantImage.description}
                        fill
                        className="object-cover rounded-lg shadow-lg"
                        data-ai-hint={restaurantImage.imageHint}
                    />
                )}
            </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
