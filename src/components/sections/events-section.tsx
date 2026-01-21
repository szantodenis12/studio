
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

export default function EventsSection() {
  const { translations } = useContext(LanguageContext);
  const eventsImage = PlaceHolderImages.find(p => p.id === 'events-main');
  return (
    <AnimatedSection id="conferinte" className="relative py-16 md:py-32 overflow-hidden h-[70vh] md:h-screen flex items-center justify-center">
        {eventsImage && (
            <Image
                src={eventsImage.imageUrl}
                alt={eventsImage.description}
                fill
                className="object-cover"
                data-ai-hint={eventsImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4">
            <div className="grid md:grid-cols-2">
                <div className="md:col-start-2">
                     <div className="bg-background/80 backdrop-blur-md p-6 md:p-12 rounded-lg shadow-2xl">
                        <BlurText text={translations.eventsTitle} delay={70} className="text-3xl md:text-5xl font-bold mb-4 text-primary justify-start" />
                        <BlurText text={translations.eventsText} delay={30} className="text-foreground text-sm md:text-base mb-6 max-w-xl justify-start" />
                        <Button asChild size="lg" className="rounded-full text-base">
                            <Link href="/events">
                                {translations.detailsAndOffer} <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </AnimatedSection>
  );
}
