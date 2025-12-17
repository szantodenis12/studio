
'use client';

import { useState, useEffect } from 'react';
import { Accessibility, Palette, ZoomIn, Link as LinkIcon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

export default function AccessibilityDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isTextLarge, setIsTextLarge] = useState(false);
  const [areLinksHighlighted, setAreLinksHighlighted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (isTextLarge) {
      root.classList.add('text-large');
    } else {
      root.classList.remove('text-large');
    }
  }, [isTextLarge]);
  
  useEffect(() => {
    const root = document.documentElement;
    if (areLinksHighlighted) {
      root.classList.add('links-highlighted');
    } else {
      root.classList.remove('links-highlighted');
    }
  }, [areLinksHighlighted]);


  const dockVariants = {
    hidden: { opacity: 0, scale: 0.8, originX: 0, originY: 1 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0.8, originX: 0, originY: 1, transition: { duration: 0.2 } },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.3,
        ease: 'easeOut',
        staggerChildren: 0.05,
        delayChildren: 0.1,
      } 
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="fixed bottom-4 left-4 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-2 w-56 bg-background/80 backdrop-blur-lg rounded-lg border shadow-lg p-2 flex flex-col items-start gap-1"
          >
            <motion.h4 variants={itemVariants} className="font-bold text-sm px-2 py-1 text-foreground">Accesibilitate</motion.h4>
            <motion.button 
              variants={itemVariants} 
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={cn("w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-foreground", isHighContrast && "bg-accent font-bold")}
            >
              <Palette className="w-4 h-4" /> Contrast Ridicat
            </motion.button>
            <motion.button 
              variants={itemVariants} 
              onClick={() => setIsTextLarge(!isTextLarge)}
              className={cn("w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-foreground", isTextLarge && "bg-accent font-bold")}
            >
              <ZoomIn className="w-4 h-4" /> Mărește Text
            </motion.button>
            <motion.button 
              variants={itemVariants} 
              onClick={() => setAreLinksHighlighted(!areLinksHighlighted)}
              className={cn("w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-foreground", areLinksHighlighted && "bg-accent font-bold")}
            >
              <LinkIcon className="w-4 h-4" /> Evidențiază Linkuri
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout>
        <Button
          size="icon"
          className={cn(
            "rounded-full w-14 h-14 shadow-2xl transition-colors duration-300",
            isOpen ? 'bg-primary text-primary-foreground' : 'bg-black text-white hover:bg-black/80'
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Accessibility Menu"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'x' : 'a11y'}
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Accessibility className="w-6 h-6" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
