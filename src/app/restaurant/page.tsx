
'use client';
import { useState, useContext } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileMenu from '@/components/layout/mobile-menu';
import { LanguageContext } from '@/contexts/language-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { AnimatedSection } from '@/components/sections/animated-section';

const MenuPage = () => {
  const { translations } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'restaurant-hero');

  const menuData = {
    appetizers: {
      title: 'Aperitive',
      image: PlaceHolderImages.find(p => p.id === 'appetizer-dish'),
      items: [
        { name: 'Bruschete cu roșii și busuioc', price: '35 RON', description: 'Pâine prăjită, roșii proaspete, usturoi, busuioc, ulei de măsline extra virgin.' },
        { name: 'Tartar de somon fume', price: '55 RON', description: 'Somon proaspăt, capere, ceapă roșie, mărar, servit cu pâine prăjită.' },
        { name: 'Platou de brânzeturi românești', price: '65 RON', description: 'Selecție de brânzeturi artizanale, dulceață de ardei iute, nuci.' },
      ]
    },
    mainCourses: {
        title: 'Feluri Principale',
        image: PlaceHolderImages.find(p => p.id === 'main-course-dish'),
        items: [
          { name: 'Mușchi de vită cu sos de piper verde', price: '110 RON', description: 'Mușchi de vită maturat, sos cremos de piper verde, piure de cartofi cu trufe.' },
          { name: 'Piept de rață cu piure de păstârnac', price: '95 RON', description: 'Piept de rață crocant, piure fin de păstârnac, sos de fructe de pădure.' },
          { name: 'Lup de mare la grătar cu legume', price: '85 RON', description: 'File de lup de mare proaspăt, sparanghel, roșii cherry, lămâie.' },
        ]
    },
    desserts: {
        title: 'Deserturi',
        image: PlaceHolderImages.find(p => p.id === 'dessert-dish'),
        items: [
          { name: 'Lava cake cu înghețată de vanilie', price: '40 RON', description: 'Prăjitură de ciocolată cu inimă lichidă, servită cu înghețată artizanală.' },
          { name: 'Papanași cu smântână și dulceață', price: '35 RON', description: 'Papanași tradiționali, smântână fină, dulceață de afine de casă.' },
          { name: 'Cheesecake cu fructul pasiunii', price: '40 RON', description: 'Cremă de brânză fină pe blat de biscuiți, topping de fructul pasiunii.' },
        ]
    },
    drinks: {
        title: 'Băuturi',
        items: [
          { name: 'Apă plată / minerală', price: '15 RON' },
          { name: 'Espresso / Cappuccino', price: '18 RON' },
          { name: 'Selecție de vinuri locale (pahar)', price: '25 RON' },
          { name: 'Cocktail Hugo', price: '35 RON' },
        ]
    }
  };

  const MenuItem = ({ name, price, description }) => (
    <motion.div 
        className="py-4 border-b border-white/20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex justify-between items-baseline">
            <h4 className="text-lg font-semibold text-white">{name}</h4>
            <p className="text-lg font-semibold text-white/90">{price}</p>
        </div>
        {description && <p className="text-sm text-white/70 mt-1">{description}</p>}
    </motion.div>
  );

  const MenuSection = ({ title, items, image }) => (
    <AnimatedSection id={title.toLowerCase()} className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${image ? '' : 'lg:grid-cols-1'}`}>
          <div className={image ? 'lg:order-2' : ''}>
            <BlurText
              text={title}
              delay={70}
              className="text-3xl md:text-4xl font-headline font-bold mb-8 text-white justify-start"
            />
            <div className="flex flex-col">
              {items.map((item, index) => <MenuItem key={index} {...item} />)}
            </div>
          </div>
          {image && (
            <motion.div 
                className="relative aspect-square rounded-lg overflow-hidden shadow-2xl lg:order-1"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
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
                 <BlurText
                    text={translations.restaurantTitle}
                    delay={70}
                    className="text-4xl md:text-6xl font-headline font-bold mb-4 text-white justify-center"
                  />
                  <BlurText
                    text="O experiență culinară desăvârșită"
                    delay={30}
                    className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed justify-center"
                  />
               </div>
            </div>
          </div>
        </motion.div>
        
        <div className="bg-primary text-white">
            <MenuSection {...menuData.appetizers} />
            <MenuSection {...menuData.mainCourses} />
            <MenuSection {...menuData.desserts} />
            <MenuSection {...menuData.drinks} />
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default MenuPage;

    