'use client';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { LanguageContext } from '@/contexts/language-context';
import Link from 'next/link';

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const { navLinks } = useContext(LanguageContext);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' }
    },
    exit: { 
      x: '-100%', 
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' }
    },
  };

  const navListVariants = {
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            style={{ 
              isolation: 'isolate',
              zIndex: 60,
             }}
          />
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 h-full w-[300px] sm:w-[400px] bg-background flex flex-col"
            style={{ 
              isolation: 'isolate',
              zIndex: 70,
            }}
          >
            <div className="p-4 border-b flex flex-row justify-between items-center">
              <h2 className="font-headline text-foreground text-lg">Hotel Maxim</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <motion.nav 
              initial="hidden"
              animate="visible"
              variants={navListVariants}
              className="flex-grow p-4"
            >
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <motion.li key={link.href} variants={navItemVariants}>
                    <Link
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-300"
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default MobileMenu;
