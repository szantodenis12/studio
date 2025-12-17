
'use client';

import { useState } from 'react';
import { Accessibility, Palette, ZoomIn, Link as LinkIcon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

export default function AccessibilityDock() {
  const [isOpen, setIsOpen] = useState(false);

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
    // Only show on mobile - hidden on screens medium and larger
    <div className="md:hidden fixed bottom-4 left-4 z-50">
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
            <motion.button variants={itemVariants} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-foreground">
              <Palette className="w-4 h-4" /> Contrast Ridicat
            </motion.button>
            <motion.button variants={itemVariants} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-foreground">
              <ZoomIn className="w-4 h-4" /> Mărește Text
            </motion.button>
            <motion.button variants={itemVariants} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-foreground">
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
            isOpen ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-foreground backdrop-blur-lg'
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
