'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatedSection } from './animated-section';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';

export default function RestaurantSection() {
    const { translations } = useContext(LanguageContext);
    const restaurantImage = PlaceHolderImages.find(p => p.id === 'restaurant-main');
  return (
    <AnimatedSection id="restaurant" className="py-16 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 relative z-10 -mt-16 lg:mt-0 lg:-ml-16">
                <div className="bg-background/80 backdrop-blur-md p-6 md:p-12 rounded-lg shadow-2xl">
                    <BlurText text={translations.restaurantTitle} delay={70} className="text-3xl md:text-5xl font-bold mb-4 text-primary justify-start" />
                    <BlurText text={translations.restaurantText} delay={30} className="text-foreground text-sm md:text-base mb-6 max-w-xl justify-start" />
                    <Button asChild size="lg" className="rounded-full text-base">
                      <Link href="/restaurant">
                        {translations.viewMenu} <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                </div>
            </div>
            <div className="order-1 lg:order-2 relative aspect-video lg:aspect-auto lg:h-full min-h-[300px] lg:min-h-[500px]">
                 {restaurantImage && (
                    <Image
                        src={restaurantImage.imageUrl}
                        alt={restaurantImage.description}
                        fill
                        className="object-cover rounded-lg shadow-lg"
                        data-ai-hint={restaurantImage.imageHint}
                        sizes="(max-width: 1023px) 100vw, 50vw"
                    />
                )}
            </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
