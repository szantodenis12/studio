'use client';
import React, { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LanguageContext } from '@/contexts/language-context';
import { Button } from '../ui/button';
import { AnimatedSection } from './animated-section';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const RoomDetailCard = ({ room, translations }) => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <AnimatedSection className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side: Image Carousel */}
        <div className="w-full">
          <Carousel 
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {room.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[4/3]">
                    <Image 
                      src={image.imageUrl} 
                      alt={image.description} 
                      fill 
                      className="object-cover rounded-lg shadow-lg" 
                      data-ai-hint={image.imageHint}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4" />
            <CarouselNext className="absolute right-4" />
          </Carousel>
        </div>

        {/* Right side: Room Details */}
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-primary mb-3">{room.title}</h2>
          <p className="text-muted-foreground mb-6">{room.description}</p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground mb-6">
            {room.details.map((detail, index) => {
                const Icon = detail.icon;
                return (
                    <div key={index} className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary"/>
                        <span>{detail.text}</span>
                    </div>
                )
            })}
          </div>

          <h3 className="font-semibold text-lg text-primary mb-3">Dotări principale</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground mb-8">
            {room.amenities.map((amenity, index) => {
              const Icon = amenity.icon;
              return(
              <li key={index} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <span>{amenity.text}</span>
              </li>
            )})}
          </ul>

          <div className="mt-auto flex items-center justify-between bg-accent/50 p-4 rounded-lg">
            <p className="font-bold text-primary text-lg">{room.price}</p>
            <Button asChild>
              <Link href={`/booking?roomType=${room.type}`}>{translations.bookNow}</Link>
            </Button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

const RoomScrollShowcase = ({ rooms }) => {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="divide-y divide-border">
      {rooms.map((room) => (
        <RoomDetailCard key={room.id} room={room} translations={translations} />
      ))}
    </div>
  );
};

export default RoomScrollShowcase;
