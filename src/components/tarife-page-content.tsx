'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { SiteRoom } from '@/lib/rooms/types';
import { roomPriceLabel, roomTitle } from '@/lib/rooms/normalize';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import BlurText from '@/components/ui/blur-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const TarifePageContent = ({ rooms: siteRooms }: { rooms: SiteRoom[] }) => {
  const { translations, locale } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find((p) => p.id === 'room-1-a');

  // Today's nightly price per room, from Firestore (server-rendered).
  const rooms = siteRooms.map((room) => ({
    id: room.slug,
    title: roomTitle(room, locale),
    price: roomPriceLabel(room, locale),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-grow">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative h-[50vh] w-full">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <BlurText
                  as="h1"
                  text={translations.tarifeTitle}
                  delay={70}
                  className="text-4xl md:text-6xl font-bold mb-4 text-white justify-center"
                />
                <BlurText
                  text={translations.tarifeSubtitle}
                  delay={30}
                  className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed justify-center"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-background text-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              {translations.tarifeRoomsTitle}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {rooms.map((room) => (
                <Card key={room.id} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-xl">{room.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{room.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
              {translations.ratesDisclaimer}
            </p>

            <div className="mt-16 max-w-3xl mx-auto text-center bg-accent p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-primary mb-4">{translations.roomsIncludedTitle}</h2>
              <p className="text-foreground leading-relaxed">{translations.roomsIncludedText.replace(/<\/?bold>/g, '')}</p>
            </div>
          </div>
        </div>

        <div className="bg-accent/50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              {translations.tarifeSpaTitle}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
              <Card className="bg-background text-center">
                <CardHeader>
                  <CardTitle className="text-xl">{translations.spaAdults}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">70 RON</p>
                  <p className="text-muted-foreground">{translations.spaPerPerson}</p>
                </CardContent>
              </Card>
              <Card className="bg-background text-center">
                <CardHeader>
                  <CardTitle className="text-xl">{translations.spaChildren}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">45 RON</p>
                  <p className="text-muted-foreground">{translations.spaPerPerson}</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-background text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{translations.spaFitnessTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{translations.spaFitnessPrice}</p>
                </CardContent>
              </Card>
              <Card className="bg-background text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{translations.spaSaunaTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{translations.spaSaunaPrice}</p>
                </CardContent>
              </Card>
              <Card className="bg-background text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{translations.spaPoolTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{translations.spaPoolPrice}</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">{translations.spaGuestsFree}</p>
          </div>
        </div>

        <div className="py-16 text-center">
          <Button asChild size="lg" className="rounded-full text-base">
            <Link href="/rezervare">
              {translations.tarifeCta} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TarifePageContent;
