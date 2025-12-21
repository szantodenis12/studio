
'use client';
import { useRef, useContext } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { LanguageContext } from '@/contexts/language-context';
import { Button } from '../ui/button';
import Link from 'next/link';

const RoomScrollShowcase = ({ rooms }) => {
  const { translations } = useContext(LanguageContext);
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const numRooms = rooms.length;
  const showcaseHeight = `${numRooms * 90}vh`;

  return (
    <div ref={targetRef} style={{ height: showcaseHeight }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Right side - Main Images */}
        <div className="absolute right-0 top-0 h-full w-full md:w-1/2">
          {rooms.map((room, i) => {
            const top = useTransform(
              scrollYProgress,
              [i / numRooms, (i + 1) / numRooms],
              ["0%", "-100%"]
            );
            
            const zIndex = numRooms - i;

            return (
              <motion.div
                key={room.id + "-image"}
                style={{ top: i < numRooms - 1 ? top : "0%", zIndex }}
                className="absolute h-full w-full"
              >
                {room.mainImage && (
                  <Image
                    src={room.mainImage.imageUrl}
                    alt={room.mainImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={room.mainImage.imageHint}
                    priority={i < 2}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Left side - Content */}
        <div className="absolute left-0 top-0 h-full w-full md:w-1/2 flex items-center bg-background">
          <div className="relative w-full h-full">
            {rooms.map((room, i) => {
              const start = i / numRooms;
              const end = (i + 1) / numRooms;
              
              // Define more deliberate fade in and fade out points
              const fadeInStart = start + 0.1; // Start fading in after 10% of the section is scrolled
              const fadeOutEnd = end - 0.1;   // Start fading out when 90% of the section is scrolled
              
              const opacityRange = [start, fadeInStart, fadeOutEnd, end];
              const opacityValues = [0, 1, 1, 0];

              // Special handling for the first room to be visible from the start
              if (i === 0) {
                  opacityRange.shift();
                  opacityValues.shift();
              }
              
              const yRange = opacityRange;
              const yValues = opacityValues.map(o => `${(1 - o) * 20}px`);

              const opacity = useTransform(scrollYProgress, opacityRange, opacityValues);
              const y = useTransform(scrollYProgress, yRange, yValues);

              return (
                <motion.div
                  key={room.id + "-content"}
                  style={{ opacity, y }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  <div className="w-full max-w-md text-left">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">{room.title}</h2>
                    <p className="text-muted-foreground mb-6">{room.description}</p>
                    
                    {room.secondaryImage &&
                        <div className="aspect-w-16 aspect-h-10 rounded-lg overflow-hidden shadow-lg mb-6">
                            <Image
                                src={room.secondaryImage.imageUrl}
                                alt={room.secondaryImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={room.secondaryImage.imageHint}
                            />
                        </div>
                    }

                    <div className="flex space-x-6 text-sm text-foreground mb-8">
                      {room.details.map(detail => (
                        <div key={detail.text} className="flex items-center gap-2">
                           <detail.icon className="w-5 h-5 text-primary"/>
                           <span>{detail.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between bg-accent/50 p-4 rounded-lg">
                      <p className="font-bold text-primary">{room.price}</p>
                      <Button asChild>
                        <Link href="/booking">{translations.bookNow}</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomScrollShowcase;
