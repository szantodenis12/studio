'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import Image from 'next/image';
import FlipbookMenu from '@/components/flipbook-menu';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { MenuData } from '@/services/menu-service';
import { Skeleton } from '@/components/ui/skeleton';

const MenuPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'restaurant-hero');
  const db = useFirestore();

  const menuRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'menus', 'main-menu');
  }, [db]);

  const { data: menuData, isLoading, error } = useDoc<MenuData>(menuRef);

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <Header onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-grow">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative h-[60vh] w-full">
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
               <div className="text-center text-white">
                 <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">{translations.restaurantTitle}</h1>
                 <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">O experiență culinară desăvârșită</p>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-primary text-white py-16 md:py-24">
            <div className="container mx-auto px-4">
              {isLoading && (
                <div className="w-full max-w-4xl mx-auto">
                    <Skeleton className="h-[600px] w-full rounded-lg" />
                    <div className="flex justify-between items-center mt-6">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                </div>
              )}
              {error && <p className="text-center text-red-400">A apărut o eroare la încărcarea meniului.</p>}
              {menuData && menuData.pages && (
                <FlipbookMenu pages={menuData.pages} />
              )}
               {menuData && !menuData.pages && (
                <p className="text-center text-white/70">Meniul nu este disponibil momentan.</p>
              )}
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default MenuPage;
