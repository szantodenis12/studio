'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type Room = {
  id: string;
  title: string;
  images: ImagePlaceholder[];
};

type RoomGalleryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  initialRoomId: string;
};

const MotionDialogContent = motion(DialogContent);

export default function RoomGalleryModal({
  isOpen,
  onClose,
  rooms,
  initialRoomId,
}: RoomGalleryModalProps) {
  const [activeRoomId, setActiveRoomId] = useState(initialRoomId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveRoomId(initialRoomId);
      setCurrentImageIndex(0);
    }
  }, [isOpen, initialRoomId]);

  const activeRoom = rooms.find((room) => room.id === activeRoomId);
  if (!activeRoom) return null;

  const images = activeRoom.images;

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <MotionDialogContent
            className="bg-black/90 border-0 p-0 w-screen h-screen max-w-full rounded-none flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
          >
            <DialogTitle className="sr-only">{activeRoom.title} Image Gallery</DialogTitle>
            <DialogDescription className="sr-only">
              Navigate through images for {activeRoom.title}. You can also switch to other room galleries.
            </DialogDescription>
            <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
              <div>
                <h3 className="text-white font-headline text-2xl">{activeRoom.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors rounded-full bg-white/10 hover:bg-white/20 p-2"
              >
                <X className="w-6 h-6" />
                <span className="sr-only">Close</span>
              </button>
            </header>

            <div className="flex-grow flex items-center justify-center relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeRoomId}-${currentImageIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <Image
                    src={images[currentImageIndex].imageUrl}
                    alt={images[currentImageIndex].description}
                    fill
                    className="object-contain"
                    data-ai-hint={images[currentImageIndex].imageHint}
                  />
                </motion.div>
              </AnimatePresence>
              
              <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors">
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex justify-center items-center gap-4">
                  {rooms.map(room => (
                    <button 
                      key={room.id}
                      onClick={() => {
                        setActiveRoomId(room.id);
                        setCurrentImageIndex(0);
                      }}
                      className={cn(
                        "font-headline text-sm py-2 px-4 rounded-full transition-colors",
                        activeRoomId === room.id ? "bg-white text-black" : "bg-white/20 text-white hover:bg-white/30"
                      )}
                    >
                      {room.title}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {images.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              currentImageIndex === index ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                          )}
                          aria-label={`Go to image ${index + 1}`}
                      />
                  ))}
                </div>
            </footer>
          </MotionDialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
