
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface MenuItem {
    name: string;
    price: string;
    description?: string;
}

interface MenuPage {
    title: string;
    items: MenuItem[];
}

interface FlipbookMenuProps {
    pages: MenuPage[];
}

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute',
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: 'relative',
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute',
  }),
};

const MenuItemComponent = ({ name, price, description }: MenuItem) => (
    <div className="py-4 border-b border-white/10">
        <div className="flex justify-between items-baseline">
            <h4 className="text-lg font-semibold text-white">{name}</h4>
            <div className="flex-grow border-b-2 border-dotted border-white/20 mx-4"></div>
            <p className="text-lg font-semibold text-white/90">{price}</p>
        </div>
        {description && <p className="text-sm text-white/60 mt-2 font-light">{description}</p>}
    </div>
);


const FlipbookMenu = ({ pages }: FlipbookMenuProps) => {
  const [[currentPage, direction], setCurrentPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setCurrentPage([currentPage + newDirection, newDirection]);
  };
  
  const pageIndex = (currentPage % pages.length + pages.length) % pages.length;
  const currentPageData = pages[pageIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-black/20 rounded-lg p-8 shadow-2xl border border-white/10 min-h-[500px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={pageIndex}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    className="w-full"
                >
                    <h2 className="text-4xl text-center mb-8 text-white">{currentPageData.title}</h2>
                    <div className="flex flex-col">
                        {currentPageData.items.map((item, index) => (
                            <MenuItemComponent key={index} {...item} />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-6">
            <Button
                variant="outline"
                onClick={() => paginate(-1)}
                className="bg-transparent text-white border-white/30 hover:bg-white/10"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Pagina Anterioară
            </Button>
            <p className="text-sm text-white/70">Pagina {pageIndex + 1} / {pages.length}</p>
            <Button
                variant="outline"
                onClick={() => paginate(1)}
                className="bg-transparent text-white border-white/30 hover:bg-white/10"
            >
                Pagina Următoare <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    </div>
  );
};

export default FlipbookMenu;
