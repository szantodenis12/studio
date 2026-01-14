'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { AnimatedSection } from '@/components/sections/animated-section';
import { cn } from '@/lib/utils';

const StaggeredText = ({ text, className }: { text: string, className?: string }) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.h2
      className={cn("flex flex-wrap justify-start", className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={charVariants}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.h2>
  );
};

const MenuItem = ({ name, price, description }: { name: string, price: string, description?: string }) => (
    <motion.div
        className="py-4 border-b border-white/10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
    >
        <div className="flex justify-between items-baseline">
            <h4 className="text-lg font-semibold text-white">{name}</h4>
            <div className="flex-grow border-b-2 border-dotted border-white/20 mx-4"></div>
            <p className="text-lg font-semibold text-white/90">{price}</p>
        </div>
        {description && <p className="text-sm text-white/60 mt-2 font-light">{description}</p>}
    </motion.div>
);

const MenuSection = ({ title, items, image, reverse = false }: { title: string, items: any[], image?: ImagePlaceholder, reverse?: boolean }) => (
    <AnimatedSection id={title.toLowerCase().replace(/ /g, '-')} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className={cn(reverse ? 'lg:order-2' : 'lg:order-1')}>
            <StaggeredText
              text={title}
              className="text-4xl md:text-5xl font-headline font-bold mb-8 text-white"
            />
            <div className="flex flex-col">
              {items.map((item, index) => <MenuItem key={index} {...item} />)}
            </div>
          </div>
          {image?.imageUrl && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn('relative aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-2xl', reverse ? 'lg:order-1' : 'lg:order-2')}
            >
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedSection>
);

const MenuPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'restaurant-hero');

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
                 <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-white">{translations.restaurantTitle}</h1>
                 <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">O experiență culinară desăvârșită</p>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-primary text-white py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div style={{position: 'relative', paddingTop: 'max(60%, 700px)', width: '100%', height: 0}}>
                <iframe 
                  style={{position: 'absolute', border: 'none', width: '100%', height: '100%', left: 0, top: 0}} 
                  src="https://online.fliphtml5.com/hneas/MENIU-RESTAURANT-IUNIE-2025/" 
                  title="MENIU RESTAURANT IUNIE 2025" 
                  seamless={true}
                  scrolling="no" 
                  frameBorder="0" 
                  allowTransparency={true}
                  allowFullScreen={true}
                ></iframe>
              </div>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default MenuPage;
